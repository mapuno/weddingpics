const correctPassword = "SR170526"; 

function checkPassword() {
  const input = document.getElementById("passwordInput").value;
  const errorMsg = document.getElementById("error");

  if (input === correctPassword) {
    sessionStorage.setItem('unlocked', 'true');
    document.getElementById("lockscreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    loadPrompts(); // Only call loadPrompts when password is correct
  } else {
    errorMsg.textContent = "Wrong password. Try again.";
  }
}

// Auto-unlock if password was already entered
if (sessionStorage.getItem('unlocked') === 'true') {
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("lockscreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    loadPrompts(); // Only call loadPrompts when session is unlocked
  });
}

let promptsCache = []; // This will hold the prompts after first load

async function loadPrompts() {
  const container = document.getElementById("promptsContainer");

  try {
    const response = await fetch('prompts.json');
    const prompts = await response.json();
    promptsCache = prompts; // cache the prompts here

    // Clear previous prompts before adding new ones
    container.innerHTML = "";

    prompts.forEach((text, index) => {
      const promptEl = document.createElement("div");
      const promptE2 = document.createElement("div");
      promptEl.className = "prompt";
      promptEl.style.marginBottom = "10px"; 
      promptEl.innerHTML = `
        <label>📸 ${text}</label>
      `;
      promptE2.className = "upload";
      promptE2.style.marginBottom = "20px"; 
      promptE2.innerHTML = `
        <input type="file" accept="image/*" capture="camera" id="file${index}-camera" style="display:none;" onchange="showPreview(this, ${index})" />
        <button onclick="triggerCamera(${index})">Take Photo</button>
        <input type="file" accept="image/*" id="file${index}" style="display:none;" onchange="showPreview(this, ${index})" />
        <button onclick="triggerUpload(${index})">Upload Image</button>
        <br>
        <img id="preview${index}" class="image-preview" style="max-width: 100%; max-height: 200px; display: none; margin-top: 10px;" />
        <br>
        <button id="submitButton${index}" onclick="uploadFile(${index})">Submit Photo</button>
        <button onclick="clearPhoto(${index})" style="margin-left: 10px;">Clear Photo</button>
      `;

      container.appendChild(promptEl);
      container.appendChild(promptE2);
    });

  } catch (error) {
    console.error("Failed to load prompts:", error);
  }
}

//Trigger upload image file
function triggerUpload(index) {
  document.getElementById(`file${index}`).click();
}

// Trigger the camera input when the custom "Take Photo" button is clicked
function triggerCamera(index) {
  const fileInputCamera = document.getElementById(`file${index}-camera`);
  fileInputCamera.click(); // Open the camera input dialog
}

async function uploadFile(index) {
  const fileInputUpload = document.getElementById(`file${index}`);
  const fileInputCamera = document.getElementById(`file${index}-camera`);
  const submitButton = document.getElementById(`submitButton${index}`);
  const userName = document.getElementById("nameInput").value
  let file = fileInputUpload.files[0] || fileInputCamera.files[0];
  if (!file) return alert("Please choose a photo.");

  const reader = new FileReader();
  reader.onload = async function (e) {
    const base64Data = e.target.result.split(",")[1];
    const payload = {
      file: base64Data,
      name: file.name,
      prompt: promptsCache[index],
      user: userName
    };

    submitButton.disabled = true; // Disable the button to prevent multiple uploads
    submitButton.textContent = "Uploading..."; // Change button text

    try {
      const res = await fetch("https://script.google.com/macros/s/AKfycbzmuv9iZZ_6MFLccSf-oTUB9gdpZ5urfgXMWMYHaXeBQ0h1VIAYqUYHacywUhExioIsMQ/exec", {
        method: "POST",
        body: JSON.stringify(payload),
        mode: "no-cors",
        headers: { "Content-Type": "application/json" }
      });
      submitButton.textContent = "Submit Photo"; // Restore text
      alert("Upload complete.");
    } catch (err) {
      submitButton.textContent = "Submit Photo"; // Restore text on error too
      alert("Upload failed. Try again.");
      console.error(err);
    }
  };
  reader.readAsDataURL(file);
}


function clearPhoto(index) {
  document.getElementById(`file${index}`).value = "";
  document.getElementById(`file${index}-camera`).value = "";
  const preview = document.getElementById(`preview${index}`);
  preview.src = "";
  preview.style.display = "none";
}

function showPreview(input, index) {
  const file = input.files[0];
  const preview = document.getElementById(`preview${index}`);
  
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
  }
}
