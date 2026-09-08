# ben-horwitz.com

Personal portfolio site — plain HTML/CSS/JS, no build step, deployed via GitHub Pages.

## Structure

```
index.html              Home page / project grid
about.html               About page
projects/*.html          One page per project
css/style.css            All styles
js/main.js               Mobile nav + video preview behavior
assets/img/              Photos + CAD screenshots
assets/img/posters/      Poster frames shown before a video loads
assets/video/            Compressed project videos (h.264 mp4)
CNAME                    Custom domain for GitHub Pages (ben-horwitz.com)
```

## Editing content

Every project page has one or more `<!-- EDIT ME -->` comments in the HTML
marking placeholder copy that was drafted from the file/folder names alone —
go through each project page and swap in the real details (what the project
actually is, tools/materials used, what was hard about it). The
`pps-reaction-chamber.html` page especially needs a real description — the
source material didn't make it clear what "PPS" stands for.

## Previewing locally

No build step — just open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Media

Original photos/videos were compressed for the web (large `.MOV` files were
re-encoded to `.mp4`, images resized/recompressed). If you add new project
media, keep individual files well under GitHub's 100MB hard limit — ideally
under ~20-30MB for video so pages stay fast to load.

## Deploying

This repo is served by GitHub Pages from the default branch. The `CNAME` file
points it at `ben-horwitz.com` — your domain registrar's DNS needs to point at
GitHub Pages for that to resolve (see GitHub's "Managing a custom domain for
your GitHub Pages site" docs: A records to GitHub's IPs, or a CNAME record to
`<username>.github.io`, depending on whether this is an apex domain or a
subdomain).
