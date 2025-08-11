export function imprimirMapa() {
    
    // Captura o HTML atualizado do painel e do conteúdo
    const painelHTML = document.querySelector(".painel")?.outerHTML || '';
    const conteudoHTML = document.querySelector(".conteudo")?.outerHTML || '';
  
    // Data atual para o rodapé
    const dataAtual = new Date().toLocaleDateString('pt-BR');
  
    // Rodapé com data e linha para assinatura
    const rodape = `
      <div style="margin-top: 40px; font-family: Arial, sans-serif; font-size: 14px;">
        <p>Data: ${dataAtual}</p>
        <p>Assinatura:</p>
        <div style="border-bottom: 1px solid #000; width: 300px; height: 1px; margin-top: 40px;"></div>
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
          @media print {
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
          <title>Impressão</title>
          ${css}
        </head>
        <body>
          ${painelHTML}
          ${conteudoHTML}
          ${rodape}
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
  