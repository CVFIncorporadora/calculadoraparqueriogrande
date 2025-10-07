const fs = require('fs');
const path = require('path');

// O script agora espera 2 argumentos:
// 1. O novo status (ex: "TRUE")
// 2. Uma string com um ou mais IDs, separados por vírgula (ex: "_1_A_01,_1_A_02")
const novoStatus = process.argv[2];
const idsString = process.argv[3];

// --- Validação dos Argumentos ---
if (!novoStatus || !idsString) {
  console.error('ERRO: É necessário fornecer o NOVO STATUS e a LISTA DE IDs.');
  console.error('Uso: node atualizar_lote_ci.js <STATUS> "<ID1,ID2,...>"');
  process.exit(1);
}

const statusNormalizado = novoStatus.toUpperCase();
if (statusNormalizado !== 'TRUE' && statusNormalizado !== 'FALSE') {
    console.error('ERRO: O status deve ser "TRUE" ou "FALSE".');
    process.exit(1);
}

// Converte a string de IDs em um array, limpando espaços
const idsParaAtualizar = idsString.split(',').map(id => id.trim()).filter(id => id);

if (idsParaAtualizar.length === 0) {
    console.error('ERRO: A lista de IDs fornecida está vazia.');
    process.exit(1);
}
// --- Fim da Validação ---

const arquivoJsonPath = path.join(__dirname, 'lotes.json');

console.log(Iniciando atualização para ${idsParaAtualizar.length} ID(s) com o status "${statusNormalizado}"...);

try {
  const arquivoBruto = fs.readFileSync(arquivoJsonPath, 'utf8');
  let listaDeLotes = JSON.parse(arquivoBruto);

  const idsSet = new Set(idsParaAtualizar);
  let lotesAtualizadosCount = 0;
  const idsEncontrados = new Set();

  listaDeLotes.forEach(lote => {
    if (idsSet.has(lote.ID)) {
      lote.Vendido = statusNormalizado;
      lote.DataModificacao = new Date().toISOString();
      lotesAtualizadosCount++;
      idsEncontrados.add(lote.ID);
    }
  });

  if (lotesAtualizadosCount > 0) {
    const jsonAtualizado = JSON.stringify(listaDeLotes, null, 2);
    fs.writeFileSync(arquivoJsonPath, jsonAtualizado, 'utf8');
    console.log(\n✅ Sucesso! ${lotesAtualizadosCount} lote(s) foram atualizados.);
  } else {
    console.log('\nNenhum lote correspondente aos IDs fornecidos foi encontrado. Arquivo não modificado.');
  }

  const idsNaoEncontrados = idsParaAtualizar.filter(id => !idsEncontrados.has(id));
  if (idsNaoEncontrados.length > 0) {
    console.warn(⚠ Atenção: Os seguintes IDs não foram encontrados: ${idsNaoEncontrados.join(', ')});
  }

} catch (error) {
  console.error('❌ Ocorreu um erro durante o processo:', error);
  process.exit(1);
}
