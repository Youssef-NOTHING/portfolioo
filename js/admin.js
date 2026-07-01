/* ==========================================================================
   admin.js — password lock + gallery CRUD
   ========================================================================== */

const lockScreen = document.getElementById("lock-screen");
const dashboard = document.getElementById("dashboard");
const lockTitle = document.getElementById("lock-title");
const lockHint = document.getElementById("lock-hint");
const pwInput = document.getElementById("pw-input");
const pwConfirmField = document.getElementById("pw-confirm-field");
const pwConfirm = document.getElementById("pw-confirm");
const lockError = document.getElementById("lock-error");
const lockSubmit = document.getElementById("lock-submit");

let mode = hasPassword() ? "login" : "setup";
let changingPassword = false;

function paintLockScreen() {
  lockError.textContent = "";
  pwInput.value = "";
  pwConfirm.value = "";
  if (mode === "setup") {
    lockTitle.textContent = "Set an admin password";
    lockHint.textContent = "This is the only thing standing between anyone and your gallery. It's stored only in this browser — private on this device, not a substitute for keeping this page's address to yourself.";
    pwConfirmField.style.display = "block";
    lockSubmit.textContent = "Set password";
  } else {
    lockTitle.textContent = "Enter password";
    lockHint.textContent = "This console is private. Enter your password to continue.";
    pwConfirmField.style.display = "none";
    lockSubmit.textContent = "Unlock";
  }
  pwInput.focus();
}

async function handleLockSubmit() {
  const pw = pwInput.value;
  if (!pw || pw.length < 4) {
    lockError.textContent = "Use at least 4 characters.";
    return;
  }
  if (mode === "setup") {
    if (pw !== pwConfirm.value) {
      lockError.textContent = "Passwords don't match.";
      return;
    }
    await setPassword(pw);
    unlock();
  } else {
    const ok = await checkPassword(pw);
    if (!ok) {
      lockError.textContent = "Incorrect password.";
      return;
    }
    unlock();
  }
}

function unlock() {
  lockScreen.style.display = "none";
  dashboard.style.display = "block";
  if (changingPassword) {
    changingPassword = false;
    showToast("Password updated");
  }
  renderAdminList();
}

lockSubmit.addEventListener("click", handleLockSubmit);
[pwInput, pwConfirm].forEach((el) =>
  el.addEventListener("keydown", (e) => { if (e.key === "Enter") handleLockSubmit(); })
);

paintLockScreen();

document.getElementById("lock-btn").addEventListener("click", () => {
  dashboard.style.display = "none";
  lockScreen.style.display = "flex";
  mode = "login";
  paintLockScreen();
});

document.getElementById("change-pw-btn").addEventListener("click", () => {
  changingPassword = true;
  dashboard.style.display = "none";
  lockScreen.style.display = "flex";
  mode = "setup";
  paintLockScreen();
});

/* ---------- Toast ---------- */
let toastTimer;
function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ---------- Category select ---------- */
const categorySelect = document.getElementById("item-category");
CATEGORIES.forEach((c) => {
  const opt = document.createElement("option");
  opt.value = c.id;
  opt.textContent = c.label;
  categorySelect.appendChild(opt);
});

/* ---------- Upload / drop zone ---------- */
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const dropPreview = document.getElementById("drop-preview");
const dropText = document.getElementById("drop-text");
let pendingImageData = null;

dropZone.addEventListener("click", () => fileInput.click());
["dragover", "dragenter"].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.add("drag"); })
);
["dragleave", "drop"].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => { e.preventDefault(); dropZone.classList.remove("drag"); })
);
dropZone.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

function handleFile(file) {
  if (!file.type.startsWith("image/")) {
    showToast("Please choose an image file");
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingImageData = e.target.result;
    dropPreview.src = pendingImageData;
    dropPreview.style.display = "block";
    dropText.textContent = file.name;
  };
  reader.readAsDataURL(file);
}

function resetUploadForm() {
  pendingImageData = null;
  dropPreview.style.display = "none";
  dropText.textContent = "Click to choose a file, or drag an image here";
  fileInput.value = "";
  document.getElementById("item-title").value = "";
  document.getElementById("item-desc").value = "";
  categorySelect.selectedIndex = 0;
}

document.getElementById("reset-form-btn").addEventListener("click", resetUploadForm);

document.getElementById("add-btn").addEventListener("click", () => {
  const title = document.getElementById("item-title").value.trim();
  const description = document.getElementById("item-desc").value.trim();
  const category = categorySelect.value;

  if (!pendingImageData) {
    showToast("Choose an image first");
    return;
  }
  if (!title) {
    showToast("Give it a title");
    return;
  }

  addItem({
    id: "item-" + Date.now(),
    title,
    category,
    description,
    src: pendingImageData,
    createdAt: Date.now(),
  });

  resetUploadForm();
  renderAdminList();
  showToast("Added to gallery");
});

/* ---------- List / edit / delete ---------- */
const adminList = document.getElementById("admin-list");
const itemCount = document.getElementById("item-count");

function renderAdminList() {
  const items = loadGallery().slice().sort((a, b) => b.createdAt - a.createdAt);
  itemCount.textContent = `(${items.length})`;
  adminList.innerHTML = "";

  if (items.length === 0) {
    adminList.innerHTML = `<div class="admin-empty">No items yet — add your first image above.</div>`;
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "admin-item";
    row.innerHTML = `
      <img src="${item.src}" alt="${item.title}">
      <div class="admin-item-info">
        <h4>${item.title}</h4>
        <p>${categoryLabel(item.category)}${item.description ? " · " + item.description : ""}</p>
      </div>
      <div class="admin-item-actions">
        <button class="icon-btn" data-action="edit" data-id="${item.id}">Edit</button>
        <button class="icon-btn danger" data-action="delete" data-id="${item.id}">Delete</button>
      </div>
    `;
    adminList.appendChild(row);
  });
}

adminList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "delete") {
    if (confirm("Delete this item? This can't be undone.")) {
      deleteItem(id);
      renderAdminList();
      showToast("Deleted");
    }
  } else if (btn.dataset.action === "edit") {
    openEditModal(id);
  }
});

function openEditModal(id) {
  const item = loadGallery().find((it) => it.id === id);
  if (!item) return;

  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";
  overlay.innerHTML = `
    <div class="modal">
      <h3>Edit item</h3>
      <div class="field">
        <label>Title</label>
        <input type="text" id="edit-title" value="${item.title.replace(/"/g, '&quot;')}">
      </div>
      <div class="field">
        <label>Category</label>
        <select id="edit-category"></select>
      </div>
      <div class="field">
        <label>Description</label>
        <textarea id="edit-desc">${item.description || ""}</textarea>
      </div>
      <div class="modal-actions">
        <button class="btn ghost" id="edit-cancel">Cancel</button>
        <button class="btn solid" id="edit-save">Save changes</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const editCategory = overlay.querySelector("#edit-category");
  CATEGORIES.forEach((c) => {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = c.label;
    if (c.id === item.category) opt.selected = true;
    editCategory.appendChild(opt);
  });

  overlay.querySelector("#edit-cancel").addEventListener("click", () => overlay.remove());
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });

  overlay.querySelector("#edit-save").addEventListener("click", () => {
    const title = overlay.querySelector("#edit-title").value.trim();
    if (!title) { showToast("Title can't be empty"); return; }
    updateItem(id, {
      title,
      category: editCategory.value,
      description: overlay.querySelector("#edit-desc").value.trim(),
    });
    overlay.remove();
    renderAdminList();
    showToast("Saved");
  });
}
