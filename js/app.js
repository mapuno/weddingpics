const correctPassword = "SLRO17052026"; 

function checkPassword() {
  const input = document.getElementById("passwordInput").value;
  const errorMsg = document.getElementById("error");

  if (input === correctPassword) {
    sessionStorage.setItem('unlocked', 'true');
    document.getElementById("lockscreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    loadPrompts();
  } else {
    errorMsg.textContent = "Wrong password. Try again.";
  }
}

// Auto-unlock if password was already entered
if (sessionStorage.getItem('unlocked') === 'true') {
  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("lockscreen").style.display = "none";
    document.getElementById("mainApp").style.display = "block";
    loadPrompts();
  });
}

let promptsCache = []; // This will hold the prompts after first load

async function loadPrompts() {
  const container = document.getElementById("promptsContainer");

  try {
    const response = await fetch('prompts.json');
    const prompts = await response.json();
    promptsCache = prompts; // cache the prompts here

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
        <input type="file" accept="image/*" id="file${index}" />
        <button onclick="uploadFile(${index})">Upload Photo</button>
      `;
      container.appendChild(promptEl);
      container.appendChild(promptE2);
    });
  } catch (error) {
    console.error("Failed to load prompts:", error);
  }
}

async function uploadFile(index) {
  const fileInput = document.getElementById(`file${index}`);
  const file = fileInput.files[0];
  if (!file) return alert("Please choose a file first.");

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
    fileInput.value = ""; // reset input after upload
  } catch (err) {
    alert("Upload failed. Try again.");
    console.error(err);
  }
}

// Run it when page loads
loadPrompts();
