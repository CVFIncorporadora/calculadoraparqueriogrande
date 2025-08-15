export function imprimirMapa() {
    
    // Captura o HTML atualizado do painel e do conteúdo
    const painelHTML = document.querySelector(".painel")?.outerHTML || '';
    const conteudoHTML = document.querySelector(".conteudo")?.outerHTML || '';
  
    // Data atual para o rodapé
    const dataAtual = new Date().toLocaleDateString('pt-BR');
  
    // Rodapé com data e linha para assinatura
    const corretor = `
    <div style="margin-top: 60px; font-family: Arial, sans-serif; font-size: 14px; text-align: left;">
      <div style="display: flex; align-items: flex-end; gap: 10px;">
        <span style="font-size: 22px;">X</span>
        <div style="width: 300px; border-bottom: 2px solid #000; height: 1px;"></div>
      </div>
      <div style="margin-left: 35px; margin-top: 5px;">
        <p style="margin: 0;">Corretor</p>
        <p style="margin: 0;">CPF:</p>
      </div>
    </div>
    `;
    const assinaturas = `
    <div style="margin-top: 60px; font-family: Arial, sans-serif; font-size: 14px; display: flex; justify-content: space-between; gap: 60px;">
    
      <!-- Assinatura 1 -->
      <div style="flex: 1;">
        <div style="display: flex; align-items: flex-end; gap: 10px;">
          <span style="font-size: 22px;">X</span>
          <div style="flex: 1; border-bottom: 2px solid #000; height: 1px;"></div>
        </div>
        <div style="margin-left: 35px; margin-top: 5px;">
          <p style="margin: 0;">Nome: </p>
          <p style="margin: 0;">CPF: </p>
        </div>
      </div>
    
      <!-- Assinatura 2 -->
      <div style="flex: 1;">
        <div style="display: flex; align-items: flex-end; gap: 10px;">
          <span style="font-size: 22px;">X</span>
          <div style="flex: 1; border-bottom: 2px solid #000; height: 1px;"></div>
        </div>
        <div style="margin-left: 35px; margin-top: 5px;">
          <p style="margin: 0;">Nome: </p>
          <p style="margin: 0;">CPF: </p>
        </div>
      </div>
    
    </div>
    `;
  const data_entrada = `
  <div style="margin-top: 40px; font-family: Arial, sans-serif; font-size: 14px;">
    <div style="display: flex; align-items: flex-end; gap: 10px;">
      <span>Data da entrada:</span>
      <div style="width: 300px; border-bottom: 1px solid #000; height: 1px;"></div>
      
    </div>
  </div>
`;
const data_vencimento = `
<div style="margin-top: 40px; font-family: Arial, sans-serif; font-size: 14px;">
  <div style="display: flex; align-items: flex-end; gap: 10px;">
    <span>Dia para Primeiro vencimento:</span>
    <div style="width: 200px; border-bottom: 1px solid #000; height: 1px;"></div>
    <span>*demais vencimentos devem ser no mesmo dia nos meses subsequentes. </span>
  </div>
</div>
`;
const observacoes = `
<div style="margin-top: 40px; font-family: Arial, sans-serif; font-size: 14px;">
  <span>Observações:</span>
  <div style="margin-top: 10px;">
    <div style="flex: 1; border-bottom: 1px solid #000; height: 20px; margin-bottom: 10px;"></div>
    <div style="flex: 1; border-bottom: 1px solid #000; height: 20px; margin-bottom: 10px;"></div>
    <div style="flex: 1; border-bottom: 1px solid #000; height: 20px; margin-bottom: 10px;"></div>
    <div style="flex: 1; border-bottom: 1px solid #000; height: 20px; margin-bottom: 10px;"></div>
    <div style="flex: 1; border-bottom: 1px solid #000; height: 20px;"></div>
  </div>
</div>
`;
    // CSS para a impressão
    const css = `
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0; padding: 0;
        }
        .painel {
          width: 800px;
          padding: 20px;
          box-sizing: border-box;
          font-size: 28px;
          position: center;

        }
          #formaPagamento {
          width: 100%;
          padding: 10px;
          font-size: 50px;
          border-radius: 6px;
          border: none;
          background-color: #fbfbfd;
          color: rgb(0, 0, 0);
          margin-top: 8px;
          display: none;
         }
        .conteudo {
          margin-left: 0px;
          margin-top: 0px;
          position: relative;
          width: 2px; /* parece pequeno, ajuste se quiser */
          height: 1292px; /* altura do SVG */
        }
        .conteudo img {
          width: 1000px;
          height: auto;
          display: block;
        }
        .conteudo svg {
          position: relative; /* ou absolute se preferir */
          width: 2000px;
          height: 2584px;
          transform: translate(-499px, -646px) scale(0.5);
        }
        button {
          display: none;
        }
          @media print 
             {
  label[for="formaPagamento"],
  #formaPagamento {
    display: none !important;
  }
}
      </style>
    `;
  
    // Abre a nova janela para impressão
    const novaJanela = window.open('', '_blank', 'width=1200,height=800');
    if (!novaJanela) {
      alert('Popup bloqueado: permita popups para este site.');
      return;
    }
  
    // Escreve o conteúdo HTML da nova janela, incluindo o rodapé
    novaJanela.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Proposta</title>
          ${css}
        </head>
        <body>
          ${painelHTML}
          ${data_entrada}
          ${data_vencimento}
          ${observacoes}
          ${assinaturas}
          ${corretor}
          ${conteudoHTML}
         
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 300);
            };
          <\/script>
        </body>
      </html>
    `);
  
    novaJanela.document.close();
    novaJanela.focus();
  }
  


