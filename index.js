const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { createObjectCsvWriter } = require('csv-writer');

dayjs.extend(utc);
dayjs.extend(timezone);
const TIMEZONE = 'Australia/Sydney';

// Settingan
const MAX_PAGES_PER_DOMAIN = 10;   // Limit 10 Page
const MAX_RETRY = 2;               // Retry max 2x
const PARALLEL_LIMIT = 3;          // Max page can open at same time

async function getAllInternalLinks(page, domain) {
    const links = await page.$$eval('a', anchors => anchors.map(a => a.href));
    const internalLinks = links
        .filter(link => link.startsWith(domain))
        .filter(link => !link.match(/\.(jpg|jpeg|png|pdf|zip|rar)$/i));
    return Array.from(new Set(internalLinks)); // hapus duplikat
}

async function withRetry(page, url, retries = MAX_RETRY) {
    for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
            await page.waitForTimeout(5000); // Tunggu 5 detik
            return;
        } catch (error) {
            console.error(`Attempt ${attempt} failed for ${url}:`, error.message);
            if (attempt > retries) throw error;
            await page.waitForTimeout(2000); // Wait 2s sebelum retry
        }
    }
}

(async () => {
    try {
        const urlsFile = path.join(__dirname, 'urls.txt');
        if (!await fs.pathExists(urlsFile)) {
            console.error('urls.txt file not found!');
            process.exit(1);
        }

        const urlsContent = await fs.readFile(urlsFile, 'utf8');
        const domains = urlsContent.split('\n').map(u => u.trim()).filter(Boolean);

        const browser = await puppeteer.launch({ headless: true });

        for (const domain of domains) {
            console.log(`\nProcessing domain: ${domain}`);

            const domainName = new URL(domain).hostname;
            const outputDir = path.join(__dirname, 'output', domainName);
            await fs.ensureDir(outputDir);

            const page = await browser.newPage();
            await page.goto(domain, { waitUntil: 'networkidle2', timeout: 60000 });
            await page.setViewport({ width: 1920, height: 1080 });
            await page.waitForTimeout(5000);

            let internalUrls = await getAllInternalLinks(page, domain);
            await page.close();

            console.log(`Found ${internalUrls.length} internal pages.`);

            // Simpan semua links ke links.csv
            const linksCsvWriter = createObjectCsvWriter({
                path: path.join(outputDir, 'links.csv'),
                header: [{ id: 'url', title: 'Internal Link URL' }]
            });
            const linksData = internalUrls.map(url => ({ url }));
            await linksCsvWriter.writeRecords(linksData);
            console.log(`Links saved: ${outputDir}/links.csv`);

            // Limit jumlah halaman
            internalUrls = internalUrls.slice(0, MAX_PAGES_PER_DOMAIN);

            const logEntries = [];

            for (let i = 0; i < internalUrls.length; i += PARALLEL_LIMIT) {
                const batch = internalUrls.slice(i, i + PARALLEL_LIMIT);

                await Promise.all(batch.map(async (pageUrl) => {
                    const page = await browser.newPage();
                    try {
                        console.log(`Opening page: ${pageUrl}`);
                        await withRetry(page, pageUrl);

                        let pageName = pageUrl.replace(domain, '').replace(/\W+/g, '_') || 'home';
                        pageName = pageName.length > 50 ? pageName.slice(0, 50) : pageName;

                        const timestamp = dayjs().tz(TIMEZONE).format('YYYY-MM-DD-HH-mm');
                        const filename = `${pageName}_${timestamp}-AEST.png`;
                        const filepath = path.join(outputDir, filename);

                        await page.screenshot({ path: filepath, fullPage: true });

                        logEntries.push({
                            url: pageUrl,
                            filename,
                            timestamp: dayjs().tz(TIMEZONE).format('YYYY-MM-DD HH:mm:ss')
                        });

                        console.log(`Captured: ${filename}`);
                    } catch (err) {
                        console.error(`Error capturing ${pageUrl}:`, err.message);
                    } finally {
                        await page.close();
                    }
                }));
            }

            const csvWriter = createObjectCsvWriter({
                path: path.join(outputDir, 'log.csv'),
                header: [
                    { id: 'url', title: 'Page URL' },
                    { id: 'filename', title: 'Screenshot Filename' },
                    { id: 'timestamp', title: 'Timestamp (AEST)' }
                ]
            });

            await csvWriter.writeRecords(logEntries);
            console.log(`Log saved: ${outputDir}/log.csv`);
        }

        await browser.close();
        console.log('\nAll domains processed successfully!');
    } catch (err) {
        console.error('Fatal error:', err.message);
    }
})();
