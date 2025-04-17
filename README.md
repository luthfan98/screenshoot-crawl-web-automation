# 🖼️ Website Full-Page Screenshot Automation with Puppeteer

This project automates full-website screenshot capture for multiple domains.  
It is designed for documentation, copyright evidence, or web archiving purposes.

---

## 🚀 Features

✅ Crawl and collect all internal HTML links automatically per domain.  
✅ Limit maximum number of pages captured (default: **10 pages** per domain).  
✅ Parallel page processing (**3 pages at a time**) for faster execution.  
✅ Full-page screenshots captured after complete page load and **5-second wait**.  
✅ Automatic retry up to **2 times** if page loading fails.  
✅ Output organized by domain folders.  
✅ CSV logs:
- `log.csv` → list of screenshots taken with timestamp.
- `links.csv` → list of all discovered internal links per website.
✅ Timestamp adjusted to **AEST timezone** (Australia/Sydney).
✅ Clean error handling and auto-folder creation.

---

## 📂 Project Structure

```bash
screenshot-crawler/
├── output/
│   ├── abc.net.au/
│   │   ├── home_2025-04-18-10-05-AEST.png
│   │   ├── news_sport_2025-04-18-10-07-AEST.png
│   │   ├── log.csv
│   │   └── links.csv
│   ├── smh.com.au/
│   │   ├── about_us_2025-04-18-10-10-AEST.png
│   │   ├── contact_2025-04-18-10-11-AEST.png
│   │   ├── log.csv
│   │   └── links.csv
├── urls.txt
├── index.js
├── package.json
└── README.md
```

---

## 🛠️ Installation

1. Clone this repository:

```bash
git clone https://github.com/luthfan98/screenshoot-crawl-web-automation.git
cd screenshot-crawler
```

2. Install dependencies:

```bash
npm install
```

3. Prepare your list of domains in `urls.txt`, one per line:

```
https://www.abc.net.au/news
https://www.smh.com.au
```

---

## ▶️ Usage

Start the crawler:

```bash
npm start
```

It will:
- Crawl each domain
- Capture up to 10 internal pages
- Save full-page screenshots
- Generate `log.csv` and `links.csv` per domain

---

## 🖼️ Example Screenshots

<!-- You can embed example screenshots here -->

| Home Page | Internal Page |
|:---|:---|
| ![Home Screenshot](./output/www.abc.net.au/home_2025-04-18-01-31-AEST.png) | ![News Page Screenshot](./output/www.abc.net.au/_sport_2025-04-18-01-32-AEST.png) |

---

## ⚙️ Customization

You can easily adjust:
- Maximum number of pages per domain:  
  In `index.js`, edit `MAX_PAGES_PER_DOMAIN`
- Parallel open pages:  
  Edit `PARALLEL_LIMIT`
- Retry attempts:  
  Edit `MAX_RETRY`

Example:

```javascript
const MAX_PAGES_PER_DOMAIN = 10;
const MAX_RETRY = 2;
const PARALLEL_LIMIT = 3;
```

---

## 📌 Notes

- This script focuses on **HTML page links** only (ignores PDFs, images, ZIPs, etc).
- Designed to handle JavaScript-rendered content by waiting for network idle and extra wait time.
- Tested on news websites with hundreds of internal pages.

---

## 🧑‍💻 Tech Stack

- [Puppeteer](https://pptr.dev/)
- [Node.js](https://nodejs.org/)
- [dayjs](https://day.js.org/) (for timezone handling)
- [csv-writer](https://www.npmjs.com/package/csv-writer)
- [fs-extra](https://www.npmjs.com/package/fs-extra)

---

## 📜 License

MIT License

---

> Made with ❤️ for automation, productivity, and web scraping excellence.