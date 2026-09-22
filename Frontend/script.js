```javascript
// ============================================================
// PRAGYANAI PDF STUDIO
// Frontend JavaScript connected with FastAPI
// ============================================================


// ============================================================
// FASTAPI BASE URL
// ============================================================

const API_BASE_URL = "http://127.0.0.1:8000";


// ============================================================
// API ENDPOINTS
// ============================================================

const API = {

    HEALTH: `${API_BASE_URL}/api/health`,

    MERGE: `${API_BASE_URL}/api/merge`,

    FILES: `${API_BASE_URL}/api/files`,

    CLEAR: `${API_BASE_URL}/api/clear`
};


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let selectedFiles = [];

let mergedFileBlob = null;

let mergedFileUrl = null;

let mergedFileName = "PragyanAI-Merged.pdf";


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const fileInput = document.getElementById("fileInput");

const browseBtn = document.getElementById("browseBtn");

const dropZone = document.getElementById("dropZone");

const fileList = document.getElementById("fileList");

const fileCount = document.getElementById("fileCount");

const mergeBtn = document.getElementById("mergeBtn");

const clearBtn = document.getElementById("clearBtn");

const downloadBtn = document.getElementById("downloadBtn");

const viewMergedBtn = document.getElementById("viewMergedBtn");

const mergedFileArea = document.getElementById("mergedFileArea");

const successMessage = document.getElementById("successMessage");


// ============================================================
// SUPPORTED FILE TYPES
// ============================================================

const allowedExtensions = [
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png"
];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {

    checkBackendHealth();

    updateFileList();

});


// ============================================================
// BROWSE FILES
// ============================================================

if (browseBtn) {

    browseBtn.addEventListener("click", () => {

        fileInput.click();

    });

}


// ============================================================
// FILE INPUT
// ============================================================

if (fileInput) {

    fileInput.addEventListener("change", (event) => {

        addFiles(event.target.files);

        // Allow selecting the same file again
        fileInput.value = "";

    });

}


// ============================================================
// DRAG OVER
// ============================================================

if (dropZone) {

    dropZone.addEventListener("dragover", (event) => {

        event.preventDefault();

        dropZone.classList.add("drag-over");

    });


    // ========================================================
    // DRAG LEAVE
    // ========================================================

    dropZone.addEventListener("dragleave", () => {

        dropZone.classList.remove("drag-over");

    });


    // ========================================================
    // DROP FILES
    // ========================================================

    dropZone.addEventListener("drop", (event) => {

        event.preventDefault();

        dropZone.classList.remove("drag-over");

        addFiles(event.dataTransfer.files);

    });

}


// ============================================================
// ADD FILES
// ============================================================

function addFiles(files) {

    for (const file of files) {

        if (!isValidFile(file)) {

            showError(
                `${file.name} is not a supported file.`
            );

            continue;
        }


        // Prevent duplicate files
        const alreadyExists = selectedFiles.some(
            existingFile =>
                existingFile.name === file.name &&
                existingFile.size === file.size
        );


        if (alreadyExists) {

            continue;

        }


        selectedFiles.push(file);

    }


    updateFileList();

}


// ============================================================
// CHECK FILE TYPE
// ============================================================

function isValidFile(file) {

    const fileName = file.name.toLowerCase();

    return allowedExtensions.some(
        extension => fileName.endsWith(extension)
    );

}


// ============================================================
// UPDATE FILE LIST
// ============================================================

function updateFileList() {

    if (!fileList) return;


    fileList.innerHTML = "";


    fileCount.textContent =
        `${selectedFiles.length} file(s)`;


    if (selectedFiles.length === 0) {

        fileList.innerHTML = `
            <div class="empty-files">
                No files selected
            </div>
        `;

        return;

    }


    selectedFiles.forEach((file, index) => {

        const fileItem =
            document.createElement("div");

        fileItem.className = "file-item";


        const extension =
            file.name.split(".").pop().toUpperCase();


        fileItem.innerHTML = `

            <div class="file-info">

                <div class="file-number">
                    ${index + 1}
                </div>

                <div class="file-icon">
                    ${extension === "PDF" ? "📄" : "🖼️"}
                </div>

                <div class="file-details">

                    <div class="file-name">
                        ${escapeHtml(file.name)}
                    </div>

                    <div class="file-size">
                        ${formatFileSize(file.size)}
                    </div>

                </div>

            </div>


            <div class="file-actions">

                <button
                    class="move-up"
                    onclick="moveFileUp(${index})"
                    ${index === 0 ? "disabled" : ""}
                >
                    ↑
                </button>


                <button
                    class="move-down"
                    onclick="moveFileDown(${index})"
                    ${index === selectedFiles.length - 1
                        ? "disabled"
                        : ""}
                >
                    ↓
                </button>


                <button
                    class="remove-file"
                    onclick="removeFile(${index})"
                >
                    ✕
                </button>

            </div>

        `;


        fileList.appendChild(fileItem);

    });

}


// ============================================================
// MOVE FILE UP
// ============================================================

function moveFileUp(index) {

    if (index <= 0) return;


    const temp = selectedFiles[index];

    selectedFiles[index] =
        selectedFiles[index - 1];

    selectedFiles[index - 1] =
        temp;


    updateFileList();

}


// ============================================================
// MOVE FILE DOWN
// ============================================================

function moveFileDown(index) {

    if (index >= selectedFiles.length - 1) return;


    const temp = selectedFiles[index];

    selectedFiles[index] =
        selectedFiles[index + 1];

    selectedFiles[index + 1] =
        temp;


    updateFileList();

}


// ============================================================
// REMOVE FILE
// ============================================================

function removeFile(index) {

    selectedFiles.splice(index, 1);

    updateFileList();

}


// ============================================================
// CLEAR ALL FILES
// ============================================================

if (clearBtn) {

    clearBtn.addEventListener("click", async () => {

        selectedFiles = [];

        mergedFileBlob = null;


        if (mergedFileUrl) {

            URL.revokeObjectURL(mergedFileUrl);

            mergedFileUrl = null;

        }


        updateFileList();

        hideMergedFileArea();

        hideMessage();


        // Tell FastAPI to clear temporary files
        await clearServerFiles();

    });

}


// ============================================================
// MERGE PDF API
// ============================================================

if (mergeBtn) {

    mergeBtn.addEventListener("click", async () => {

        await mergeFiles();

    });

}


// ============================================================
// MERGE FILES
// ============================================================

async function mergeFiles() {

    if (selectedFiles.length < 2) {

        showError(
            "Please select at least 2 files to merge."
        );

        return;

    }


    try {

        mergeBtn.disabled = true;

        mergeBtn.textContent = "Merging...";


        hideMessage();


        // ====================================================
        // CREATE FORM DATA
        // ====================================================

        const formData = new FormData();


        // IMPORTANT:
        // Every file uses the same field name "files"

        selectedFiles.forEach(file => {

            formData.append(
                "files",
                file,
                file.name
            );

        });


        // ====================================================
        // CALL FASTAPI
        // ====================================================

        const response = await fetch(
            API.MERGE,
            {
                method: "POST",
                body: formData
            }
        );


        // ====================================================
        // CHECK RESPONSE
        // ====================================================

        if (!response.ok) {

            let errorMessage =
                "Failed to merge files.";

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {

                    errorMessage =
                        errorData.detail;

                }

            } catch {

                // Response was not JSON
            }


            throw new Error(errorMessage);

        }


        // ====================================================
        // GET MERGED PDF
        // ====================================================

        mergedFileBlob =
            await response.blob();


        // ====================================================
        // CREATE BROWSER URL
        // ====================================================

        if (mergedFileUrl) {

            URL.revokeObjectURL(
                mergedFileUrl
            );

        }


        mergedFileUrl =
            URL.createObjectURL(
                mergedFileBlob
            );


        // ====================================================
        // SHOW RESULT
        // ====================================================

        showMergedFileArea();


        showSuccess(
            "Files merged successfully!"
        );


    } catch (error) {

        console.error(
            "Merge error:",
            error
        );


        showError(
            error.message ||
            "Unable to merge files."
        );


    } finally {

        mergeBtn.disabled = false;

        mergeBtn.textContent = "Merge Files";

    }

}


// ============================================================
// VIEW MERGED PDF
// ============================================================

if (viewMergedBtn) {

    viewMergedBtn.addEventListener("click", () => {

        if (!mergedFileUrl) {

            showError(
                "No merged PDF available."
            );

            return;

        }


        window.open(
            mergedFileUrl,
            "_blank"
        );

    });

}


// ============================================================
// DOWNLOAD MERGED PDF
// ============================================================

if (downloadBtn) {

    downloadBtn.addEventListener("click", () => {

        if (!mergedFileUrl) {

            showError(
                "No merged PDF available."
            );

            return;

        }


        const link =
            document.createElement("a");


        link.href =
            mergedFileUrl;


        link.download =
            mergedFileName;


        document.body.appendChild(link);


        link.click();


        document.body.removeChild(link);

    });

}


// ============================================================
// GET SERVER FILES API
// ============================================================

async function getServerFiles() {

    try {

        const response =
            await fetch(API.FILES);


        if (!response.ok) {

            throw new Error(
                "Unable to get server files."
            );

        }


        const data =
            await response.json();


        console.log(
            "Server files:",
            data
        );


        return data;


    } catch (error) {

        console.error(
            "Files API error:",
            error
        );


        return null;

    }

}


// ============================================================
// VIEW SERVER FILE
// ============================================================

async function viewServerFile(filename) {

    try {

        const url =
            `${API.FILES}/${encodeURIComponent(filename)}`;


        window.open(
            url,
            "_blank"
        );


    } catch (error) {

        console.error(
            "View file error:",
            error
        );

    }

}


// ============================================================
// DELETE SERVER FILE
// ============================================================

async function deleteServerFile(filename) {

    try {

        const url =
            `${API.FILES}/${encodeURIComponent(filename)}`;


        const response =
            await fetch(
                url,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to delete file."
            );

        }


        showSuccess(
            "File deleted successfully."
        );


        return true;


    } catch (error) {

        console.error(
            "Delete API error:",
            error
        );


        showError(
            error.message
        );


        return false;

    }

}


// ============================================================
// CLEAR SERVER FILES API
// ============================================================

async function clearServerFiles() {

    try {

        const response =
            await fetch(
                API.CLEAR,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            console.warn(
                "Server clear failed."
            );

            return false;

        }


        const data =
            await response.json();


        console.log(
            "Server cleared:",
            data
        );


        return true;


    } catch (error) {

        console.error(
            "Clear API error:",
            error
        );


        return false;

    }

}


// ============================================================
// HEALTH CHECK API
// ============================================================

async function checkBackendHealth() {

    try {

        const response =
            await fetch(
                API.HEALTH
            );


        if (!response.ok) {

            throw new Error(
                "Backend is offline."
            );

        }


        const data =
            await response.json();


        console.log(
            "FastAPI status:",
            data
        );


        updateSystemStatus(
            true
        );


    } catch (error) {

        console.error(
            "Health check failed:",
            error
        );


        updateSystemStatus(
            false
        );

    }

}


// ============================================================
// SYSTEM STATUS
// ============================================================

function updateSystemStatus(isOnline) {

    const statusElement =
        document.querySelector(
            ".system-status"
        );


    if (!statusElement) return;


    if (isOnline) {

        statusElement.textContent =
            "System Online";

        statusElement.classList.remove(
            "offline"
        );

        statusElement.classList.add(
            "online"
        );

    } else {

        statusElement.textContent =
            "Backend Offline";

        statusElement.classList.remove(
            "online"
        );

        statusElement.classList.add(
            "offline"
        );

    }

}


// ============================================================
// SHOW MERGED FILE AREA
// ============================================================

function showMergedFileArea() {

    if (mergedFileArea) {

        mergedFileArea.style.display =
            "block";

    }

}


// ============================================================
// HIDE MERGED FILE AREA
// ============================================================

function hideMergedFileArea() {

    if (mergedFileArea) {

        mergedFileArea.style.display =
            "none";

    }

}


// ============================================================
// SUCCESS MESSAGE
// ============================================================

function showSuccess(message) {

    if (!successMessage) return;


    successMessage.textContent =
        message;


    successMessage.style.display =
        "block";


    successMessage.classList.remove(
        "error"
    );


    successMessage.classList.add(
        "success"
    );

}


// ============================================================
// ERROR MESSAGE
// ============================================================

function showError(message) {

    if (!successMessage) {

        alert(message);

        return;

    }


    successMessage.textContent =
        message;


    successMessage.style.display =
        "block";


    successMessage.classList.remove(
        "success"
    );


    successMessage.classList.add(
        "error"
    );

}


// ============================================================
// HIDE MESSAGE
// ============================================================

function hideMessage() {

    if (successMessage) {

        successMessage.style.display =
            "none";

    }

}


// ============================================================
// FORMAT FILE SIZE
// ============================================================

function formatFileSize(bytes) {

    if (bytes === 0) {

        return "0 Bytes";

    }


    const units = [
        "Bytes",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    return (
        bytes /
        Math.pow(1024, index)
    ).toFixed(2) +
    " " +
    units[index];

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHtml(text) {

    const div =
        document.createElement("div");


    div.textContent =
        text;


    return div.innerHTML;

}


// ============================================================
// MAKE FUNCTIONS AVAILABLE TO HTML
// ============================================================

window.moveFileUp =
    moveFileUp;

window.moveFileDown =
    moveFileDown;

window.removeFile =
    removeFile;

window.viewServerFile =
    viewServerFile;

window.deleteServerFile =
    deleteServerFile;

window.getServerFiles =
    getServerFiles;
```
