```javascript
// ============================================================
// PDF.JS CONFIGURATION
// ============================================================

pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


// ============================================================
// VARIABLES
// ============================================================

let pdfFiles = [];

let mergedPdfBytes = null;


// ============================================================
// HTML ELEMENTS
// ============================================================

const pdfInput =
    document.getElementById("pdfInput");

const fileList =
    document.getElementById("fileList");

const arrangeSection =
    document.getElementById("arrangeSection");

const viewSection =
    document.getElementById("viewSection");

const mergeSection =
    document.getElementById("mergeSection");

const resultSection =
    document.getElementById("resultSection");

const pdfSelect =
    document.getElementById("pdfSelect");

const selectedFileName =
    document.getElementById("selectedFileName");

const pdfViewer =
    document.getElementById("pdfViewer");

const mergeOrder =
    document.getElementById("mergeOrder");

const mergeButton =
    document.getElementById("mergeButton");

const mergeMessage =
    document.getElementById("mergeMessage");

const mergedPdfViewer =
    document.getElementById("mergedPdfViewer");

const downloadButton =
    document.getElementById("downloadButton");


// ============================================================
// UPLOAD PDF FILES
// ============================================================

pdfInput.addEventListener(
    "change",
    function () {

        const selectedFiles =
            Array.from(pdfInput.files);

        if (selectedFiles.length === 0) {
            return;
        }


        // Check that all files are PDFs

        const invalidFiles =
            selectedFiles.filter(
                file =>
                    file.type !== "application/pdf"
            );


        if (invalidFiles.length > 0) {

            alert(
                "Please select only PDF files."
            );

            pdfInput.value = "";

            return;
        }


        // Store files

        pdfFiles = selectedFiles;


        // Clear previous result

        mergedPdfBytes = null;

        resultSection.style.display = "none";


        // Update UI

        updateFileList();

        updatePDFSelect();

        updateMergeOrder();


        arrangeSection.style.display =
            "block";

        viewSection.style.display =
            "block";

        mergeSection.style.display =
            "block";


        // Show first PDF

        if (pdfFiles.length > 0) {

            pdfSelect.value = "0";

            displaySelectedPDF();

        }

    }
);


// ============================================================
// DISPLAY FILE LIST
// ============================================================

function updateFileList() {

    fileList.innerHTML = "";


    pdfFiles.forEach(
        (file, index) => {

            const item =
                document.createElement("div");

            item.className =
                "file-item";


            const number =
                document.createElement("div");

            number.className =
                "file-number";

            number.textContent =
                index + 1;


            const name =
                document.createElement("div");

            name.className =
                "file-name";

            name.textContent =
                "📄 " + file.name;


            // UP BUTTON

            const upButton =
                document.createElement("button");

            upButton.className =
                "file-button";

            upButton.textContent =
                "⬆️";

            upButton.disabled =
                index === 0;

            upButton.addEventListener(
                "click",
                () => moveFileUp(index)
            );


            // DOWN BUTTON

            const downButton =
                document.createElement("button");

            downButton.className =
                "file-button";

            downButton.textContent =
                "⬇️";

            downButton.disabled =
                index === pdfFiles.length - 1;

            downButton.addEventListener(
                "click",
                () => moveFileDown(index)
            );


            item.appendChild(number);

            item.appendChild(name);

            item.appendChild(upButton);

            item.appendChild(downButton);


            fileList.appendChild(item);

        }
    );

}


// ============================================================
// MOVE FILE UP
// ============================================================

function moveFileUp(index) {

    if (index === 0) {
        return;
    }


    const temp =
        pdfFiles[index - 1];

    pdfFiles[index - 1] =
        pdfFiles[index];

    pdfFiles[index] =
        temp;


    updateFileList();

    updatePDFSelect();

    updateMergeOrder();

    clearMergedResult();

}


// ============================================================
// MOVE FILE DOWN
// ============================================================

function moveFileDown(index) {

    if (index === pdfFiles.length - 1) {
        return;
    }


    const temp =
        pdfFiles[index + 1];

    pdfFiles[index + 1] =
        pdfFiles[index];

    pdfFiles[index] =
        temp;


    updateFileList();

    updatePDFSelect();

    updateMergeOrder();

    clearMergedResult();

}


// ============================================================
// UPDATE PDF SELECT BOX
// ============================================================

function updatePDFSelect() {

    pdfSelect.innerHTML = "";


    pdfFiles.forEach(
        (file, index) => {

            const option =
                document.createElement("option");

            option.value =
                index;

            option.textContent =
                `PDF ${index + 1} - ${file.name}`;


            pdfSelect.appendChild(option);

        }
    );

}


// ============================================================
// SELECT PDF
// ============================================================

pdfSelect.addEventListener(
    "change",
    function () {

        displaySelectedPDF();

    }
);


// ============================================================
// DISPLAY SELECTED PDF
// ============================================================

async function displaySelectedPDF() {

    const index =
        Number(pdfSelect.value);

    const file =
        pdfFiles[index];


    if (!file) {
        return;
    }


    selectedFileName.textContent =
        `PDF ${index + 1}: ${file.name}`;


    pdfViewer.innerHTML =
        "<p>Loading PDF...</p>";


    try {

        const arrayBuffer =
            await file.arrayBuffer();


        const pdf =
            await pdfjsLib.getDocument(
                {
                    data: arrayBuffer
                }
            ).promise;


        pdfViewer.innerHTML = "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            await renderPage(
                pdf,
                pageNumber,
                pdfViewer
            );

        }

    }

    catch (error) {

        pdfViewer.innerHTML =
            `<p class="message error">
                ❌ Error displaying PDF:
                ${error.message}
            </p>`;

    }

}


// ============================================================
// RENDER PDF PAGE
// ============================================================

async function renderPage(
    pdf,
    pageNumber,
    container
) {

    const page =
        await pdf.getPage(pageNumber);


    const scale = 1.5;


    const viewport =
        page.getViewport(
            {
                scale: scale
            }
        );


    const pageContainer =
        document.createElement("div");

    pageContainer.className =
        "pdf-page";


    const canvas =
        document.createElement("canvas");


    const context =
        canvas.getContext("2d");


    canvas.width =
        viewport.width;

    canvas.height =
        viewport.height;


    const caption =
        document.createElement("div");

    caption.className =
        "page-caption";

    caption.textContent =
        `Page ${pageNumber}`;


    pageContainer.appendChild(
        canvas
    );

    pageContainer.appendChild(
        caption
    );


    container.appendChild(
        pageContainer
    );


    await page.render(
        {
            canvasContext: context,
            viewport: viewport
        }
    ).promise;

}


// ============================================================
// UPDATE MERGE ORDER
// ============================================================

function updateMergeOrder() {

    mergeOrder.innerHTML = "";


    if (pdfFiles.length === 0) {
        return;
    }


    pdfFiles.forEach(
        (file, index) => {

            const item =
                document.createElement("p");

            item.innerHTML =
                `<strong>${index + 1}.</strong>
                 ${file.name}`;


            mergeOrder.appendChild(item);

        }
    );


    if (pdfFiles.length < 2) {

        mergeButton.disabled =
            true;

        mergeMessage.className =
            "message error";

        mergeMessage.style.display =
            "block";

        mergeMessage.textContent =
            "⚠️ Please upload at least 2 PDF files.";

    }

    else {

        mergeButton.disabled =
            false;

        mergeMessage.style.display =
            "none";

    }

}


// ============================================================
// MERGE PDF BUTTON
// ============================================================

mergeButton.addEventListener(
    "click",
    async function () {

        if (pdfFiles.length < 2) {

            showMergeError(
                "⚠️ Please upload at least 2 PDF files."
            );

            return;
        }


        try {

            mergeButton.disabled =
                true;

            mergeButton.textContent =
                "⏳ Merging PDFs...";


            // Create new PDF

            const mergedPdf =
                await PDFLib.PDFDocument.create();


            // Process every uploaded PDF

            for (
                const file of pdfFiles
            ) {

                const fileBytes =
                    await file.arrayBuffer();


                const sourcePdf =
                    await PDFLib.PDFDocument.load(
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
                    page => {

                        mergedPdf.addPage(
                            page
                        );

                    }
                );

            }


            // Save merged PDF

            mergedPdfBytes =
                await mergedPdf.save();


            // Create Blob

            const blob =
                new Blob(
                    [mergedPdfBytes],
                    {
                        type: "application/pdf"
                    }
                );


            // Create download URL

            const downloadURL =
                URL.createObjectURL(blob);


            downloadButton.href =
                downloadURL;


            // Display success

            mergeMessage.className =
                "message success";

            mergeMessage.style.display =
                "block";

            mergeMessage.textContent =
                "✅ PDF files merged successfully!";


            resultSection.style.display =
                "block";


            // Display merged PDF

            await displayMergedPDF(
                mergedPdfBytes
            );


            // Scroll to result

            resultSection.scrollIntoView(
                {
                    behavior: "smooth"
                }
            );

        }

        catch (error) {

            showMergeError(
                "❌ Error while merging PDFs: " +
                error.message
            );

        }

        finally {

            mergeButton.disabled =
                false;

            mergeButton.textContent =
                "🔗 Merge PDF Files";

        }

    }
);


// ============================================================
// DISPLAY MERGED PDF
// ============================================================

async function displayMergedPDF(
    pdfBytes
) {

    mergedPdfViewer.innerHTML =
        "<p>Loading merged PDF...</p>";


    try {

        const pdf =
            await pdfjsLib.getDocument(
                {
                    data: pdfBytes
                }
            ).promise;


        mergedPdfViewer.innerHTML = "";


        for (
            let pageNumber = 1;
            pageNumber <= pdf.numPages;
            pageNumber++
        ) {

            await renderPage(
                pdf,
                pageNumber,
                mergedPdfViewer
            );

        }

    }

    catch (error) {

        mergedPdfViewer.innerHTML =
            `<p class="message error">
                ❌ Error displaying merged PDF:
                ${error.message}
            </p>`;

    }

}


// ============================================================
// CLEAR MERGED RESULT
// ============================================================

function clearMergedResult() {

    mergedPdfBytes = null;

    resultSection.style.display =
        "none";

    mergedPdfViewer.innerHTML =
        "";

}


// ============================================================
// SHOW MERGE ERROR
// ============================================================

function showMergeError(
    message
) {

    mergeMessage.className =
        "message error";

    mergeMessage.style.display =
        "block";

    mergeMessage.textContent =
        message;

}
```
