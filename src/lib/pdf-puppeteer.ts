import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';

export async function renderPdfFromTemplate(templateName: string, data: any): Promise<Buffer> {
  const templatePath = path.join(process.cwd(), 'templates', `${templateName}.html`);
  const htmlSrc = await fs.readFile(templatePath, 'utf8');
  const template = Handlebars.compile(htmlSrc);
  const html = template(data);

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();
  return pdfBuffer;
}
