```javascript
// ============================================================
// PragyanAI PDF Merger
// script.js
// ============================================================


// ============================================================
// FASTAPI BACKEND URL
// ============================================================

// LOCAL DEVELOPMENT
// const API_URL = "http://127.0.0.1:8000";

// PRODUCTION
// Replace this with your deployed FastAPI backend URL.

const API_URL =
    "https://your-fastapi-backend.onrender.com";

console.log("PDF Merger API URL:", API_URL);


// ============================================================
// DOM ELEMENTS
// ============================================================

const pdfFiles =
    document.getElementById("pdfFiles");

const mergeButton =
    document.getElementById("mergeButton");

const mergeMessage =
    document.getElementById("mergeMessage");

const fileList =
    document.getElementById("fileList");

const selectedFiles =
    document.getElementById("selectedFiles");

const resultContainer =
    document.getElementById("resultContainer");

const downloadButton =
    document.getElementById("downloadButton");

const apiStatus =
    document.getElementById("apiStatus");

const statusIndicator =
    document.getElementById("statusIndicator");

const swaggerLink =
    document.getElementById("swaggerLink");


// ============================================================
// APPLICATION STATE
// ============================================================

let mergedPDFBlob = null;
let mergedPDFURL = null;


// ============================================================
// INITIALIZE
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        checkAPIStatus();

        if (swaggerLink) {
            swaggerLink.href =
                `${API_URL}/docs`;
        }

    }
);


// ============================================================
// FILE INPUT EVENT
// ============================================================

if (pdfFiles) {

    pdfFiles.addEventListener(
        "change",
        function () {

            handleFileSelection(
                pdfFiles.files
            );

        }
    );

}


// ============================================================
// HANDLE FILE SELECTION
// ============================================================

function handleFileSelection(files) {

    clearMessage();

    hideResult();

    selectedFiles.innerHTML = "";


    // Convert FileList to normal array
    const fileArray =
        Array.from(files);


    // ========================================================
    // CHECK NUMBER OF FILES
    // ========================================================

    if (fileArray.length === 0) {

        fileList.classList.add("hidden");

        mergeButton.disabled = true;

        return;

    }


    // Minimum two PDF files
    if (fileArray.length < 2) {

        showMessage(
            "Please select at least two PDF files.",
            "error"
        );

        fileList.classList.remove(
            "hidden"
        );

        mergeButton.disabled = true;

    }

    else {

        mergeButton.disabled = false;

    }


    // ========================================================
    // CHECK FILE TYPES
    // ========================================================

    let invalidFile = false;


    fileArray.forEach(
        function (file, index) {

            if (
                file.type !== "application/pdf" &&
                !file.name
                    .toLowerCase()
                    .endsWith(".pdf")
            ) {

                invalidFile = true;

            }


            // ==================================================
            // CREATE FILE LIST ITEM
            // ==================================================

            const listItem =
                document.createElement("li");


            // File information
            const fileInfo =
                document.createElement("span");


            fileInfo.textContent =
                `${index + 1}. ${file.name}`;


            // File size
            const fileSize =
                document.createElement("small");


            fileSize.textContent =
                ` (${formatFileSize(file.size)})`;


            fileInfo.appendChild(
                fileSize
            );


            listItem.appendChild(
                fileInfo
            );


            selectedFiles.appendChild(
                listItem
            );

        }
    );


    // ========================================================
    // SHOW FILE LIST
    // ========================================================

    fileList.classList.remove(
        "hidden"
    );


    // ========================================================
    // INVALID FILE MESSAGE
    // ========================================================

    if (invalidFile) {

        showMessage(
            "Only PDF files are allowed.",
            "error"
        );

        mergeButton.disabled = true;

        return;

    }


    // ========================================================
    // SUCCESS MESSAGE
    // ========================================================

    if (fileArray.length >= 2) {

        showMessage(
            `${fileArray.length} PDF files selected. Ready to merge.`,
            "success"
        );

    }

}


// ============================================================
// MERGE BUTTON EVENT
// ============================================================

if (mergeButton) {

    mergeButton.addEventListener(
        "click",
        mergePDFs
    );

}


// ============================================================
// MERGE PDF FILES
// ============================================================

async function mergePDFs() {

    const files =
        Array.from(
            pdfFiles.files
        );


    // ========================================================
    // VALIDATE FILES
    // ========================================================

    if (files.length < 2) {

        showMessage(
            "Please select at least two PDF files.",
            "error"
        );

        return;

    }


    // Check PDF files
    const invalidFile =
        files.some(
            function (file) {

                return (
                    file.type !== "application/pdf" &&
                    !file.name
                        .toLowerCase()
                        .endsWith(".pdf")
                );

            }
        );


    if (invalidFile) {

        showMessage(
            "Only PDF files are allowed.",
            "error"
        );

        return;

    }


    // ========================================================
    // DISABLE BUTTON
    // ========================================================

    mergeButton.disabled = true;

    mergeButton.textContent =
        "⏳ Merging PDF files...";


    showMessage(
        "Uploading PDF files to the FastAPI backend...",
        "info"
    );


    hideResult();


    try {

        // ====================================================
        // CREATE FORM DATA
        // ====================================================

        const formData =
            new FormData();


        files.forEach(
            function (file) {

                formData.append(
                    "files",
                    file
                );

            }
        );


        // ====================================================
        // SEND REQUEST TO FASTAPI
        // ====================================================

        const response =
            await fetch(
                `${API_URL}/merge`,
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
                "Failed to merge PDF files.";

            try {

                const errorData =
                    await response.json();

                if (errorData.detail) {

                    errorMessage =
                        errorData.detail;

                }

            }

            catch (error) {

                console.log(
                    "Could not read error response."
                );

            }


            throw new Error(
                errorMessage
            );

        }


        // ====================================================
        // GET MERGED PDF AS BLOB
        // ====================================================

        mergedPDFBlob =
            await response.blob();


        // ====================================================
        // CREATE DOWNLOAD URL
        // ====================================================

        if (mergedPDFURL) {

            URL.revokeObjectURL(
                mergedPDFURL
            );

        }


        mergedPDFURL =
            URL.createObjectURL(
                mergedPDFBlob
            );


        // ====================================================
        // SET DOWNLOAD BUTTON
        // ====================================================

        downloadButton.href =
            mergedPDFURL;

        downloadButton.download =
            "PragyanAI_Merged.pdf";


        // ====================================================
        // SHOW RESULT
        // ====================================================

        resultContainer.classList.remove(
            "hidden"
        );


        showMessage(
            "PDF files merged successfully!",
            "success"
        );


        // Scroll to result
        resultContainer.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }


    catch (error) {

        console.error(
            "Merge Error:",
            error
        );


        showMessage(
            error.message ||
            "Something went wrong while merging the PDFs.",
            "error"
        );

    }


    finally {

        // ====================================================
        // ENABLE BUTTON
        // ====================================================

        mergeButton.disabled =
            pdfFiles.files.length < 2;


        mergeButton.textContent =
            "📄 Merge PDF Files";

    }

}


// ============================================================
// CHECK API STATUS
// ============================================================

async function checkAPIStatus() {

    try {

        apiStatus.textContent =
            "Checking backend...";

        statusIndicator.className =
            "status-indicator checking";


        const response =
            await fetch(
                `${API_URL}/health`
            );


        if (!response.ok) {

            throw new Error(
                "Backend returned an error."
            );

        }


        const result =
            await response.json();


        if (
            result.success === true ||
            result.status === "healthy"
        ) {

            apiStatus.textContent =
                "Backend API is online";

            statusIndicator.className =
                "status-indicator online";

        }

        else {

            apiStatus.textContent =
                "Backend API responded";

            statusIndicator.className =
                "status-indicator online";

        }

    }


    catch (error) {

        console.error(
            "API Status Error:",
            error
        );


        apiStatus.textContent =
            "Backend API is offline";


        statusIndicator.className =
            "status-indicator offline";

    }

}


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type
) {

    if (!mergeMessage) {
        return;
    }


    mergeMessage.textContent =
        message;


    mergeMessage.className =
        `message ${type}`;

}


// ============================================================
// CLEAR MESSAGE
// ============================================================

function clearMessage() {

    if (!mergeMessage) {
        return;
    }


    mergeMessage.textContent = "";

    mergeMessage.className =
        "message";

}


// ============================================================
// HIDE RESULT
// ============================================================

function hideResult() {

    if (!resultContainer) {
        return;
    }


    resultContainer.classList.add(
        "hidden"
    );


    if (downloadButton) {

        downloadButton.removeAttribute(
            "href"
        );

    }


    if (mergedPDFURL) {

        URL.revokeObjectURL(
            mergedPDFURL
        );

        mergedPDFURL = null;

    }


    mergedPDFBlob = null;

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


    const i =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const size =
        bytes /
        Math.pow(1024, i);


    return (
        size.toFixed(2) +
        " " +
        units[i]
    );

}


// ============================================================
// DOWNLOAD EVENT
// ============================================================

if (downloadButton) {

    downloadButton.addEventListener(
        "click",
        function () {

            if (!mergedPDFBlob) {

                showMessage(
                    "There is no merged PDF available to download.",
                    "error"
                );

                return;

            }

            console.log(
                "Downloading merged PDF..."
            );

        }
    );

}


// ============================================================
// CLEANUP OBJECT URL
// ============================================================

window.addEventListener(
    "beforeunload",
    function () {

        if (mergedPDFURL) {

            URL.revokeObjectURL(
                mergedPDFURL
            );

        }

    }
);


// ============================================================
// DEBUG INFORMATION
// ============================================================

console.log(
    "PragyanAI PDF Merger JavaScript loaded successfully."
);
```

### What the completed JavaScript does

**1. Select PDF files**

You can select multiple PDF files using your existing:

```html
<input
    type="file"
    id="pdfFiles"
    accept="application/pdf"
    multiple
>
```

The selected files are displayed in the **Selected PDF Files** section.

**2. Validates the files**

* Only PDF files are accepted.
* At least **2 PDFs** are required.
* The Merge button remains disabled until 2 or more valid PDFs are selected.

**3. Sends files to FastAPI**

The JavaScript sends all files to:

```text
POST /merge
```

using:

```javascript
formData.append("files", file);
```

Your HTML already identifies `/merge` as the PDF merge endpoint.

**4. Receives the merged PDF**

The response is converted into a browser `Blob`:

```javascript
mergedPDFBlob = await response.blob();
```

Then a temporary download URL is created.

**5. Shows Download button**

After successful merging, the result section appears and the user gets:

**📄 PDF Merged Successfully**

**⬇️ Download Merged PDF**

This corresponds to the result/download section in your HTML.

---

## Expected output

When you open your website, it should look approximately like this:

```text
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                 PragyanAI PDF Merger                        │
│            Upload, Merge and Download PDF Files             │
│                                                             │
│          HTML + CSS + JavaScript + FastAPI                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│  Backend API Status                              ●          │
│  Backend API is online                                      │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│  ①   Merge PDF Files                                       │
│      Select two or more PDF files to merge them into one.   │
│                                                             │
│  Select PDF Files                                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Choose Files   file1.pdf, file2.pdf, file3.pdf       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Supported: PDF files | Select multiple files               │
│                                                             │
│  Selected PDF Files                                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ 1. file1.pdf (245 KB)                                │  │
│  │ 2. file2.pdf (512 KB)                                │  │
│  │ 3. file3.pdf (1.2 MB)                                │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│             📄 Merge PDF Files                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘


After successful merging:


┌─────────────────────────────────────────────────────────────┐
│              ✓ PDF Merged Successfully                     │
│                                                             │
│       Your PDF files have been merged into one document.   │
│                                                             │
│              ⬇️ Download Merged PDF                         │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│  ②   How It Works                                           │
│                                                             │
│  Step 1       Step 2       Step 3       Step 4             │
│  Select       Upload       FastAPI      Download           │
│  PDFs         files        merges       merged PDF         │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│  ③   API Information                                       │
│                                                             │
│  GET  /          API information                            │
│  GET  /health    Health check                               │
│  POST /merge     Merge PDF files                            │
│  GET  /info      Application information                    │
│                                                             │
│       📘 Open Swagger API Documentation                     │
└─────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│  ④   Technology Stack                                       │
│                                                             │
│  Frontend          Frontend Hosting                        │
│  HTML + CSS + JS   Netlify                                  │
│                                                             │
│  Backend           PDF Processing                          │
│  FastAPI           PyPDF                                    │
│                                                             │
│  API Format        File Upload                             │
│  REST + JSON       FastAPI UploadFile                      │
└─────────────────────────────────────────────────────────────┘
```

### Important before testing

Change this:

```javascript
const API_URL =
    "https://your-fastapi-backend.onrender.com";
```

to your **actual Render FastAPI URL**, for example:

```javascript
const API_URL =
    "https://pragyanai-pdf-merger.onrender.com";
```

Also, your FastAPI backend must have **CORS enabled** because the frontend will be hosted on Netlify while the backend is hosted on Render. Without CORS, the browser can block the `/health` and `/merge` requests even when the Render backend itself is working.
