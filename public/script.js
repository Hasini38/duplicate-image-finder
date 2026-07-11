const imageInput = document.getElementById("images");
const previewContainer = document.getElementById("previewContainer");
const compareBtn = document.getElementById("compareBtn");
const loader = document.getElementById("loader");
const results = document.getElementById("results");
const dropArea = document.getElementById("drop-area");

let selectedFiles = [];

// ---------- Image Preview ----------
imageInput.addEventListener("change", () => {
    selectedFiles = [...imageInput.files];
    showPreview(selectedFiles);
});

function showPreview(files) {
    previewContainer.innerHTML = "";

    files.forEach(file => {
        const reader = new FileReader();

        reader.onload = function (e) {

            const card = document.createElement("div");
            card.className = "preview-card";

            card.innerHTML = `
                <img src="${e.target.result}">
                <p>${file.name}</p>
            `;

            previewContainer.appendChild(card);
        };

        reader.readAsDataURL(file);
    });
}

// ---------- Drag & Drop ----------
dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.style.background = "rgba(255,255,255,0.2)";
});

dropArea.addEventListener("dragleave", () => {
    dropArea.style.background = "transparent";
});

dropArea.addEventListener("drop", (e) => {
    e.preventDefault();

    dropArea.style.background = "transparent";

    selectedFiles = [...e.dataTransfer.files];

    showPreview(selectedFiles);
});

// ---------- Compare Images ----------
compareBtn.addEventListener("click", async () => {

    if (selectedFiles.length < 2) {
        alert("Please upload at least two images.");
        return;
    }

    loader.style.display = "block";
    results.innerHTML = "";

    const formData = new FormData();

    selectedFiles.forEach(file => {
        formData.append("images", file);
    });

    try {

       const response = await fetch("/compare", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        loader.style.display = "none";

        if (!data.success) {
            alert(data.message);
            return;
        }

        displayResults(data.comparisons);

    } catch (error) {

        loader.style.display = "none";

        alert("Unable to connect to server.");

        console.error(error);

    }

});

// ---------- Display Results ----------
function displayResults(comparisons) {

    let html = `
    <div class="results-card">

        <h2>Duplicate Detection Results</h2>

        <table>

            <tr>
                <th>Image 1</th>
                <th>Image 2</th>
                <th>Similarity</th>
                <th>Status</th>
            </tr>
    `;

    comparisons.forEach(item => {

        const similarity = parseFloat(item.similarity);

        let status = "";
        let cls = "";

        if (similarity >= 95) {
            status = "Duplicate";
            cls = "high";
        }
        else if (similarity >= 80) {
            status = "Very Similar";
            cls = "medium";
        }
        else {
            status = "Different";
            cls = "low";
        }

        html += `
            <tr>

                <td>${item.image1}</td>

                <td>${item.image2}</td>

                <td class="${cls}">
                    ${item.similarity}
                </td>

                <td class="${cls}">
                    ${status}
                </td>

            </tr>
        `;

    });

    html += `
        </table>

    </div>

    <div class="footer">
        Built using Perceptual Image Hashing (pHash)
    </div>
    `;

    results.innerHTML = html;

}