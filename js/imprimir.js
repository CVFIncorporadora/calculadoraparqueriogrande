function validarCPF(cpf) {
  cpf = (cpf || '').replace(/\D/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i], 10) * (10 - i);
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9], 10)) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i], 10) * (11 - i);
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  return resto === parseInt(cpf[10], 10);
}

function formatarCPF(valor) {
  return (valor || '').replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatarDataBR(isoDate) {
  if (!isoDate) return '';
  const [ano, mes, dia] = isoDate.split('-');
  return `${dia}/${mes}/${ano}`;
}

function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto || '';
  return div.innerHTML;
}

// Abre a caixa de diálogo pedindo os dados da proposta antes de imprimir.
// Resolve com os dados preenchidos, ou null se o usuário cancelar.
function pedirDadosProposta() {
  return new Promise((resolve) => {
    const dialog = document.getElementById('dialogProposta');
    const form = document.getElementById('formProposta');
    const btnCancelar = document.getElementById('btnCancelarProposta');
    const inputCpfCorretor = document.getElementById('inputCpfCorretor');
    const inputCpfCliente = document.getElementById('inputCpfCliente');
    const erroCpfCorretor = document.getElementById('erroCpfCorretor');
    const erroCpfCliente = document.getElementById('erroCpfCliente');

    form.reset();
    erroCpfCorretor.textContent = '';
    erroCpfCliente.textContent = '';

    const aplicarMascara = (e) => { e.target.value = formatarCPF(e.target.value); };
    inputCpfCorretor.addEventListener('input', aplicarMascara);
    inputCpfCliente.addEventListener('input', aplicarMascara);

    const limpar = () => {
      inputCpfCorretor.removeEventListener('input', aplicarMascara);
      inputCpfCliente.removeEventListener('input', aplicarMascara);
      form.removeEventListener('submit', onSubmit);
      btnCancelar.removeEventListener('click', onCancelar);
      dialog.removeEventListener('cancel', onDialogCancel);
      dialog.removeEventListener('click', onBackdropClick);
    };

    function onSubmit(e) {
      e.preventDefault();
      erroCpfCorretor.textContent = '';
      erroCpfCliente.textContent = '';

      let valido = true;
      if (!validarCPF(inputCpfCorretor.value)) {
        erroCpfCorretor.textContent = 'CPF inválido';
        valido = false;
      }
      if (!validarCPF(inputCpfCliente.value)) {
        erroCpfCliente.textContent = 'CPF inválido';
        valido = false;
      }
      if (!valido) return;

      const dados = {
        dataEntrada: formatarDataBR(document.getElementById('inputDataEntrada').value),
        dataVencimento: formatarDataBR(document.getElementById('inputDataVencimento').value),
        observacoes: document.getElementById('inputObservacoes').value.trim(),
        cpfCorretor: inputCpfCorretor.value,
        cpfCliente: inputCpfCliente.value,
      };

      limpar();
      dialog.close();
      resolve(dados);
    }

    function onCancelar() {
      limpar();
      dialog.close();
      resolve(null);
    }

    function onDialogCancel() {
      limpar();
      resolve(null);
    }

    function onBackdropClick(e) {
      const rect = dialog.getBoundingClientRect();
      const dentro = e.clientX >= rect.left && e.clientX <= rect.right &&
        e.clientY >= rect.top && e.clientY <= rect.bottom;
      if (!dentro) {
        limpar();
        dialog.close();
        resolve(null);
      }
    }

    form.addEventListener('submit', onSubmit);
    btnCancelar.addEventListener('click', onCancelar);
    dialog.addEventListener('cancel', onDialogCancel);
    dialog.addEventListener('click', onBackdropClick);

    dialog.showModal();
  });
}

export async function imprimirMapa() {
  const dadosProposta = await pedirDadosProposta();
  if (!dadosProposta) return;

  // Captura dados do lote
  const nomeLote = document.getElementById("nomeLote")?.textContent || '---';
  const areaLote = document.getElementById("areaLote")?.textContent || '---';
  const valorLote = document.getElementById("valorLote")?.textContent || '---';
  const resumoPagamento = document.getElementById("resumoPagamento")?.innerHTML || '---';
  const formaPagamento = document.getElementById("formaPagamento")?.value || 'avista';
  const formaPagamentoText = document.getElementById("formaPagamento")?.options[document.getElementById("formaPagamento").selectedIndex]?.text || '';

  // Captura o mapa com html2canvas
  let mapaImage = '';
  try {
    const mapaElement = document.querySelector('.mapa-wrapper');
    if (mapaElement) {
      const canvas = await html2canvas(mapaElement, {
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        scale: 0.5
      });
      mapaImage = canvas.toDataURL('image/png');
    }
  } catch (err) {
    console.error('Erro ao capturar mapa:', err);
  }

  const dataAtual = new Date().toLocaleDateString('pt-BR');
  const numeroDocumento = 'PROP-' + Date.now().toString().slice(-6);

  const css = `
    <style>
      @page {
        size: A4;
        margin: 12mm;
      }

      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background: #ffffff;
        color: #183243;
        line-height: 1.6;
        position: relative;
      }

      /* Marca d'água */
      body::before {
        content: '';
        position: fixed;
        top: 50%;
        left: 50%;
        width: 400px;
        height: 400px;
        background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><text x="100" y="100" font-size="80" fill="rgba(200,200,200,0.1)" text-anchor="middle" dominant-baseline="middle" font-weight="bold">CÓPIA</text></svg>');
        background-size: contain;
        background-repeat: no-repeat;
        transform: translate(-50%, -50%) rotate(-45deg);
        z-index: -1;
        pointer-events: none;
      }

      .container {
        max-width: 900px;
        margin: 0 auto;
        padding: 40px;
      }

      /* Header */
      .header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 30px;
        border-bottom: 3px solid #183243;
        padding-bottom: 20px;
      }

      .logo-header {
        max-width: 150px;
      }

      .logo-header img {
        max-width: 100%;
        height: auto;
      }

      .company-info {
        text-align: right;
        font-size: 12px;
        color: #67808b;
      }

      .company-info h1 {
        font-size: 24px;
        color: #183243;
        margin-bottom: 5px;
      }

      /* Título do documento */
      .doc-title {
        text-align: center;
        font-size: 20px;
        font-weight: 700;
        color: #183243;
        margin: 30px 0 10px;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .doc-meta {
        text-align: center;
        font-size: 11px;
        color: #67808b;
        margin-bottom: 30px;
      }

      /* Card de informações */
      .info-section {
        background: #f4efe8;
        border-left: 4px solid #b8873b;
        padding: 20px;
        margin-bottom: 25px;
        border-radius: 4px;
      }

      .info-section h3 {
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: #916d2b;
        margin-bottom: 15px;
        font-weight: 700;
      }

      .info-row {
        display: flex;
        justify-content: space-between;
        padding: 10px 0;
        border-bottom: 1px solid rgba(24, 50, 67, 0.1);
        font-size: 14px;
      }

      .info-row:last-child {
        border-bottom: none;
      }

      .info-label {
        font-weight: 600;
        color: #183243;
      }

      .info-value {
        font-weight: 700;
        color: #b8873b;
      }

      /* Seção do mapa */
      .mapa-section {
        margin: 15px 0;
        text-align: center;
        page-break-before: always;
        page-break-inside: avoid;
      }

      .mapa-section h3 {
        font-size: 14px;
        font-weight: 700;
        color: #183243;
        text-transform: uppercase;
        margin-bottom: 10px;
        letter-spacing: 0.5px;
      }

      .mapa-image {
        max-width: 100%;
        max-height: 600px;
        width: auto;
        height: auto;
        object-fit: contain;
        border: 2px solid #b8873b;
        border-radius: 6px;
      }

      /* Seção de pagamento */
      .payment-section {
        background: #f9f6f0;
        border: 2px solid #b8873b;
        padding: 20px;
        margin: 25px 0;
        border-radius: 6px;
      }

      .payment-section h3 {
        font-size: 14px;
        font-weight: 700;
        color: #183243;
        text-transform: uppercase;
        margin-bottom: 15px;
        letter-spacing: 0.5px;
      }

      .payment-details {
        font-size: 14px;
        line-height: 1.8;
        color: #183243;
      }

      .payment-details strong {
        color: #916d2b;
      }

      /* Seções de campos */
      .field-section {
        margin: 25px 0;
      }

      .field-label {
        font-size: 13px;
        font-weight: 700;
        color: #183243;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 8px;
      }

      .field-line {
        border-bottom: 1px solid #183243;
        height: 25px;
        margin-bottom: 5px;
        display: flex;
        align-items: flex-end;
        padding-bottom: 4px;
        font-size: 14px;
        font-weight: 600;
        color: #183243;
      }

      /* Observações */
      .observations {
        margin: 30px 0;
        font-size: 13px;
        color: #67808b;
        line-height: 1.8;
      }

      .observations p {
        margin-bottom: 8px;
      }

      /* Assinaturas */
      .signatures {
        margin-top: 25px;
        display: flex;
        justify-content: space-between;
        gap: 50px;
        page-break-inside: avoid;
      }

      .signature-block {
        flex: 1;
        text-align: center;
        font-size: 12px;
      }

      .signature-line {
        border-bottom: 2px solid #183243;
        height: 60px;
        margin-bottom: 10px;
      }

      .signature-block p {
        margin: 5px 0;
        color: #183243;
        font-weight: 600;
      }

      /* Rodapé */
      .footer {
        margin-top: 20px;
        padding-top: 12px;
        border-top: 2px solid #183243;
        text-align: center;
        font-size: 10px;
        color: #67808b;
        page-break-inside: avoid;
      }

      /* Impressão */
      @media print {
        body {
          margin: 0;
          padding: 0;
        }
        .container {
          padding: 20px;
        }
        button {
          display: none;
        }
      }
    </style>
  `;

  const conteudo = `
    <div class="container">
      <!-- Header -->
      <div class="header">
        <div class="logo-header">
          <img src="assets/logo_parque_riogrande.png" alt="Parque Rio Grande">
        </div>
        <div class="company-info">
          <h1>Parque Rio Grande</h1>
          <p>Empreendimento Imobiliário</p>
          <p style="margin-top: 10px; font-weight: 600;">${numeroDocumento}</p>
        </div>
      </div>

      <!-- Título -->
      <div class="doc-title">Proposta Comercial</div>
      <div class="doc-meta">
        <p>Emitido em: ${dataAtual}</p>
      </div>

      <!-- Informações do Lote -->
      <div class="info-section">
        <h3>Informações do Lote</h3>
        <div class="info-row">
          <span class="info-label">Identificação:</span>
          <span class="info-value">${nomeLote}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Área:</span>
          <span class="info-value">${areaLote}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Valor Base:</span>
          <span class="info-value">${valorLote}</span>
        </div>
      </div>

      <!-- Forma de Pagamento -->
      <div class="payment-section">
        <h3>Condições de Pagamento</h3>
        <p style="margin-bottom: 15px; font-size: 13px; color: #67808b;">
          <strong style="color: #183243;">Opção Selecionada:</strong> ${formaPagamentoText}
        </p>
        <div class="payment-details">
          ${resumoPagamento}
        </div>
      </div>

      <!-- Datas -->
      <div class="field-section">
        <div class="field-label">Data da Entrada:</div>
        <div class="field-line">${escapeHtml(dadosProposta.dataEntrada)}</div>
      </div>

      <div class="field-section">
        <div class="field-label">Primeiro Vencimento:</div>
        <div class="field-line">${escapeHtml(dadosProposta.dataVencimento)}</div>
        <p style="font-size: 11px; color: #67808b; margin-top: 5px;">
          *Os demais vencimentos serão no mesmo dia do mês subsequente
        </p>
      </div>

      <!-- Observações -->
      <div class="observations">
        <strong style="display: block; margin-bottom: 10px; color: #183243;">Observações:</strong>
        <div style="border: 1px solid #ddd; padding: 15px; min-height: 80px; background: #fafafa;">
          ${dadosProposta.observacoes ? escapeHtml(dadosProposta.observacoes).replace(/\n/g, '<br>') : ''}
        </div>
      </div>

      <!-- Mapa do Lote (ÚLTIMA PÁGINA) -->
      ${mapaImage ? `
      <div class="mapa-section">
        <h3>Localização do Lote</h3>
        <img src="${mapaImage}" alt="Mapa do Lote" class="mapa-image">
      </div>
      ` : ''}

      <!-- Assinaturas -->
      <div class="signatures">
        <div class="signature-block">
          <div class="signature-line"></div>
          <p>Corretor</p>
          <p style="font-size: 10px; font-weight: normal; color: #67808b;">CPF: ${escapeHtml(dadosProposta.cpfCorretor)}</p>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <p>Comprador</p>
          <p style="font-size: 10px; font-weight: normal; color: #67808b;">CPF: ${escapeHtml(dadosProposta.cpfCliente)}</p>
        </div>
      </div>

      <!-- Rodapé -->
      <div class="footer">
        <p>Este documento é uma proposta comercial e deve ser assinado pelas partes para ter validade.</p>
        <p style="margin-top: 10px;">Parque Rio Grande © ${new Date().getFullYear()}</p>
      </div>
    </div>
  `;

  const novaJanela = window.open('', '_blank', 'width=1200,height=900');
  if (!novaJanela) {
    alert('Popup bloqueado: permita popups para este site.');
    return;
  }

  novaJanela.document.write(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Proposta - ${nomeLote}</title>
        ${css}
      </head>
      <body>
        ${conteudo}
        <script>
          window.onload = function() {
            setTimeout(() => {
              window.print();
              window.onafterprint = () => window.close();
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `);

  novaJanela.document.close();
  novaJanela.focus();
}
  


