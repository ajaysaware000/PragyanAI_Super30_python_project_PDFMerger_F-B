```javascript
// ============================================================
// PDF MERGER JAVASCRIPT
// ============================================================

// FastAPI backend URL
const API_URL = "http://127.0.0.1:8000";


// ============================================================
// GLOBAL VARIABLES
// ============================================================

// Stores all uploaded PDF files
let pdfFiles = [];

// Stores the currently selected file index
let selectedIndex = -1;


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const pdfInput = document.getElementById("pdfFiles");

const uploadButton = document.getElementById("uploadButton");

const fileList = document.getElementById("fileList");

const fileCount = document.getElementById("fileCount");

const currentFile = document.getElementById("currentFile");

const pdfPreview = document.getElementById("pdfPreview");

const moveUpButton = document.getElementById("moveUpButton");

const moveDownButton = document.getElementById("moveDownButton");

const removeButton = document.getElementById("removeButton");

const clearButton = document.getElementById("clearButton");

const mergeButton = document.getElementById("mergeButton");

const uploadMessage = document.getElementById("uploadMessage");

const mergeMessage = document.getElementById("mergeMessage");

const downloadContainer =
    document.getElementById("downloadContainer");

const downloadButton =
    document.getElementById("downloadButton");

const apiStatus =
    document.getElementById("apiStatus");

const statusIndicator =
    document.getElementById("statusIndicator");

const swaggerLink =
    document.getElementById("swaggerLink");


// ============================================================
// FILE SIZE FORMAT
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

    const i =
        Math.floor(
            Math.log(bytes) / Math.log(1024)
        );

    return (
        (bytes / Math.pow(1024, i)).toFixed(2)
        + " "
        + units[i]
    );
}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(element, message, type) {

    element.textContent = message;

    element.className = "message " + type;

}


// ============================================================
// HIDE MESSAGE
// ============================================================

function hideMessage(element) {

    element.textContent = "";

    element.className = "message";

}


// ============================================================
// ADD PDF FILES
// ============================================================

uploadButton.addEventListener("click", function () {

    pdfInput.click();

});


// ============================================================
// WHEN FILES ARE SELECTED
// ============================================================

pdfInput.addEventListener("change", function () {

    const selectedFiles =
        Array.from(pdfInput.files);


    if (selectedFiles.length === 0) {
        return;
    }


    let addedCount = 0;


    selectedFiles.forEach(function (file) {

        // Check PDF type
        const isPDF =
            file.type === "application/pdf"
            ||
            file.name.toLowerCase().endsWith(".pdf");


        if (!isPDF) {

            return;

        }


        // Avoid duplicate file objects
        const duplicate =
            pdfFiles.some(function (existingFile) {

                return (
                    existingFile.name === file.name
                    &&
                    existingFile.size === file.size
                );

            });


        if (!duplicate) {

            pdfFiles.push(file);

            addedCount++;

        }

    });


    if (addedCount > 0) {

        showMessage(
            uploadMessage,
            addedCount + " PDF file(s) added successfully.",
            "success"
        );

    }
    else {

        showMessage(
            uploadMessage,
            "No new PDF files were added.",
            "info"
        );

    }


    // Reset input
    pdfInput.value = "";


    // Display files
    renderFileList();


    // Select first file automatically
    if (selectedIndex === -1 && pdfFiles.length > 0) {

        selectFile(0);

    }

});


// ============================================================
// DISPLAY FILE LIST
// ============================================================

function renderFileList() {

    fileList.innerHTML = "";


    // No files
    if (pdfFiles.length === 0) {

        fileCount.textContent = "0 files";


        fileList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    📄
                </div>

                <p>
                    No PDF files uploaded yet.
                </p>

            </div>

        `;

        return;

    }


    // File count
    fileCount.textContent =
        pdfFiles.length
        +
        (
            pdfFiles.length === 1
                ? " file"
                : " files"
        );


    // Create every file item
    pdfFiles.forEach(function (file, index) {

        const fileItem =
            document.createElement("div");


        fileItem.className =
            "file-item"
            +
            (
                index === selectedIndex
                    ? " selected"
                    : ""
            );


        fileItem.innerHTML = `

            <div class="file-number">
                ${index + 1}
            </div>

            <div class="file-icon">
                📄
            </div>

            <div class="file-info">

                <div class="file-name">
                    ${escapeHTML(file.name)}
                </div>

                <div class="file-size">
                    ${formatFileSize(file.size)}
                </div>

            </div>

        `;


        // Click file
        fileItem.addEventListener(
            "click",
            function () {

                selectFile(index);

            }
        );


        fileList.appendChild(fileItem);

    });

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ============================================================
// SELECT FILE
// ============================================================

function selectFile(index) {

    if (
        index < 0
        ||
        index >= pdfFiles.length
    ) {

        return;

    }


    selectedIndex = index;


    const file =
        pdfFiles[index];


    currentFile.textContent =
        file.name;


    // Create temporary browser URL
    const url =
        URL.createObjectURL(file);


    pdfPreview.src = url;


    renderFileList();

}


// ============================================================
// MOVE FILE UP
// ============================================================

moveUpButton.addEventListener(
    "click",
    function () {

        if (selectedIndex <= 0) {

            showMessage(
                uploadMessage,
                "This file is already at the top.",
                "info"
            );

            return;

        }


        // Swap files
        const temp =
            pdfFiles[selectedIndex];


        pdfFiles[selectedIndex] =
            pdfFiles[selectedIndex - 1];


        pdfFiles[selectedIndex - 1] =
            temp;


        // Update selected index
        selectedIndex--;


        renderFileList();

        selectFile(selectedIndex);

    }
);


// ============================================================
// MOVE FILE DOWN
// ============================================================

moveDownButton.addEventListener(
    "click",
    function () {

        if (
            selectedIndex === -1
            ||
            selectedIndex >= pdfFiles.length - 1
        ) {

            showMessage(
                uploadMessage,
                "This file is already at the bottom.",
                "info"
            );

            return;

        }


        // Swap files
        const temp =
            pdfFiles[selectedIndex];


        pdfFiles[selectedIndex] =
            pdfFiles[selectedIndex + 1];


        pdfFiles[selectedIndex + 1] =
            temp;


        // Update selected index
        selectedIndex++;


        renderFileList();

        selectFile(selectedIndex);

    }
);


// ============================================================
// REMOVE SELECTED FILE
// ============================================================

removeButton.addEventListener(
    "click",
    function () {

        if (selectedIndex === -1) {

            showMessage(
                uploadMessage,
                "Please select a PDF file first.",
                "info"
            );

            return;

        }


        const removedFile =
            pdfFiles[selectedIndex];


        pdfFiles.splice(
            selectedIndex,
            1
        );


        if (pdfFiles.length === 0) {

            selectedIndex = -1;

            currentFile.textContent =
                "No file selected";

            pdfPreview.src = "";

        }
        else {

            if (
                selectedIndex >= pdfFiles.length
            ) {

                selectedIndex =
                    pdfFiles.length - 1;

            }

            selectFile(selectedIndex);

        }


        renderFileList();


        showMessage(
            uploadMessage,
            removedFile.name + " removed.",
            "success"
        );

    }
);


// ============================================================
// CLEAR ALL
// ============================================================

clearButton.addEventListener(
    "click",
    function () {

        if (pdfFiles.length === 0) {

            showMessage(
                uploadMessage,
                "There are no files to clear.",
                "info"
            );

            return;

        }


        pdfFiles = [];

        selectedIndex = -1;


        currentFile.textContent =
            "No file selected";


        pdfPreview.src = "";


        downloadContainer.classList.add(
            "hidden"
        );


        hideMessage(mergeMessage);


        renderFileList();


        showMessage(
            uploadMessage,
            "All PDF files have been removed.",
            "success"
        );

    }
);


// ============================================================
// MERGE PDF
// ============================================================

mergeButton.addEventListener(
    "click",
    async function () {

        // Check file count
        if (pdfFiles.length < 2) {

            showMessage(
                mergeMessage,
                "Please upload at least 2 PDF files.",
                "error"
            );

            return;

        }


        // Disable button
        mergeButton.disabled = true;

        mergeButton.textContent =
            "⏳ Merging PDFs...";


        showMessage(
            mergeMessage,
            "Uploading and merging " +
            pdfFiles.length +
            " PDF files...",
            "info"
        );


        try {

            // Create FormData
            const formData =
                new FormData();


            // IMPORTANT:
            // Append ALL PDF files
            pdfFiles.forEach(function (file) {

                formData.append(
                    "files",
                    file
                );

            });


            // Call FastAPI
            const response =
                await fetch(
                    API_URL + "/merge",
                    {
                        method: "POST",
                        body: formData
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Server returned HTTP " +
                    response.status
                );

            }


            // Get merged PDF
            const blob =
                await response.blob();


            // Create download URL
            const downloadURL =
                URL.createObjectURL(blob);


            downloadButton.href =
                downloadURL;


            downloadButton.download =
                "merged.pdf";


            downloadContainer.classList.remove(
                "hidden"
            );


            showMessage(
                mergeMessage,
                "PDF files merged successfully!",
                "success"
            );

        }
        catch (error) {

            console.error(error);


            showMessage(
                mergeMessage,
                "Failed to merge PDFs. Make sure FastAPI is running.",
                "error"
            );

        }
        finally {

            mergeButton.disabled = false;

            mergeButton.textContent =
                "🔗 Merge PDF Files";

        }

    }
);


// ============================================================
// CHECK FASTAPI STATUS
// ============================================================

async function checkAPIStatus() {

    try {

        const response =
            await fetch(
                API_URL + "/health"
            );


        if (!response.ok) {

            throw new Error(
                "Backend unavailable"
            );

        }


        const data =
            await response.json();


        apiStatus.textContent =
            data.message
            ||
            "Backend is running";


        statusIndicator.className =
            "status-indicator online";


        statusIndicator.textContent =
            "●";


    }
    catch (error) {

        apiStatus.textContent =
            "Backend is offline";


        statusIndicator.className =
            "status-indicator offline";


        statusIndicator.textContent =
            "●";

    }

}


// ============================================================
// SWAGGER LINK
// ============================================================

swaggerLink.href =
    API_URL + "/docs";


// ============================================================
// INITIALIZE
// ============================================================

renderFileList();

checkAPIStatus();
```
