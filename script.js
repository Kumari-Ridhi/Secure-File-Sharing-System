console.log("SCRIPT STARTED");

window.addEventListener("beforeunload", function () {
   console.trace("PAGE RELOAD STARTEF");
});

const authSection = document.getElementById("authSection");
const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");
const authMessage = document.getElementById("authMessage");
const myFilesSection = document.getElementById("myFilesSection");

let authToken = null;
let loggedInUser = null;

const getStartedBtn = document.getElementById("getStartedBtn");
const welcomeSection = document.getElementById("welcomeSection");
const uploadSection = document.getElementById("uploadSection");
const logoutBtn = document.getElementById("logoutBtn");

const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("fileInput");
const uploadBtn = document.getElementById("uploadBtn");
console.log("Upload form:", uploadForm);
console.log("File input:", fileInput);
console.log("Upload button:", uploadBtn);

const uploadMessage = document.getElementById("uploadMessage");

// Show the upload section
getStartedBtn.addEventListener("click", function () {
    //event.preventDefault();

    welcomeSection.hidden = true;
    uploadSection.hidden = false;
    myFilesSection.hidden = false;
    loadFiles();
   // console.log("Upload section opened");
});

// Upload the selected file to the backend
uploadForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("UPLOAD FORM SUBMITTED");

    const file = fileInput.files[0];

    if (!file) {
        uploadMessage.textContent = "Please select a file first.";
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "application/pdf",
        "text/plain"
    ];

    if (!allowedTypes.includes(file.type)) {
        uploadMessage.textContent =
            "Invalid file type. Choose JPG, PNG, PDF, or TXT.";
        return;
    }

    if (file.size > 5 * 1024 * 1024) {
        uploadMessage.textContent =
            "File is too large. Maximum size is 5 MB.";
        return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
        uploadBtn.disabled = true;
        uploadMessage.textContent = "Uploading your file...";

        const response = await fetch("http://localhost:3000/upload", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${authToken}`
            },
            body: formData
        });
        console.log("UPLOAD RESPONSE RECEIVED:", response.status);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Upload failed.");
        }

       uploadMessage.textContent =
    "Success! " + result.file.originalName + " uploaded successfully.";

    console.log("UPLOAD SUCCESS MESSAGE REACHED");

uploadForm.reset();
await loadFiles();

// Keep the upload section visible after successful upload
welcomeSection.hidden = true;
uploadSection.hidden = false;

console.log("Upload successful. Upload section remains visible.");
    } catch (error) {
        uploadMessage.textContent =
            "Upload failed: " + error.message;
    } finally {
        uploadBtn.disabled = false;
    }
});

uploadBtn.addEventListener("click", function () {
    console.log("UPLOAD BUTTON CLICKED");
});


const loadFilesBtn = document.getElementById("loadFilesBtn");
const fileList = document.getElementById("fileList");
const searchFilesInput = document.getElementById("searchFilesInput");
const fileTypeFilter = document.getElementById("fileTypeFilter");

fileTypeFilter.addEventListener("change", function () {
    applyFileFilters();
});

function applyFileFilters() {
    const query = searchFilesInput.value.trim().toLowerCase();
    const selectedType = fileTypeFilter.value;
    const items = fileList.querySelectorAll("li");

    let visibleCount = 0;

    items.forEach(function (item) {
        const fileInfo = item.querySelector("span");
        const fileName = fileInfo.textContent.toLowerCase();

        const isSearchMatch = fileName.includes(query);

        const extension = fileName
            .split(" — ")[0]
            .split(".")
            .pop()
            .replace(/[^a-z0-9]/g, "");

        let isTypeMatch = true;

        if (selectedType === "image") {
            isTypeMatch = ["jpg", "jpeg", "png"].includes(extension);
        } else if (selectedType === "pdf") {
            isTypeMatch = extension === "pdf";
        } else if (selectedType === "text") {
            isTypeMatch = extension === "txt";
        }

        const matches = isSearchMatch && isTypeMatch;
        item.style.display = matches ? "flex" : "none";

        if (matches) {
            visibleCount++;
        }
    });

    if (query !== "" || selectedType !== "all") {
        filesMessage.textContent = visibleCount === 0
            ? "No matching files found."
            : `${visibleCount} file(s) found.`;
    } else {
        filesMessage.textContent = `${visibleCount} file(s) found.`;
    }
}
const clearSearchBtn = document.getElementById("clearSearchBtn");

clearSearchBtn.addEventListener("click", function () {
    searchFilesInput.value = "";
    searchFilesInput.dispatchEvent(new Event("input"));
});

searchFilesInput.addEventListener("input", applyFileFilters);

const filesMessage = document.getElementById("filesMessage");

async function loadFiles() {
    filesMessage.textContent = "Loading files...";
    fileList.replaceChildren();

    try {
        const response = await fetch("http://localhost:3000/files",{
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        });
        const result = await response.json();
        document.getElementById("fileCount").textContent =`Total files: ${result.count}`;

        if (!response.ok) {
            throw new Error(result.message || "Could not load files.");
        }

        if (result.files.length === 0) {
            filesMessage.textContent = "No files uploaded yet.";
            return;
        }

    result.files.forEach(file => {
    const item = document.createElement("li");

const fileInfo = document.createElement("span");

const extension = file.originalName
    .split(".")
    .pop()
    .toLowerCase();

let fileIcon = "📄";

if (["jpg", "jpeg", "png"].includes(extension)) {
    fileIcon = "🖼️";
} else if (extension === "pdf") {
    fileIcon = "📕";
} else if (extension === "txt") {
    fileIcon = "📝";
}

fileInfo.textContent =
    `${fileIcon} ${file.originalName} — ${(file.size / 1024).toFixed(2)} KB`;

    const downloadBtn = document.createElement("button");
    downloadBtn.textContent = "Download";
    downloadBtn.type = "button";

   downloadBtn.addEventListener("click", async () => {
    try {
        const response = await fetch(
            `http://localhost:3000/download/${encodeURIComponent(file._id)}`,
            {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Download failed.");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = file.originalName;
        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
        alert(error.message);
    }
});

const deleteBtn = document.createElement("button");
deleteBtn.textContent = "Delete";
deleteBtn.type = "button";

deleteBtn.addEventListener("click", async () => {
    const confirmed = confirm(
        `Are you sure you want to delete ${file.originalName}?`
    );

    if (!confirmed) return;

    deleteBtn.disabled = true;

    try {
        const response = await fetch(
            `http://localhost:3000/files/${encodeURIComponent(file._id)}`,
            { 
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
             }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Delete failed.");
        }

        await loadFiles();

        filesMessage.textContent = `${file.originalName} deleted successfully.`;
    } catch (error) {
        alert("Delete failed: " + error.message);
        deleteBtn.disabled = false;
    }
});

    item.appendChild(fileInfo);
    item.appendChild(downloadBtn);
    item.appendChild(deleteBtn);
    fileList.appendChild(item);
});

const query = searchFilesInput.value.trim().toLowerCase();
const visibleItems = fileList.querySelectorAll("li");

let visibleCount = 0;

visibleItems.forEach(function (item) {
    const fileName = item.querySelector("span").textContent.toLowerCase();
    const matches = fileName.includes(query);

    item.hidden = !matches;

    if (matches) {
        visibleCount++;
    }
});

if (query !== "" && visibleCount === 0) {
    filesMessage.textContent = "No matching files found.";
} else {
    filesMessage.textContent = `${visibleCount} file(s) found.`;
}
    } catch (error) {
        filesMessage.textContent = "Error loading files: " + error.message;
    }
}

loadFilesBtn.addEventListener("click", loadFiles);

const API_URL = "http://localhost:3000";

// Register a new user
registerForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("registerName").value.trim();
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;

    authMessage.textContent = "Registering...";

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Registration failed.");
        }

        authMessage.textContent = result.message + " You can now log in.";
        registerForm.reset();
    } catch (error) {
        authMessage.textContent = error.message;
    }
});

// Log in an existing user
loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    authMessage.textContent = "Logging in...";

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Login failed.");
        }

        authToken = result.token;
        loggedInUser = result.user;

        authMessage.textContent =
            `Welcome, ${loggedInUser.name}! Login successful.`;

        authSection.hidden = true;
        welcomeSection.hidden = false;
    } catch (error) {
        authMessage.textContent = error.message;
    }
});

logoutBtn.addEventListener("click", function () {
    authToken = null;
    loggedInUser = null;

    authSection.hidden = false;
    welcomeSection.hidden = true;
    uploadSection.hidden = true;
    myFilesSection.hidden = true;

    uploadForm.reset();
    fileList.replaceChildren();

    uploadMessage.textContent = "";
    filesMessage.textContent = "";
    authMessage.textContent = "You have logged out successfully.";
});