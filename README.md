# Youssef — Portfolio

## Files
```
index.html        → the public site
admin.html         → your private gallery manager (password-locked)
css/style.css      → main site styles
css/admin.css       → admin console styles
js/data.js          → shared storage logic (gallery + password)
js/main.js          → homepage terminal animation + gallery rendering
js/admin.js         → admin console logic
images/             → drop your own images here if you'd rather link files
                      than upload through the admin console
```

## How to use it
1. Open `index.html` in your browser to see the site.
2. Open `admin.html` to manage your gallery. The first time you open it,
   it'll ask you to set a password — pick one and remember it.
3. In the admin console: upload an image (drag & drop or click to choose),
   give it a title + category + optional description, then **Add to gallery**.
4. Edit or delete any item from the list below the upload form.
5. Go back to `index.html` and refresh — your changes show up immediately.

## Important notes on privacy
- Everything (your images and your password) is stored in your browser's
  **localStorage**, on this device only. Nothing is uploaded anywhere.
- That also means: if you clear your browser data, or open the site in a
  different browser/device, the gallery will reset to the placeholder
  images. Back up important edits by keeping copies of your original
  photos somewhere safe.
- The password lock keeps casual visitors out of `admin.html`, but since
  this is a static site with no server, it isn't bank-level security —
  don't rely on it if you plan to publicly host this site. If you do put
  it online, keep the admin page's link private, or better yet, host it
  somewhere only you can reach (e.g. behind your own auth) and keep
  `admin.html` off any public link list.

## Putting this on GitHub without exposing the admin page
This folder includes a `.gitignore` that excludes `admin.html`,
`js/admin.js`, and `css/admin.css` from git. That means:

- Those files stay on your computer and admin.html keeps working
  normally when you open it locally.
- If you `git init` + push this folder to a **public** GitHub repo (or
  deploy it with GitHub Pages), those three files simply won't be
  included — so nobody browsing your repo or your live site can see the
  admin page or its code.
- If you ever need the admin files on another computer, copy them over
  manually (e.g. via a USB drive, private repo, or private cloud
  folder) — git won't carry them for you on purpose.

If you'd rather keep everything under version control (including
admin), just use a **private** GitHub repo instead and skip the
`.gitignore` restriction.

## Customizing
- Replace the placeholder SVGs in `/images` or just delete them once
  you've added real work through the admin console.
- Update the email address and Instagram link in `index.html` under the
  "Let's talk" section.
- Categories (Cybersecurity, Web Dev, Media Mgmt, Video Edit, Social
  Posts) are defined once in `js/data.js` — edit the `CATEGORIES` array
  there if you want to rename or add one; it updates both pages.
