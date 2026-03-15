#!/usr/bin/env node
// Generates all og:images as PNGs from the site's design system.
// Run from this directory: node generate.js
// First time: npm install

const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// ─── Add new articles here ────────────────────────────────────────────────────

const PAGES = [
  {
    slug: "default",
    title: null,
    // shown on homepage + writing index
  },
  {
    slug: "aave-loop-guide",
    title: "A Practical Guide to Yield Looping on Aave on Mantle",
  },
  {
    slug: "hyperliquid-delta-neutral",
    title: "Delta Neutral on Hyperliquid",
  },
  {
    slug: "what-the-heck-is-liquidity",
    title: "What the Heck is Liquidity?",
  },
];

// ─── HTML template (matches site palette + fonts exactly) ─────────────────────

function buildHTML(title) {
  const isDefault = !title;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=Inter:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      background: #faf8f5;
    }

    .card {
      width: 1200px;
      height: 630px;
      background: #faf8f5;
      border-left: 5px solid #2c5530;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 72px 96px;
    }

    .name {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 28px;
      font-weight: 600;
      color: #1a1a1a;
      letter-spacing: -0.01em;
      margin-bottom: 8px;
    }

    .role {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: #888;
      font-weight: 400;
    }

    .divider {
      width: 40px;
      height: 2px;
      background: #e5e2dd;
      margin: 40px 0;
    }

    .article-title {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 52px;
      font-weight: 600;
      color: #1a1a1a;
      line-height: 1.15;
      letter-spacing: -0.02em;
      max-width: 950px;
    }

    .default-title {
      font-family: 'Source Serif 4', Georgia, serif;
      font-size: 38px;
      font-weight: 400;
      font-style: italic;
      color: #4a4a4a;
      line-height: 1.35;
      max-width: 800px;
    }

    .bottom {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .url {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      color: #888;
      font-weight: 400;
    }

    .tag {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: #2c5530;
      background: #e8f0e8;
      padding: 4px 10px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="top">
      <div class="name">Sarthak Guleria</div>
      <div class="role">Product &amp; Payments</div>
    </div>
    <div class="middle">
      <div class="divider"></div>
      ${
        isDefault
          ? `<div class="default-title">Product thinking, DeFi mechanics, and things figured out the hard way.</div>`
          : `<div class="article-title">${title}</div>`
      }
    </div>
    <div class="bottom">
      <div class="url">sarthak-guleria.github.io</div>
      ${!isDefault ? `<div class="tag">Writing</div>` : ""}
    </div>
  </div>
</body>
</html>`;
}

// ─── Runner ───────────────────────────────────────────────────────────────────

async function generate() {
  const outDir = path.resolve(__dirname);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // 2× device scale for crisp retina-quality PNGs
  await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });

  for (const { slug, title } of PAGES) {
    const html = buildHTML(title);
    // waitUntil: networkidle0 ensures Google Fonts finish loading before screenshot
    await page.setContent(html, { waitUntil: "networkidle0" });

    const outPath = path.join(outDir, `${slug}.png`);
    await page.screenshot({
      path: outPath,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });

    console.log(`✓  ${slug}.png`);
  }

  await browser.close();
  console.log("\nAll og:images saved to og-images/");
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
