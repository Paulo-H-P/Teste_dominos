const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Caminho absoluto para o arquivo HTML do relatório
  const htmlPath = path.join(__dirname, '..', 'allure-report', 'index.html');
  const pdfPath = path.join(__dirname, '..', 'allure-report', 'allure-report.pdf');
  
  // Verifica se o arquivo HTML existe
  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ Arquivo não encontrado: ${htmlPath}`);
    process.exit(1);
  }
  
  // Converte o caminho para file:// URL
  const fileUrl = `file://${htmlPath}`;
  
  console.log(`📄 Abrindo: ${fileUrl}`);
  console.log(`📄 Gerando PDF: ${pdfPath}`);
  
  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle' });
    
    // Aguarda um pouco para garantir que o conteúdo carregou completamente
    await page.waitForTimeout(3000);
    
    // Gera o PDF
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });
    
    console.log(`✅ PDF gerado com sucesso: ${pdfPath}`);
  } catch (error) {
    console.error(`❌ Erro ao gerar PDF:`, error);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
