const fs = require('fs');
const path = require('path');

// Pega os argumentos da linha de comando.
const idParaAtualizar = process.argv[2];
const novoStatus = process.argv[3];

// Validação básica dos argumentos
if (!idParaAtualizar || !novoStatus) {
  console.error('ERRO: É necessário fornecer o ID e o novo status como argumentos.');
  console.error('Uso: node atualizar_lote_ci.js <ID_DO_LOTE> <NOVO_STATUS>');
  process.exit(1);
}

const statusNormalizado = novoStatus.toUpperCase();
if (statusNormalizado !== 'TRUE' && statusNormalizado !== 'FALSE') {
    console.error('ERRO: O status deve ser "TRUE" ou "FALSE".');
    process.exit(1);
}

const arquivoJsonPath = path.join(__dirname, 'lotes.json');

// --- ESTA É A LINHA CORRIGIDA ---
console.log(`Iniciando atualização para o ID: ${idParaAtualizar}...`);

try {
  const arquivoBruto = fs.readFileSync(arquivoJsonPath, 'utf8');
  let listaDeLotes = JSON.parse(arquivoBruto);

  const indiceDoLote = listaDeLotes.findIndex(lote => lote.ID === idParaAtualizar);

  if (indiceDoLote === -1) {
    console.error(`ERRO: Lote com ID "${idParaAtualizar}" não foi encontrado.`);
    process.exit(1);
  }

  // Atualiza o lote
  listaDeLotes[indiceDoLote].Vendido = statusNormalizado;
  listaDeLotes[indiceDoLote].DataModificacao = new Date().toISOString();

  const jsonAtualizado = JSON.stringify(listaDeLotes, null, 2);
  fs.writeFileSync(arquivoJsonPath, jsonAtualizado, 'utf8');

  console.log(`Sucesso! Lote ${idParaAtualizar} atualizado para Vendido=${statusNormalizado}.`);

} catch (error) {
  console.error('Ocorreu um erro durante o processo:', error);
  process.exit(1);
}
