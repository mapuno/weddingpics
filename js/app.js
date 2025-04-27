const correctPassword = "SLRO17052026"; 

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
        <label for="file${index}-camera">Take Photo:</label>
        <input type="file" accept="image/*" capture="camera" id="file${index}-camera" style="display:none;" />
        <button onclick="triggerCamera(${index})">Take Photo</button>
        <label for="file${index}">Upload Image:</label>
        <input type="file" accept="image/*" id="file${index}" />
        <br>
        <button onclick="uploadFile(${index})">Submit Photo</button>
      `;
      container.appendChild(promptEl);
      container.appendChild(promptE2);
    });
  } catch (error) {
    console.error("Failed to load prompts:", error);
  }
}

// Trigger the camera input when the custom "Take Photo" button is clicked
function triggerCamera(index) {
  const fileInputCamera = document.getElementById(`file${index}-camera`);
  fileInputCamera.click(); // Open the camera input dialog
}

// Upload the selected file
async function uploadFile(index) {
  const fileInputUpload = document.getElementById(`file${index}`);
  const fileInputCamera = document.getElementById(`file${index}-camera`);
  
  // Get the file from either input
  let file = fileInputUpload.files[0] || fileInputCamera.files[0];
  
  if (!file) return alert("Please choose a photo (upload or take a photo).");

  const formData = new FormData();
  formData.append("file", file);
  formData.append("prompt", promptsCache[index]); // use cached prompt

  try {
    const res = await fetch("https://script.google.com/macros/s/AKfycbzmuv9iZZ_6MFLccSf-oTUB9gdpZ5urfgXMWMYHaXeBQ0h1VIAYqUYHacywUhExioIsMQ/exec", {
      method: "POST",
      body: formData,
    });
    const text = await res.text();
    alert("Upload complete: " + text);
    fileInputUpload.value = ""; // reset upload input after submit
    fileInputCamera.value = ""; // reset camera input after submit
  } catch (err) {
    alert("Upload failed. Try again.");
    console.error(err);
  }
}
