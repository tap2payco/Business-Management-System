import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export async function renderPdfFromTemplate(templateName: string, data: any): Promise<Uint8Array> {
  const templatePath = path.join(process.cwd(), 'templates', `${templateName}.html`);
  const htmlSrc = await fs.readFile(templatePath, 'utf8');
  const template = Handlebars.compile(htmlSrc);
  const html = template(data);

  let browser;

  if (process.env.NODE_ENV === 'production') {
    // Production: Use sparticuz/chromium
    const chromium = require('@sparticuz/chromium');
    const puppeteerCore = require('puppeteer-core');

    // Optional: Load custom font if needed
    // await chromium.font('https://raw.githack.com/googlei18n/noto-emoji/master/fonts/NotoColorEmoji.ttf');

    browser = await puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
  } else {
    // Development: Use local puppeteer
    browser = await puppeteer.launch({ 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    return new Uint8Array(pdfBuffer);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
