/* ============================================================
   MergePDF - Main JavaScript
   ============================================================ */

// Store selected PDF files
let selectedFiles = [];


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const fileInput = document.getElementById("pdfFiles");
const fileList = document.getElementById("fileList");
const mergeBtn = document.getElementById("mergeBtn");
const status = document.getElementById("status");
const downloadLink = document.getElementById("downloadLink");
const downloadBtn = document.getElementById("downloadBtn");


// ============================================================
// SELECT PDF FILES
// ============================================================

fileInput.addEventListener("change", function () {

    const files = Array.from(this.files);

    files.forEach(function (file) {

        // Check whether the selected file is a PDF
        if (
            file.type === "application/pdf" ||
            file.name.toLowerCase().endsWith(".pdf")
        ) {

            // Prevent duplicate files
            const alreadyExists = selectedFiles.some(function (existingFile) {

                return (
                    existingFile.name === file.name &&
                    existingFile.size === file.size &&
                    existingFile.lastModified === file.lastModified
                );

            });

            if (!alreadyExists) {
                selectedFiles.push(file);
            }

        }

    });

    displayFiles();

    // Reset input so the same file can be selected again
    fileInput.value = "";

});


// ============================================================
// DISPLAY SELECTED FILES
// ============================================================

function displayFiles() {

    fileList.innerHTML = "";

    selectedFiles.forEach(function (file, index) {

        const li = document.createElement("li");

        li.className = "file-item";

        li.innerHTML = `
            <span class="file-name">
                ${index + 1}. ${escapeHTML(file.name)}
            </span>

            <button
                type="button"
                class="remove-btn"
                onclick="removeFile(${index})">
                Remove
            </button>
        `;

        fileList.appendChild(li);

    });


    // Enable merge button only when 2 or more files exist
    mergeBtn.disabled = selectedFiles.length < 2;


    // Clear download section if files are changed
    downloadLink.style.display = "none";

    if (selectedFiles.length === 0) {

        status.innerText = "";

    } else if (selectedFiles.length === 1) {

        status.style.color = "#666666";

        status.innerText = "Select at least one more PDF.";

    } else {

        status.style.color = "#28a745";

        status.innerText =
            `${selectedFiles.length} PDF files selected.`;

    }

}


// ============================================================
// REMOVE FILE
// ============================================================

function removeFile(index) {

    if (index < 0 || index >= selectedFiles.length) {
        return;
    }

    selectedFiles.splice(index, 1);

    displayFiles();

}


// ============================================================
// MERGE PDFs
// ============================================================

async function mergePDFs() {

    // Check minimum number of files
    if (selectedFiles.length < 2) {

        status.style.color = "#dc3545";

        status.innerText =
            "Please select at least 2 PDF files.";

        return;

    }


    // Create FormData
    const formData = new FormData();


    // Add PDFs to FormData in selected order
    selectedFiles.forEach(function (file) {

        formData.append("files", file);

    });


    // Disable merge button while processing
    mergeBtn.disabled = true;

    status.style.color = "#007bff";

    status.innerText = "Merging PDFs...";

    downloadLink.style.display = "none";


    try {

        // Send PDFs to backend
        const response = await fetch("/merge", {

            method: "POST",

            body: formData

        });


        // Check server response
        if (!response.ok) {

            let errorMessage = "Failed to merge PDFs.";

            try {

                const errorData = await response.json();

                if (errorData.error) {
                    errorMessage = errorData.error;
                }

            } catch (error) {

                // Ignore JSON parsing error

            }

            throw new Error(errorMessage);

        }


        // Convert server response to PDF Blob
        const blob = await response.blob();


        // Create temporary download URL
        const url = window.URL.createObjectURL(blob);


        // Set download link
        downloadBtn.href = url;

        downloadBtn.download = "merged.pdf";


        // Show download button
        downloadLink.style.display = "block";


        // Success message
        status.style.color = "#28a745";

        status.innerText =
            "PDFs merged successfully!";


    } catch (error) {

        console.error("Merge error:", error);

        status.style.color = "#dc3545";

        status.innerText =
            error.message ||
            "Error merging PDFs. Please try again.";

    }


    // Enable merge button again
    mergeBtn.disabled = selectedFiles.length < 2;

}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}
