const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    
    const htmlPath = path.resolve('resume_output.html');
    await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    
    await page.pdf({
      path: 'Krishna_Vamshi_DevOps_resume_Generated.pdf',
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px'
      }
    });

    await browser.close();
    console.log('PDF generated successfully as Krishna_Vamshi_DevOps_resume_Generated.pdf');
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
})();
