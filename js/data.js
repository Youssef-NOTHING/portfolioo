/* ==========================================================================
   data.js — shared storage layer for the portfolio + admin console
   Everything lives in localStorage on YOUR browser. Nothing is sent
   anywhere. Categories are fixed to match the modules on the homepage.
   ========================================================================== */

const STORAGE_KEY = "yb_portfolio_gallery_v1";
const PASS_KEY = "yb_admin_pass_hash_v1";

const CATEGORIES = [
  { id: "cyber", label: "Cybersecurity" },
  { id: "web", label: "Web Dev" },
  { id: "media", label: "Media Mgmt" },
  { id: "video", label: "Video Edit" },
  { id: "social", label: "Social Posts" },
];

function categoryLabel(id) {
  const c = CATEGORIES.find((c) => c.id === id);
  return c ? c.label : id;
}

/* Default seed so the gallery isn't empty on first run.
   Swap these out from the admin console — drop real screenshots/exports in
   /images and reference them, or just upload straight from the console. */
function seedData() {
  return [
    {
      id: "seed-1",
      title: "Network defense lab",
      category: "cyber",
      description: "Add a screenshot of a CTF writeup, lab setup, or pentest report cover.",
      src: "images/placeholder-cyber.svg",
      createdAt: Date.now() - 5000,
    },
    {
      id: "seed-2",
      title: "Client website build",
      category: "web",
      description: "Swap in a screenshot of a site you built or a code snippet you're proud of.",
      src: "images/placeholder-web.svg",
      createdAt: Date.now() - 4000,
    },
    {
      id: "seed-3",
      title: "Instagram growth report",
      category: "media",
      description: "Add an analytics screenshot or before/after of an account you managed.",
      src: "images/placeholder-media.svg",
      createdAt: Date.now() - 3000,
    },
    {
      id: "seed-4",
      title: "Reel edit — cover frame",
      category: "video",
      description: "Drop in a thumbnail from an edit you cut.",
      src: "images/placeholder-video.svg",
      createdAt: Date.now() - 2000,
    },
    {
      id: "seed-5",
      title: "Feed post design",
      category: "social",
      description: "Add one of the posts you designed and shipped.",
      src: "images/placeholder-social.svg",
      createdAt: Date.now() - 1000,
    },
  ];
}

function loadGallery() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      saveGallery(seeded);
      return seeded;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Gallery read failed, reseeding.", e);
    const seeded = seedData();
    saveGallery(seeded);
    return seeded;
  }
}

function saveGallery(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function addItem(item) {
  const items = loadGallery();
  items.push(item);
  saveGallery(items);
  return items;
}

function updateItem(id, patch) {
  const items = loadGallery().map((it) => (it.id === id ? { ...it, ...patch } : it));
  saveGallery(items);
  return items;
}

function deleteItem(id) {
  const items = loadGallery().filter((it) => it.id !== id);
  saveGallery(items);
  return items;
}

function reorderItems(newOrderIds) {
  const items = loadGallery();
  const byId = Object.fromEntries(items.map((it) => [it.id, it]));
  const reordered = newOrderIds.map((id) => byId[id]).filter(Boolean);
  saveGallery(reordered);
  return reordered;
}

async function sha256(text) {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function hasPassword() {
  return !!localStorage.getItem(PASS_KEY);
}

async function setPassword(pw) {
  const hash = await sha256(pw);
  localStorage.setItem(PASS_KEY, hash);
}

async function checkPassword(pw) {
  const hash = await sha256(pw);
  return hash === localStorage.getItem(PASS_KEY);
}
