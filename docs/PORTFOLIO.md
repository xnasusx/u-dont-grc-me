# Susan Shepard Portfolio Page

This repo now includes a standalone recruiter-facing portfolio page at `portfolio/`.

## Run It Locally

```powershell
npm run dev -- --port 5173
```

Open `http://127.0.0.1:5173/portfolio/`.

To run the portfolio as its own root site, use:

```powershell
npm run dev:portfolio -- --port 5175
```

Open `http://127.0.0.1:5175/`.

## Edit The Links

Update the `links` object in `src/Portfolio.tsx`:

```ts
const links = {
  email: "HireSusanShepard@pm.me",
  mailto: "mailto:HireSusanShepard@pm.me",
  github: "https://github.com/xnasusx",
  linkedin: "https://www.linkedin.com/in/xnasusx/",
  grcEngineeringClub: "https://grcengclub.com/chapters/boston#join",
  medium: "https://medium.com/@xnasusx",
  product: "https://xnasusx.github.io/u-dont-grc-me/",
  resumePdf: `${import.meta.env.BASE_URL}susan-shepard-resume.pdf`,
  resumeJson: `${import.meta.env.BASE_URL}susan-shepard-resume.json`,
  resumeMarkdown: `${import.meta.env.BASE_URL}susan-shepard-resume.md`,
};
```

The PDF resume, JSON resume, and Markdown resume live in `public/` and are copied into both build outputs.

## Build

```powershell
npm run build
```

The Vite config builds both the existing product app and this portfolio page.

For the standalone portfolio repo build:

```powershell
$env:GITHUB_PAGES="true"
npm run build:portfolio
```

That emits `dist-portfolio/index.html`, ready for a GitHub Pages repository named `portfolio`.

## Deploy

For Vercel or Netlify, import this GitHub repo and use the default Vite build command:

```powershell
npm run build
```

For the simpler URL Susan wants, create or use a GitHub repository named `portfolio` under `xnasusx`, publish the `dist-portfolio` output with GitHub Pages, and use:

```text
https://xnasusx.github.io/portfolio/
```

When republishing, **copy the contents of `dist-portfolio/` over the `portfolio` repo — do not clear it
first.** That repo carries a `README.md` and `LICENSE` of its own which are not part of the build
output and would be lost. Stale hashed bundles under `assets/` can be deleted by hand when they
accumulate; the fresh `index.html` only references the current pair.

The existing `u-dont-grc-me` repo can still publish the product prototype at `https://xnasusx.github.io/u-dont-grc-me/`.
