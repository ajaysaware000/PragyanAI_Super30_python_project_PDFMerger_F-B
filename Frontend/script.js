/* =========================================================
   PRAGYANAI PDF STUDIO
   PDF + IMAGE MERGER
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

const mergedFileArea = document.getElementById("mergedFileArea");
const viewMergedBtn = document.getElementById("viewMergedBtn");
const downloadBtn = document.getElementById("downloadBtn");


/* =========================================================
   VARIABLES
========================================================= */

let files = [];

let mergedPdfBlob = null;

let mergedPdfUrl = null;


/* =========================================================
   LOAD PDF-LIB
========================================================= */

const pdfLibScript = document.createElement("script");

pdfLibScript.src =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js";

document.head.appendChild(pdfLibScript);


/* =========================================================
   BROWSE BUTTON
========================================================= */

browseBtn.addEventListener("click", function () {

    fileInput.click();

});


/* =========================================================
   FILE INPUT
========================================================= */

fileInput.addEventListener("change", function (event) {

    const selectedFiles = Array.from(event.target.files);

    addFiles(selectedFiles);

    /*
       Reset input value.

       This allows the user to select
       the same file again later.
    */

    fileInput.value = "";

});


/* =========================================================
   ADD FILES
========================================================= */

function addFiles(selectedFiles) {

    const validFiles = selectedFiles.filter(function (file) {

        return isSupportedFile(file);

    });


    if (validFiles.length === 0) {

        showMessage(
            "Please select PDF, JPG, JPEG or PNG files.",
            "error"
        );

        return;

    }


    validFiles.forEach(function (file) {

        files.push(file);

    });


    renderFileList();

    showMessage(
        validFiles.length + " file(s) added successfully.",
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

    return allowedTypes.includes(file.type);

}


/* =========================================================
   DRAG & DROP
========================================================= */

dropZone.addEventListener("dragover", function (event) {

    event.preventDefault();

    dropZone.classList.add("dragover");

});


dropZone.addEventListener("dragleave", function () {

    dropZone.classList.remove("dragover");

});


dropZone.addEventListener("drop", function (event) {

    event.preventDefault();

    dropZone.classList.remove("dragover");

    const droppedFiles =
        Array.from(event.dataTransfer.files);

    addFiles(droppedFiles);

});


/* =========================================================
   RENDER FILE LIST
========================================================= */

function renderFileList() {

    fileList.innerHTML = "";


    files.forEach(function (file, index) {

        const fileItem =
            document.createElement("div");

        fileItem.className = "file-item";


        /* NUMBER */

        const number =
            document.createElement("div");

        number.className = "file-number";

        number.textContent = index + 1;


        /* ICON */

        const icon =
            document.createElement("div");

        icon.className = "file-icon";

        if (file.type === "application/pdf") {

            icon.textContent = "📄";

        } else {

            icon.textContent = "🖼️";

        }


        /* FILE INFO */

        const info =
            document.createElement("div");

        info.className = "file-info";


        const name =
            document.createElement("div");

        name.className = "file-name";

        name.textContent = file.name;


        const size =
            document.createElement("div");

        size.className = "file-size";

        size.textContent =
            formatFileSize(file.size);


        info.appendChild(name);

        info.appendChild(size);


        /* ACTIONS */

        const actions =
            document.createElement("div");

        actions.className = "file-actions";


        /* MOVE UP */

        const upBtn =
            document.createElement("button");

        upBtn.className = "file-action-btn";

        upBtn.innerHTML = "↑";

        upBtn.title = "Move up";

        upBtn.addEventListener(
            "click",
            function () {

                moveFile(index, -1);

            }
        );


        /* MOVE DOWN */

        const downBtn =
            document.createElement("button");

        downBtn.className = "file-action-btn";

        downBtn.innerHTML = "↓";

        downBtn.title = "Move down";

        downBtn.addEventListener(
            "click",
            function () {

                moveFile(index, 1);

            }
        );


        /* REMOVE */

        const removeBtn =
            document.createElement("button");

        removeBtn.className =
            "file-action-btn remove-btn";

        removeBtn.innerHTML = "✕";

        removeBtn.title = "Remove file";

        removeBtn.addEventListener(
            "click",
            function () {

                removeFile(index);

            }
        );


        actions.appendChild(upBtn);

        actions.appendChild(downBtn);

        actions.appendChild(removeBtn);


        fileItem.appendChild(number);

        fileItem.appendChild(icon);

        fileItem.appendChild(info);

        fileItem.appendChild(actions);


        fileList.appendChild(fileItem);

    });


    updateUI();

}


/* =========================================================
   MOVE FILE
========================================================= */

function moveFile(index, direction) {

    const newIndex =
        index + direction;


    if (
        newIndex < 0 ||
        newIndex >= files.length
    ) {

        return;

    }


    const temp = files[index];

    files[index] = files[newIndex];

    files[newIndex] = temp;


    renderFileList();

}


/* =========================================================
   REMOVE FILE
========================================================= */

function removeFile(index) {

    files.splice(index, 1);

    renderFileList();

    showMessage(
        "File removed.",
        "success"
    );

}


/* =========================================================
   CLEAR ALL
========================================================= */

clearBtn.addEventListener("click", function () {

    if (files.length === 0) {

        return;

    }


    files = [];


    renderFileList();


    mergedPdfBlob = null;


    if (mergedPdfUrl) {

        URL.revokeObjectURL(
            mergedPdfUrl
        );

        mergedPdfUrl = null;

    }


    mergedFileArea.classList.remove("show");


    showMessage(
        "All files have been cleared.",
        "success"
    );

});


/* =========================================================
   UPDATE UI
========================================================= */

function updateUI() {

    fileCount.textContent =
        files.length;


    if (files.length >= 2) {

        mergeBtn.disabled = false;

    } else {

        mergeBtn.disabled = true;

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
                Math.pow(1024, index)
            ).toFixed(2)
        )

        + " "

        + units[index]

    );

}


/* =========================================================
   SUCCESS / ERROR MESSAGE
========================================================= */

function showMessage(message, type = "success") {

    successText.textContent =
        message;


    successMessage.classList.add(
        "show"
    );


    if (type === "error") {

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


    setTimeout(function () {

        successMessage.classList.remove(
            "show"
        );

    }, 3500);

}


/* =========================================================
   MERGE FILES
========================================================= */

mergeBtn.addEventListener("click", async function () {

    if (files.length < 2) {

        showMessage(
            "Please add at least two files.",
            "error"
        );

        return;

    }


    /*
       Wait until PDF-LIB is loaded.
    */

    if (!window.PDFLib) {

        showMessage(
            "PDF library is loading. Please try again.",
            "error"
        );

        return;

    }


    mergeBtn.disabled = true;

    mergeBtn.querySelector("span").textContent =
        "Merging...";


    try {

        const {
            PDFDocument
        } = PDFLib;


        const mergedPdf =
            await PDFDocument.create();


        /*
           Process every file
           according to its type.
        */

        for (const file of files) {

            if (
                file.type ===
                "application/pdf"
            ) {

                await addPdfFile(
                    mergedPdf,
                    file
                );

            } else {

                await addImageFile(
                    mergedPdf,
                    file
                );

            }

        }


        /*
           Save final PDF.
        */

        const pdfBytes =
            await mergedPdf.save();


        mergedPdfBlob =
            new Blob(
                [pdfBytes],
                {
                    type: "application/pdf"
                }
            );


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
           Show merged file area.
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
            "Merge error:",
            error
        );


        showMessage(
            "Unable to merge the files.",
            "error"
        );

    }


    mergeBtn.disabled = false;

    mergeBtn.querySelector("span").textContent =
        "Merge Files";

});


/* =========================================================
   ADD PDF FILE
========================================================= */

async function addPdfFile(
    mergedPdf,
    file
) {

    const arrayBuffer =
        await file.arrayBuffer();


    const sourcePdf =
        await PDFLib.PDFDocument.load(
            arrayBuffer
        );


    const pages =
        await mergedPdf.copyPages(
            sourcePdf,
            sourcePdf.getPageIndices()
        );


    pages.forEach(function (page) {

        mergedPdf.addPage(page);

    });

}


/* =========================================================
   ADD IMAGE FILE
========================================================= */

async function addImageFile(
    mergedPdf,
    file
) {

    const imageBytes =
        await file.arrayBuffer();


    let image;


    if (
        file.type ===
        "image/jpeg"
    ) {

        image =
            await mergedPdf.embedJpg(
                imageBytes
            );

    } else {

        image =
            await mergedPdf.embedPng(
                imageBytes
            );

    }


    /*
       Create PDF page according
       to image dimensions.
    */

    const imageWidth =
        image.width;

    const imageHeight =
        image.height;


    const maxWidth = 595;

    const maxHeight = 842;


    let width =
        imageWidth;

    let height =
        imageHeight;


    /*
       Scale image if too large.
    */

    const scale =
        Math.min(
            maxWidth / width,
            maxHeight / height,
            1
        );


    width *= scale;

    height *= scale;


    const page =
        mergedPdf.addPage(
            [width, height]
        );


    page.drawImage(
        image,
        {
            x: 0,
            y: 0,
            width: width,
            height: height
        }
    );

}


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
            document.createElement("a");


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
