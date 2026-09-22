/* =========================================================
   PRAGYANAI PDF STUDIO
   FASTAPI PDF + IMAGE MERGER
========================================================= */


/* =========================================================
   ELEMENTS
========================================================= */

const fileInput = document.getElementById("fileInput");
const browseBtn = document.getElementById("browseBtn");
const dropZone = document.getElementById("dropZone");

const fileList = document.getElementById("fileList");
const fileCount = document.getElementById("fileCount");

const clearBtn = document.getElementById("clearBtn");
const mergeBtn = document.getElementById("mergeBtn");

const successMessage = document.getElementById("successMessage");
const successText = document.getElementById("successText");

const mergedFileArea =
    document.getElementById("mergedFileArea");

const viewMergedBtn =
    document.getElementById("viewMergedBtn");

const downloadBtn =
    document.getElementById("downloadBtn");


/* =========================================================
   FASTAPI API URL
========================================================= */

/*
   If HTML and FastAPI are running on the same server:
   
       const API_URL = "/api/merge";

   If FastAPI is running separately on localhost:8000:
   
       const API_URL = "http://127.0.0.1:8000/api/merge";
*/

const API_URL =
    "http://127.0.0.1:8000/api/merge";


/* =========================================================
   VARIABLES
========================================================= */

let files = [];

let mergedPdfBlob = null;

let mergedPdfUrl = null;


/* =========================================================
   BROWSE BUTTON
========================================================= */

browseBtn.addEventListener(
    "click",
    function () {

        fileInput.click();

    }
);


/* =========================================================
   FILE INPUT
========================================================= */

fileInput.addEventListener(
    "change",
    function (event) {

        const selectedFiles =
            Array.from(event.target.files);

        addFiles(selectedFiles);

        /*
           Reset the input.

           This allows the same file to be
           selected again.
        */

        fileInput.value = "";

    }
);


/* =========================================================
   ADD FILES
========================================================= */

function addFiles(selectedFiles) {

    const validFiles =
        selectedFiles.filter(
            function (file) {

                return isSupportedFile(file);

            }
        );


    if (validFiles.length === 0) {

        showMessage(
            "Please select PDF, JPG, JPEG or PNG files.",
            "error"
        );

        return;

    }


    validFiles.forEach(
        function (file) {

            files.push(file);

        }
    );


    renderFileList();


    showMessage(
        validFiles.length +
        " file(s) added successfully.",
        "success"
    );

}


/* =========================================================
   CHECK FILE TYPE
========================================================= */

function isSupportedFile(file) {

    const allowedTypes = [

        "application/pdf",

        "image/jpeg",

        "image/png"

    ];


    /*
       Some browsers may not correctly
       provide the MIME type.

       Therefore also check extension.
    */

    const fileName =
        file.name.toLowerCase();


    const allowedExtensions = [

        ".pdf",
        ".jpg",
        ".jpeg",
        ".png"

    ];


    const extensionAllowed =
        allowedExtensions.some(
            function (extension) {

                return fileName.endsWith(
                    extension
                );

            }
        );


    return (
        allowedTypes.includes(file.type) ||
        extensionAllowed
    );

}


/* =========================================================
   DRAG & DROP
========================================================= */

dropZone.addEventListener(
    "dragover",
    function (event) {

        event.preventDefault();

        dropZone.classList.add(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "dragleave",
    function () {

        dropZone.classList.remove(
            "dragover"
        );

    }
);


dropZone.addEventListener(
    "drop",
    function (event) {

        event.preventDefault();

        dropZone.classList.remove(
            "dragover"
        );


        const droppedFiles =
            Array.from(
                event.dataTransfer.files
            );


        addFiles(droppedFiles);

    }
);


/* =========================================================
   RENDER FILE LIST
========================================================= */

function renderFileList() {

    fileList.innerHTML = "";


    files.forEach(
        function (file, index) {

            const fileItem =
                document.createElement(
                    "div"
                );

            fileItem.className =
                "file-item";


            /* ============================
               FILE NUMBER
            ============================ */

            const number =
                document.createElement(
                    "div"
                );

            number.className =
                "file-number";

            number.textContent =
                index + 1;


            /* ============================
               FILE ICON
            ============================ */

            const icon =
                document.createElement(
                    "div"
                );

            icon.className =
                "file-icon";


            if (
                file.type ===
                "application/pdf" ||
                file.name.toLowerCase()
                    .endsWith(".pdf")
            ) {

                icon.textContent = "📄";

            } else {

                icon.textContent = "🖼️";

            }


            /* ============================
               FILE INFORMATION
            ============================ */

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "file-info";


            const name =
                document.createElement(
                    "div"
                );

            name.className =
                "file-name";

            name.textContent =
                file.name;


            const size =
                document.createElement(
                    "div"
                );

            size.className =
                "file-size";

            size.textContent =
                formatFileSize(
                    file.size
                );


            info.appendChild(name);

            info.appendChild(size);


            /* ============================
               ACTION BUTTONS
            ============================ */

            const actions =
                document.createElement(
                    "div"
                );

            actions.className =
                "file-actions";


            /* MOVE UP */

            const upBtn =
                document.createElement(
                    "button"
                );

            upBtn.className =
                "file-action-btn";

            upBtn.innerHTML = "↑";

            upBtn.title =
                "Move up";


            upBtn.addEventListener(
                "click",
                function () {

                    moveFile(
                        index,
                        -1
                    );

                }
            );


            /* MOVE DOWN */

            const downBtn =
                document.createElement(
                    "button"
                );

            downBtn.className =
                "file-action-btn";

            downBtn.innerHTML = "↓";

            downBtn.title =
                "Move down";


            downBtn.addEventListener(
                "click",
                function () {

                    moveFile(
                        index,
                        1
                    );

                }
            );


            /* REMOVE */

            const removeBtn =
                document.createElement(
                    "button"
                );

            removeBtn.className =
                "file-action-btn remove-btn";

            removeBtn.innerHTML =
                "✕";

            removeBtn.title =
                "Remove file";


            removeBtn.addEventListener(
                "click",
                function () {

                    removeFile(index);

                }
            );


            actions.appendChild(upBtn);

            actions.appendChild(downBtn);

            actions.appendChild(removeBtn);


            /* ============================
               ADD TO FILE ITEM
            ============================ */

            fileItem.appendChild(
                number
            );

            fileItem.appendChild(
                icon
            );

            fileItem.appendChild(
                info
            );

            fileItem.appendChild(
                actions
            );


            fileList.appendChild(
                fileItem
            );

        }
    );


    updateUI();

}


/* =========================================================
   MOVE FILE
========================================================= */

function moveFile(
    index,
    direction
) {

    const newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >= files.length
    ) {

        return;

    }


    const temp =
        files[index];


    files[index] =
        files[newIndex];


    files[newIndex] =
        temp;


    renderFileList();

}


/* =========================================================
   REMOVE FILE
========================================================= */

function removeFile(index) {

    files.splice(
        index,
        1
    );


    renderFileList();


    /*
       Previous merged PDF is no longer
       valid because file list changed.
    */

    clearMergedFile();


    showMessage(
        "File removed.",
        "success"
    );

}


/* =========================================================
   CLEAR ALL
========================================================= */

clearBtn.addEventListener(
    "click",
    function () {

        if (
            files.length === 0
        ) {

            return;

        }


        files = [];


        renderFileList();


        clearMergedFile();


        showMessage(
            "All files have been cleared.",
            "success"
        );

    }
);


/* =========================================================
   CLEAR MERGED FILE
========================================================= */

function clearMergedFile() {

    mergedPdfBlob = null;


    if (mergedPdfUrl) {

        URL.revokeObjectURL(
            mergedPdfUrl
        );

        mergedPdfUrl = null;

    }


    mergedFileArea.classList.remove(
        "show"
    );

}


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    fileCount.textContent =
        files.length;


    /*
       Require minimum 2 files
       for merging.
    */

    if (files.length >= 2) {

        mergeBtn.disabled =
            false;

    } else {

        mergeBtn.disabled =
            true;

    }

}


/* =========================================================
   FORMAT FILE SIZE
========================================================= */

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
        parseFloat(
            (
                bytes /
                Math.pow(
                    1024,
                    index
                )
            ).toFixed(2)
        )
        +
        " "
        +
        units[index]
    );

}


/* =========================================================
   SUCCESS / ERROR MESSAGE
========================================================= */

function showMessage(
    message,
    type = "success"
) {

    successText.textContent =
        message;


    successMessage.classList.add(
        "show"
    );


    if (
        type === "error"
    ) {

        successMessage.style.background =
            "#fef2f2";

        successMessage.style.color =
            "#b91c1c";

        successMessage.style.borderColor =
            "#fecaca";

    } else {

        successMessage.style.background =
            "#ecfdf5";

        successMessage.style.color =
            "#047857";

        successMessage.style.borderColor =
            "#a7f3d0";

    }


    setTimeout(
        function () {

            successMessage.classList.remove(
                "show"
            );

        },
        3500
    );

}


/* =========================================================
   MERGE FILES USING FASTAPI
========================================================= */

mergeBtn.addEventListener(
    "click",
    async function () {

        if (files.length < 2) {

            showMessage(
                "Please add at least two files.",
                "error"
            );

            return;

        }


        /*
           Disable button while API
           is processing files.
        */

        mergeBtn.disabled =
            true;


        mergeBtn.querySelector(
            "span"
        ).textContent =
            "Merging...";


        try {

            /*
               FormData is used to send
               files to FastAPI.
            */

            const formData =
                new FormData();


            /*
               Add files in the EXACT
               order shown in the UI.

               FastAPI receives them
               in this order.
            */

            files.forEach(
                function (file) {

                    formData.append(
                        "files",
                        file
                    );

                }
            );


            /*
               Send files to FastAPI.
            */

            const response =
                await fetch(
                    API_URL,
                    {
                        method: "POST",

                        body: formData
                    }
                );


            /*
               Check HTTP status.
            */

            if (!response.ok) {

                let errorMessage =
                    "Unable to merge files.";

                try {

                    const errorData =
                        await response.json();

                    if (
                        errorData.detail
                    ) {

                        errorMessage =
                            errorData.detail;

                    }

                } catch (error) {

                    console.log(
                        "Error response was not JSON."
                    );

                }


                throw new Error(
                    errorMessage
                );

            }


            /*
               FastAPI returns the
               merged PDF as Blob.
            */

            const blob =
                await response.blob();


            if (
                blob.size === 0
            ) {

                throw new Error(
                    "The server returned an empty PDF."
                );

            }


            /*
               Store merged PDF.
            */

            mergedPdfBlob =
                blob;


            /*
               Create browser URL.
            */

            if (mergedPdfUrl) {

                URL.revokeObjectURL(
                    mergedPdfUrl
                );

            }


            mergedPdfUrl =
                URL.createObjectURL(
                    mergedPdfBlob
                );


            /*
               Display "Merged PDF Ready".
            */

            mergedFileArea.classList.add(
                "show"
            );


            showMessage(
                "PDF merged successfully!",
                "success"
            );


        } catch (error) {

            console.error(
                "FastAPI merge error:",
                error
            );


            showMessage(
                error.message ||
                "Unable to connect to FastAPI.",
                "error"
            );

        }


        /*
           Restore merge button.
        */

        mergeBtn.disabled =
            files.length < 2;


        mergeBtn.querySelector(
            "span"
        ).textContent =
            "Merge Files";

    }
);


/* =========================================================
   VIEW MERGED PDF
========================================================= */

viewMergedBtn.addEventListener(
    "click",
    function () {

        if (!mergedPdfUrl) {

            showMessage(
                "Please merge the files first.",
                "error"
            );

            return;

        }


        /*
           Open merged PDF
           in a new browser tab.
        */

        window.open(
            mergedPdfUrl,
            "_blank"
        );

    }
);


/* =========================================================
   DOWNLOAD MERGED PDF
========================================================= */

downloadBtn.addEventListener(
    "click",
    function () {

        if (!mergedPdfUrl) {

            showMessage(
                "Please merge the files first.",
                "error"
            );

            return;

        }


        const link =
            document.createElement(
                "a"
            );


        link.href =
            mergedPdfUrl;


        link.download =
            "PragyanAI-Merged.pdf";


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );

    }
);


/* =========================================================
   INITIAL UI
========================================================= */

updateUI();
