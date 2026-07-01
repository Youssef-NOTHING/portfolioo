/* ==========================================================================
   main.js — terminal boot sequence + gallery
   ========================================================================== */

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Mobile nav toggle ---------- */
const navToggle = document.getElementById("nav-toggle");
const navLinks = document.getElementById("nav-links");

function closeNav() {
  navToggle.classList.remove("open");
  navLinks.classList.remove("open");
  navToggle.setAttribute("aria-expanded", "false");
}

navToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  navToggle.classList.toggle("open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNav));

/* ---------- Terminal boot sequence ---------- */
const bootLines = [
  { p: "youssef@portfolio:~$", cmd: "whoami" },
  { out: "Youssef — 20 years old" },
  { out: "Engineering student @ EIDIA, Euromed University of Fez" },
  { out: "Specialization: Cybersecurity", accent: true },
  { p: "youssef@portfolio:~$", cmd: "cat roles.txt" },
  { out: "web developer · media manager · video editor · content creator" },
];

const termBody = document.getElementById("terminal-body");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function typeLine(container, text, done) {
  const el = document.createElement("p");
  el.className = "terminal-line";
  const cmdSpan = document.createElement("span");
  cmdSpan.className = "out";
  el.appendChild(cmdSpan);
  container.appendChild(el);

  if (reduceMotion) {
    cmdSpan.textContent = text;
    done();
    return;
  }
  let i = 0;
  const speed = 18;
  (function step() {
    cmdSpan.textContent = text.slice(0, i);
    i++;
    if (i <= text.length) {
      setTimeout(step, speed);
    } else {
      done();
    }
  })();
}

function renderBoot(lines, idx) {
  if (idx >= lines.length) {
    const cursor = document.createElement("span");
    cursor.className = "cursor";
    termBody.appendChild(cursor);
    return;
  }
  const line = lines[idx];
  if (line.p) {
    const el = document.createElement("p");
    el.className = "terminal-line";
    const p = document.createElement("span");
    p.className = "p";
    p.textContent = line.p + " ";
    el.appendChild(p);
    const cmdSpan = document.createElement("span");
    cmdSpan.className = "out";
    el.appendChild(cmdSpan);
    termBody.appendChild(el);
    if (reduceMotion) {
      cmdSpan.textContent = line.cmd;
      renderBoot(lines, idx + 1);
      return;
    }
    let i = 0;
    (function step() {
      cmdSpan.textContent = line.cmd.slice(0, i);
      i++;
      if (i <= line.cmd.length) {
        setTimeout(step, 28);
      } else {
        setTimeout(() => renderBoot(lines, idx + 1), 180);
      }
    })();
  } else {
    const el = document.createElement("p");
    el.className = "terminal-line";
    el.style.color = line.accent ? "var(--teal)" : "var(--muted)";
    el.textContent = line.out;
    termBody.appendChild(el);
    setTimeout(() => renderBoot(lines, idx + 1), reduceMotion ? 0 : 220);
  }
}

renderBoot(bootLines, 0);

/* ---------- Gallery ---------- */
const filtersEl = document.getElementById("filters");
const galleryEl = document.getElementById("gallery");
let activeFilter = "all";

function renderFilters() {
  const all = [{ id: "all", label: "All" }, ...CATEGORIES];
  filtersEl.innerHTML = "";
  all.forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "filter-btn" + (cat.id === activeFilter ? " active" : "");
    btn.textContent = cat.label;
    btn.addEventListener("click", () => {
      activeFilter = cat.id;
      renderFilters();
      renderGallery();
    });
    filtersEl.appendChild(btn);
  });
}

function renderGallery() {
  const items = loadGallery().slice().sort((a, b) => b.createdAt - a.createdAt);
  const filtered = activeFilter === "all" ? items : items.filter((it) => it.category === activeFilter);

  galleryEl.innerHTML = "";
  if (filtered.length === 0) {
    const empty = document.createElement("div");
    empty.className = "gallery-empty";
    empty.textContent = "No items in this category yet — add some from the admin console.";
    galleryEl.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img class="card-img" src="${item.src}" alt="${item.title}" loading="lazy">
      <div class="card-body">
        <div class="card-cat">${categoryLabel(item.category)}</div>
        <h4>${item.title}</h4>
        <p>${item.description || ""}</p>
      </div>
    `;
    galleryEl.appendChild(card);
  });
}

renderFilters();
renderGallery();

/* ---------- Auto-playing slider ---------- */
const SLIDE_INTERVAL_MS = 500; // change this to slow the slider down
const sliderEl = document.getElementById("slider");
const sliderBarFill = document.getElementById("slider-bar-fill");

function initSlider() {
  const items = loadGallery();
  if (!sliderEl || items.length === 0) return;

  items.forEach((item, i) => {
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.title;
    if (i === 0) img.classList.add("active");
    sliderEl.appendChild(img);
  });

  const caption = document.createElement("div");
  caption.className = "slider-caption";
  caption.id = "slider-caption";
  sliderEl.appendChild(caption);

  const imgs = sliderEl.querySelectorAll("img");
  let current = 0;
  const updateCaption = () => {
    caption.textContent = items[current].title;
  };
  updateCaption();

  const paused = { value: false };
  sliderEl.addEventListener("mouseenter", () => (paused.value = true));
  sliderEl.addEventListener("mouseleave", () => (paused.value = false));

  if (imgs.length > 1) {
    setInterval(() => {
      if (paused.value) return;
      imgs[current].classList.remove("active");
      current = (current + 1) % imgs.length;
      imgs[current].classList.add("active");
      updateCaption();
    }, SLIDE_INTERVAL_MS);
  }

  // Thin progress bar that fills once per interval, purely decorative.
  if (sliderBarFill) {
    let elapsed = 0;
    const tick = 50;
    setInterval(() => {
      if (paused.value) return;
      elapsed = (elapsed + tick) % SLIDE_INTERVAL_MS;
      sliderBarFill.style.width = `${(elapsed / SLIDE_INTERVAL_MS) * 100}%`;
    }, tick);
  }
}

initSlider();
