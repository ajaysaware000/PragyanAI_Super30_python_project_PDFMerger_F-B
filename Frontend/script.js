```javascript
// =========================================================
// PDF.JS CONFIGURATION
// =========================================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


// =========================================================
// VARIABLES
// =========================================================

let pdfFiles = [];

let mergedPdfBytes = null;


// =========================================================
// GET HTML ELEMENTS
// =========================================================

const pdfInput =
    document.getElementById("pdfInput");

const uploadMessage =
    document.getElementById("uploadMessage");

const arrangeSection =
    document.getElementById("arrangeSection");

const currentOrderSection =
    document.getElementById("currentOrderSection");

const viewSection =
    document.getElementById("viewSection");

const mergeSection =
    document.getElementById("mergeSection");

const resultSection =
    document.getElementById("resultSection");

const fileList =
    document.getElementById("fileList");

const currentOrder =
    document.getElementById("currentOrder");

const pdfSelect =
    document.getElementById("pdfSelect");

const selectedPdfName =
    document.getElementById("selectedPdfName");

const pdfViewer =
    document.getElementById("pdfViewer");

const mergeButton =
    document.getElementById("mergeButton");

const mergeMessage =
    document.getElementById("mergeMessage");

const mergedPdfViewer =
    document.getElementById("mergedPdfViewer");

const downloadButton =
    document.getElementById("downloadButton");


// =========================================================
// UPLOAD PDF FILES
// =========================================================

pdfInput.addEventListener(
    "change",
    function () {

        const selectedFiles =
            Array.from(pdfInput.files);


        // No files selected

        if (selectedFiles.length === 0) {

            return;

        }


        // Check PDF files

        const invalidFiles =
            selectedFiles.filter(
                file =>
                    file.type !== "application/pdf"
            );


        if (invalidFiles.length > 0) {

            uploadMessage.textContent =
                "❌ Please select only PDF files.";

            uploadMessage.className =
                "error-message";

            pdfInput.value = "";

            return;

        }


        // Minimum 2 PDF files

        if (selectedFiles.length < 2) {

            uploadMessage.textContent =
                "⚠️ Please select at least 2 PDF files.";

            uploadMessage.className =
                "error-message";

            return;

        }


        // Store PDF files

        pdfFiles =
            selectedFiles;


        // Clear previous result

        mergedPdfBytes = null;

        resultSection.classList.add(
            "hidden"
        );


        uploadMessage.textContent =
            `✅ ${pdfFiles.length} PDF files uploaded successfully.`;

        uploadMessage.className =
            "success-message";


        // Update interface

        updateFileList();

        updateCurrentOrder();

        updatePDFSelect();


        // Show sections

        arrangeSection.classList.remove(
            "hidden"
        );

        currentOrderSection.classList.remove(
            "hidden"
        );

        viewSection.classList.remove(
            "hidden"
        );

        mergeSection.classList.remove(
            "hidden"
        );


        // Display first PDF

        pdfSelect.value = "0";

        displaySelectedPDF();

    }
);


// =========================================================
// UPDATE FILE LIST
// =========================================================

function updateFileList() {

    fileList.innerHTML = "";


    pdfFiles.forEach(
        function (file, index) {

            const fileItem =
                document.createElement("div");

            fileItem.className =
                "file-item";


            // Number

            const number =
                document.createElement("div");

            number.className =
                "file-number";

            number.textContent =
                index + 1;


            // File name

            const fileName =
                document.createElement("div");

            fileName.className =
                "file-name";

            fileName.textContent =
                "📄 " + file.name;


            // UP BUTTON

            const upButton =
                document.createElement("button");

            upButton.className =
                "order-button";

            upButton.textContent =
                "⬆️";

            upButton.disabled =
                index === 0;


            upButton.addEventListener(
                "click",
                function () {

                    moveFileUp(index);

                }
            );


            // DOWN BUTTON

            const downButton =
                document.createElement("button");

            downButton.className =
                "order-button";

            downButton.textContent =
                "⬇️";

            downButton.disabled =
                index === pdfFiles.length - 1;


            downButton.addEventListener(
                "click",
                function () {

                    moveFileDown(index);

                }
            );


            fileItem.appendChild(
                number
            );

            fileItem.appendChild(
                fileName
            );

            fileItem.appendChild(
                upButton
            );

            fileItem.appendChild(
                downButton
            );


            fileList.appendChild(
                fileItem
            );

        }
    );

}


// =========================================================
// MOVE FILE UP
// =========================================================

function moveFileUp(index) {

    if (index <= 0) {

        return;

    }


    const temporary =
        pdfFiles[index - 1];


    pdfFiles[index - 1] =
        pdfFiles[index];


    pdfFiles[index] =
        temporary;


    refreshAfterOrderChange();

}


// =========================================================
// MOVE FILE DOWN
// =========================================================

function moveFileDown(index) {

    if (
        index >=
        pdfFiles.length - 1
    ) {

        return;

    }


    const temporary =
        pdfFiles[index + 1];


    pdfFiles[index + 1] =
        pdfFiles[index];


    pdfFiles[index] =
        temporary;


    refreshAfterOrderChange();

}


// =========================================================
// REFRESH AFTER ARRANGING FILES
// =========================================================

function refreshAfterOrderChange() {

    updateFileList();

    updateCurrentOrder();

    updatePDFSelect();


    // Clear previous merged PDF

    mergedPdfBytes = null;

    resultSection.classList.add(
        "hidden"
    );


    // Display first PDF

    pdfSelect.value = "0";

    displaySelectedPDF();

}


// =========================================================
// UPDATE CURRENT FILE ORDER
// =========================================================

function updateCurrentOrder() {

    currentOrder.innerHTML = "";


    pdfFiles.forEach(
        function (file, index) {

            const item =
                document.createElement("div");

            item.className =
                "order-item";


            item.innerHTML =
                `<strong>${index + 1}.</strong>
                 📄 ${file.name}`;


            currentOrder.appendChild(
                item
            );

        }
    );

}


// =========================================================
// UPDATE PDF SELECT
// =========================================================

function updatePDFSelect() {

    pdfSelect.innerHTML = "";


    pdfFiles.forEach(
        function (file, index) {

            const option =
                document.createElement("option");


            option.value =
                index;


            option.textContent =
                `PDF ${index + 1} - ${file.name}`;


            pdfSelect.appendChild(
                option
            );

        }
    );

}


// =========================================================
// PDF SELECT CHANGE
// =========================================================

pdfSelect.addEventListener(
    "change",
    function () {

        displaySelectedPDF();

    }
);


// =========================================================
// DISPLAY SELECTED PDF
// =========================================================

async function displaySelectedPDF() {

    const index =
        Number(pdfSelect.value);


    const file =
        pdfFiles[index];


    if (!file) {

        return;

    }


    selectedPdfName.textContent =
        `📄 ${file.name}`;


    pdfViewer.innerHTML =
        "<p>Loading PDF...</p>";


    try {

        const arrayBuffer =
            await file.arrayBuffer();


        const pdf =
            await pdfjsLib
                .getDocument({
                    data: arrayBuffer
                })
                .promise;


        pdfViewer.innerHTML = "";


        // Display every page

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            await renderPDFPage(
                pdf,
                pageNumber,
                pdfViewer
            );

        }

    }

    catch (error) {

        pdfViewer.innerHTML =
            `<div class="error-message">
                ❌ Error displaying PDF:
                ${error.message}
            </div>`;

    }

}


// =========================================================
// RENDER PDF PAGE
// =========================================================

async function renderPDFPage(
    pdf,
    pageNumber,
    container
) {

    const page =
        await pdf.getPage(
            pageNumber
        );


    const scale = 1.5;


    const viewport =
        page.getViewport({
            scale: scale
        });


    // Page container

    const pageContainer =
        document.createElement("div");

    pageContainer.className =
        "pdf-page";


    // Canvas

    const canvas =
        document.createElement("canvas");


    const context =
        canvas.getContext("2d");


    canvas.width =
        viewport.width;

    canvas.height =
        viewport.height;


    // Page number

    const pageNumberText =
        document.createElement("div");

    pageNumberText.className =
        "page-number";

    pageNumberText.textContent =
        `Page ${pageNumber}`;


    pageContainer.appendChild(
        canvas
    );

    pageContainer.appendChild(
        pageNumberText
    );


    container.appendChild(
        pageContainer
    );


    // Render

    await page.render({

        canvasContext:
            context,

        viewport:
            viewport

    }).promise;

}


// =========================================================
// MERGE PDF
// =========================================================

mergeButton.addEventListener(
    "click",
    async function () {

        if (pdfFiles.length < 2) {

            mergeMessage.textContent =
                "⚠️ Please upload at least 2 PDF files.";

            mergeMessage.className =
                "error-message";

            return;

        }


        try {

            mergeButton.disabled =
                true;


            mergeButton.textContent =
                "⏳ Merging PDF...";


            // Create new PDF

            const mergedPdf =
                await PDFLib
                    .PDFDocument
                    .create();


            // Process files in current order

            for (
                const file of pdfFiles
            ) {

                const fileBytes =
                    await file.arrayBuffer();


                const sourcePdf =
                    await PDFLib
                        .PDFDocument
                        .load(
                            fileBytes
                        );


                const pageIndices =
                    sourcePdf.getPageIndices();


                const copiedPages =
                    await mergedPdf.copyPages(
                        sourcePdf,
                        pageIndices
                    );


                copiedPages.forEach(
                    function (page) {

                        mergedPdf.addPage(
                            page
                        );

                    }
                );

            }


            // Save PDF

            mergedPdfBytes =
                await mergedPdf.save();


            // Create Blob

            const blob =
                new Blob(
                    [mergedPdfBytes],
                    {
                        type:
                            "application/pdf"
                    }
                );


            // Create download URL

            const url =
                URL.createObjectURL(
                    blob
                );


            downloadButton.href =
                url;


            // Show success

            mergeMessage.textContent =
                "✅ PDF files merged successfully!";

            mergeMessage.className =
                "success-message";


            // Show result section

            resultSection.classList.remove(
                "hidden"
            );


            // Display merged PDF

            await displayMergedPDF(
                mergedPdfBytes
            );


            // Scroll to result

            resultSection.scrollIntoView({
                behavior: "smooth"
            });

        }

        catch (error) {

            mergeMessage.textContent =
                "❌ Error while merging PDF: " +
                error.message;

            mergeMessage.className =
                "error-message";

        }


        finally {

            mergeButton.disabled =
                false;

            mergeButton.textContent =
                "🔗 Merge PDF";

        }

    }
);


// =========================================================
// DISPLAY MERGED PDF
// =========================================================

async function displayMergedPDF(
    pdfBytes
) {

    mergedPdfViewer.innerHTML =
        "<p>Loading merged PDF...</p>";


    try {

        const pdf =
            await pdfjsLib
                .getDocument({
                    data: pdfBytes
                })
                .promise;


        mergedPdfViewer.innerHTML = "";


        // Render every page

        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            await renderPDFPage(
                pdf,
                pageNumber,
                mergedPdfViewer
            );

        }

    }

    catch (error) {

        mergedPdfViewer.innerHTML =
            `<div class="error-message">
                ❌ Error displaying merged PDF:
                ${error.message}
            </div>`;

    }

}
```
