# Demo — pre-owned tech & custom PCs

Complete static website. No build step. Open it locally or deploy the folder to Vercel.

## Project structure

```
.
├── index.html              Homepage
├── shop.html               Catalog (filters via ?category=)
├── product.html            Product detail (?id=)
├── builder.html            Custom PC builder
├── about.html
├── contact.html
├── cart.html
├── favicon.svg
├── css/
│   └── styles.css
├── js/
│   ├── data.js             Brand, products, builder parts (edit this)
│   ├── app.js              Cart, search, shop, product pages
│   └── builder.js          PC builder
├── images/                 Product and hero photos
├── package.json
├── vercel.json
├── serve.py                Optional Python server
└── README.md
```

## Run locally

Needs a local server (ES modules do not load from `file://`).

**Node**

```bash
npm run dev
```

Open http://localhost:3000

**Python**

```bash
python3 -m http.server 8080 --bind 0.0.0.0
```

Open http://localhost:8080

## Deploy to Vercel

This is a static site. No framework, no build command.

1. Push this repository to GitHub.
2. In Vercel: **Add New → Project → Import**.
3. Framework Preset: **Other**.
4. Leave Build Command empty.
5. Output Directory: empty (root).
6. Deploy.

Or from the project folder:

```bash
npx vercel
```

## Edit content

| What | File |
| --- | --- |
| Brand name, phone, WhatsApp, email | `js/data.js` → `SITE` |
| Products and specs | `js/data.js` → `PRODUCTS` |
| PC builder parts | `js/data.js` → `BUILDER` |
| Reviews | `js/data.js` → `REVIEWS` |
| Photos | `images/` |
| Colors / type | `css/styles.css` → `:root` |

Pricing on the site is **Discussions open**. Contact and build-request forms are front-end only. Cart uses `localStorage`.
