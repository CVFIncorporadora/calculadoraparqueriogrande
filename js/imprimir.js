export async function imprimirMapa() {
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
        margin: 30px 0;
        text-align: center;
        page-break-before: always;
      }

      .mapa-section h3 {
        font-size: 14px;
        font-weight: 700;
        color: #183243;
        text-transform: uppercase;
        margin-bottom: 15px;
        letter-spacing: 0.5px;
      }

      .mapa-image {
        max-width: 100%;
        height: auto;
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
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
        gap: 50px;
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
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #183243;
        text-align: center;
        font-size: 10px;
        color: #67808b;
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
        <div class="field-line"></div>
      </div>

      <div class="field-section">
        <div class="field-label">Primeiro Vencimento:</div>
        <div class="field-line"></div>
        <p style="font-size: 11px; color: #67808b; margin-top: 5px;">
          *Os demais vencimentos serão no mesmo dia do mês subsequente
        </p>
      </div>

      <!-- Observações -->
      <div class="observations">
        <strong style="display: block; margin-bottom: 10px; color: #183243;">Observações:</strong>
        <div style="border: 1px solid #ddd; padding: 15px; min-height: 80px; background: #fafafa;">
        </div>
      </div>

      <!-- Assinaturas -->
      <div class="signatures">
        <div class="signature-block">
          <div class="signature-line"></div>
          <p>Corretor</p>
          <p style="font-size: 10px; font-weight: normal; color: #67808b;">CPF: _________________</p>
        </div>
        <div class="signature-block">
          <div class="signature-line"></div>
          <p>Comprador</p>
          <p style="font-size: 10px; font-weight: normal; color: #67808b;">CPF: _________________</p>
        </div>
      </div>

      <!-- Mapa do Lote (ÚLTIMA PÁGINA) -->
      ${mapaImage ? `
      <div class="mapa-section">
        <h3>Localização do Lote</h3>
        <img src="${mapaImage}" alt="Mapa do Lote" class="mapa-image">
      </div>
      ` : ''}

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
  


