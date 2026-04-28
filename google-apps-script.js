/**
 * CÓDIGO PARA O GOOGLE APPS SCRIPT
 * 1. No Google Sheets, vá em Extensões > Apps Script
 * 2. Cole este código e salve
 * 3. Clique em "Implantar" > "Nova implantação"
 * 4. Selecione "App da Web"
 * 5. Em "Quem pode acessar", escolha "Qualquer pessoa"
 * 6. Copie a URL gerada e cole no site
 */

function doGet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheets()[0]; // Pega a primeira aba
  const data = sheet.getDataRange().getValues();
  
  // Remove o cabeçalho
  data.shift();
  
  const result = {
    data: data
  };
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
