const API_URL = "http://127.0.0.1:8000";

let pdfFiles = [];
let selectedIndex = -1;

// ============================================================
// ELEMENTS
// ============================================================

const pdfFilesInput = document.getElementById("pdfFiles");
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
// API STATUS
// ============================================================

async function checkAPI() {

```
try {

    const response =
        await fetch(`${API_URL}/health`);

    if (!response.ok) {
        throw new Error("Backend unavailable");
    }

    const data = await response.json();

    apiStatus.textContent =
        data.message || "Backend connected";

    statusIndicator.className =
        "status-indicator online";

} catch (error) {

    apiStatus.textContent =
        "Backend is not running";

    statusIndicator.className =
        "status-indicator offline";
}
```

}

// ============================================================
// UPLOAD FILES
// ============================================================

uploadButton.addEventListener("click", () => {

```
pdfFilesInput.click();
```

});

pdfFilesInput.addEventListener("change", () => {

```
const selectedFiles =
    Array.from(pdfFilesInput.files);

if (selectedFiles.length === 0) {
    return;
}


const validFiles =
    selectedFiles.filter(file =>
        file.type === "application/pdf"
    );


if (validFiles.length !== selectedFiles.length) {

    uploadMessage.textContent =
        "Only PDF files are allowed.";

    uploadMessage.className =
        "message error";
}


validFiles.forEach(file => {

    const duplicate =
        pdfFiles.some(
            existing =>
                existing.name === file.name &&
                existing.size === file.size
        );

    if (!duplicate) {
        pdfFiles.push(file);
    }

});


if (pdfFiles.length > 0) {

    uploadMessage.textContent =
        `${pdfFiles.length} PDF file(s) uploaded.`;

    uploadMessage.className =
        "message success";
}


renderFileList();

pdfFilesInput.value = "";
```

});

// ============================================================
// RENDER FILE LIST
// ============================================================

function renderFileList() {

```
fileList.innerHTML = "";


if (pdfFiles.length === 0) {

    fileList.innerHTML = `
        <div class="empty-state">
            📄
            <p>No PDF files uploaded yet.</p>
        </div>
    `;

    fileCount.textContent = "0 files";

    currentFile.textContent =
        "No file selected";

    pdfPreview.src = "";

    selectedIndex = -1;

    return;
}


fileCount.textContent =
    `${pdfFiles.length} file(s)`;


pdfFiles.forEach((file, index) => {

    const item =
        document.createElement("div");

    item.className =
        "file-item";


    if (index === selectedIndex) {
        item.classList.add("selected");
    }


    item.innerHTML = `

        <div class="file-number">
            ${index + 1}
        </div>

        <div class="file-info">

            <strong>
                ${escapeHTML(file.name)}
            </strong>

            <span>
                ${formatFileSize(file.size)}
            </span>

        </div>

        <button
            class="view-button"
            onclick="selectFile(${index})"
        >
            👁️ View
        </button>

    `;


    item.addEventListener("click", (event) => {

        if (
            event.target.tagName.toLowerCase()
            !== "button"
        ) {

            selectFile(index);

        }

    });


    fileList.appendChild(item);

});
```

}

// ============================================================
// SELECT FILE
// ============================================================

function selectFile(index) {

```
if (
    index < 0 ||
    index >= pdfFiles.length
) {
    return;
}


selectedIndex = index;

const file = pdfFiles[index];


currentFile.textContent =
    `${index + 1}. ${file.name}`;


const url =
    URL.createObjectURL(file);

pdfPreview.src = url;


renderFileList();
```

}

window.selectFile = selectFile;

// ============================================================
// MOVE UP
// ============================================================

moveUpButton.addEventListener("click", () => {

```
if (
    selectedIndex <= 0 ||
    pdfFiles.length === 0
) {
    return;
}


const temp =
    pdfFiles[selectedIndex];

pdfFiles[selectedIndex] =
    pdfFiles[selectedIndex - 1];

pdfFiles[selectedIndex - 1] =
    temp;


selectedIndex--;

renderFileList();

selectFile(selectedIndex);
```

});

// ============================================================
// MOVE DOWN
// ============================================================

moveDownButton.addEventListener("click", () => {

```
if (
    selectedIndex < 0 ||
    selectedIndex >= pdfFiles.length - 1
) {
    return;
}


const temp =
    pdfFiles[selectedIndex];

pdfFiles[selectedIndex] =
    pdfFiles[selectedIndex + 1];

pdfFiles[selectedIndex + 1] =
    temp;


selectedIndex++;

renderFileList();

selectFile(selectedIndex);
```

});

// ============================================================
// REMOVE FILE
// ============================================================

removeButton.addEventListener("click", () => {

```
if (selectedIndex === -1) {

    alert("Please select a PDF file first.");

    return;
}


pdfFiles.splice(
    selectedIndex,
    1
);


if (pdfFiles.length === 0) {

    selectedIndex = -1;

} else if (
    selectedIndex >= pdfFiles.length
) {

    selectedIndex =
        pdfFiles.length - 1;
}


renderFileList();


if (selectedIndex >= 0) {
    selectFile(selectedIndex);
}
```

});

// ============================================================
// CLEAR ALL
// ============================================================

clearButton.addEventListener("click", () => {

```
if (pdfFiles.length === 0) {
    return;
}


pdfFiles = [];

selectedIndex = -1;

downloadContainer.classList.add("hidden");

renderFileList();

mergeMessage.textContent =
    "";
```

});

// ============================================================
// MERGE PDF
// ============================================================

mergeButton.addEventListener("click", async () => {

```
if (pdfFiles.length < 2) {

    mergeMessage.textContent =
        "Please upload at least 2 PDF files.";

    mergeMessage.className =
        "message error";

    return;
}


mergeButton.disabled = true;

mergeButton.textContent =
    "⏳ Merging PDFs...";


mergeMessage.textContent =
    "Uploading files and merging...";

mergeMessage.className =
    "message";


try {

    const formData =
        new FormData();


    pdfFiles.forEach(file => {

        formData.append(
            "files",
            file
        );

    });


    const response =
        await fetch(
            `${API_URL}/merge`,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        const errorData =
            await response.json()
                .catch(() => null);

        throw new Error(
            errorData?.detail ||
            "PDF merge failed"
        );

    }


    const blob =
        await response.blob();


    const downloadURL =
        URL.createObjectURL(blob);


    downloadButton.href =
        downloadURL;


    downloadContainer.classList.remove(
        "hidden"
    );


    mergeMessage.textContent =
        "PDF files merged successfully!";

    mergeMessage.className =
        "message success";


} catch (error) {

    mergeMessage.textContent =
        error.message;

    mergeMessage.className =
        "message error";

}


mergeButton.disabled = false;

mergeButton.textContent =
    "🔗 Merge PDF Files";
```

});

// ============================================================
// HELPERS
// ============================================================

function formatFileSize(bytes) {

```
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


return (
    parseFloat(
        (bytes /
            Math.pow(1024, i)
        ).toFixed(2)
    )
    + " "
    + units[i]
);
```

}

function escapeHTML(text) {

```
const div =
    document.createElement("div");

div.textContent = text;

return div.innerHTML;
```

}

// ============================================================
// SWAGGER
// ============================================================

swaggerLink.href =
`${API_URL}/docs`;

// ============================================================
// INITIALIZE
// ============================================================

checkAPI();

renderFileList();
