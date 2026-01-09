const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:3000"
  : "https://calculadoraparqueriogrande.onrender.com";

let lotes = [];
let filtroEmpreendimentoValue = "";
let filtroQuadraValue = "";
let filtroLoteValue = "";

// 🔹 CARREGAR LOTES DO RENDER
async function carregarLotes() {
  try {
    const res = await fetch(`${API_BASE}/lotes`);
    if (!res.ok) throw new Error();

    const data = await res.json();

    lotes = data.map(l => ({
      ...l,
      Valor: Number(l.Valor),
      Vendido: l.Vendido === true || l.Vendido === "TRUE",
      Nome: l.Nome || ""
    }));

    montarTabela();
  } catch {
    alert("❌ Erro ao carregar dados do servidor");
  }
}

// 🔹 MONTA TABELA
function montarTabela() {
  const tbody = document.querySelector("#tabela tbody");
  tbody.innerHTML = "";

  lotes.forEach((lote, index) => {
    const nomeUpper = lote.Nome.toUpperCase();

    // Filtrar por empreendimento
    const passaEmpreendimento = filtroEmpreendimentoValue === "" || nomeUpper.startsWith(filtroEmpreendimentoValue + "-");

    // Extrai letra da quadra
    const matchQuadra = nomeUpper.match(/QUADRA\s+([A-Z])/);
    const letraQuadra = matchQuadra ? matchQuadra[1] : "";
    const passaQuadra = filtroQuadraValue === "" || letraQuadra === filtroQuadraValue.toUpperCase();

    // Extrai número do lote
    const matchLote = nomeUpper.match(/LOTE\s+(\d+)/);
    const numeroLote = matchLote ? matchLote[1] : "";
    const passaLote = filtroLoteValue === "" || numeroLote.includes(filtroLoteValue);

    // Só exibe se passar todos os filtros
    if (passaEmpreendimento && passaQuadra && passaLote) {
      const tr = document.createElement("tr");
      tr.className = lote.Vendido ? "vendido" : "livre";

      tr.innerHTML = `
        <td>${lote.ID}</td>
        <td>${lote.Nome}</td>
        <td>${lote.Area}</td>
        <td>
          <input
            type="number"
            value="${lote.Valor.toFixed(2)}"
            onchange="alterarValor(${index}, this.value)"
          >
        </td>
        <td>
          <select onchange="alterarVendido(${index}, this.value)">
            <option value="false" ${!lote.Vendido ? "selected" : ""}>Disponível</option>
            <option value="true" ${lote.Vendido ? "selected" : ""}>Vendido</option>
          </select>
        </td>
      `;
      tbody.appendChild(tr);
    }
  });
}

// 🔹 ALTERA VALOR
function alterarValor(index, novoValor) {
  lotes[index].Valor = Number(novoValor);
  lotes[index].modificado = true;
}

// 🔹 ALTERA STATUS
function alterarVendido(index, valor) {
  lotes[index].Vendido = valor === "true";
  lotes[index].modificado = true;
  montarTabela();
}

// 🔹 SALVA NO BACKEND (Render)
async function salvar() {
  const lotesModificados = lotes.filter(l => l.modificado);

  if (lotesModificados.length === 0) {
    alert("⚠️ Nenhuma alteração para salvar.");
    return;
  }

  try {
    let erros = 0;
    for (const lote of lotesModificados) {
      // Cria uma cópia do lote sem a flag 'modificado' para enviar ao servidor
      const { modificado, ...dadosLote } = lote;

      const response = await fetch(`${API_BASE}/lotes/${lote.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dadosLote)
      });

      if (!response.ok) {
        console.error(`Erro ao salvar lote ${lote.ID}: ${response.statusText}`);
        erros++;
      } else {
        lote.modificado = false; // Reset flag apenas se salvou com sucesso
      }
    }

    if (erros > 0) {
      alert(`⚠️ Salvo com ${erros} erros. Verifique o console.`);
    } else {
      alert("✅ Dados salvos com sucesso!");
    }

    // Recarrega para garantir sincronia
    carregarLotes();

  } catch (err) {
    console.error(err);
    alert("❌ Erro crítico ao salvar os dados.");
  }
}

// 🔹 EVENTOS DOS FILTROS
document.getElementById("filtroEmpreendimento").addEventListener("change", (e) => {
  filtroEmpreendimentoValue = e.target.value;
  montarTabela();
});
document.getElementById("filtroQuadra").addEventListener("input", (e) => {
  filtroQuadraValue = e.target.value;
  montarTabela();
});
document.getElementById("filtroLote").addEventListener("input", (e) => {
  filtroLoteValue = e.target.value;
  montarTabela();
});

// 🔹 APLICAR CORREÇÃO AUTOMÁTICA
document.getElementById("aplicarCorrecao").addEventListener("click", () => {
  const valorCorrecao = parseFloat(document.getElementById("valorCorrecao").value);
  const tipo = document.getElementById("tipoCorrecao").value;

  if (isNaN(valorCorrecao)) {
    alert("Digite um valor válido para correção");
    return;
  }

  lotes.forEach((lote, index) => {
    const nomeUpper = lote.Nome.toUpperCase();

    const passaEmpreendimento = filtroEmpreendimentoValue === "" || nomeUpper.startsWith(filtroEmpreendimentoValue + "-");
    const matchQuadra = nomeUpper.match(/QUADRA\s+([A-Z])/);
    const letraQuadra = matchQuadra ? matchQuadra[1] : "";
    const passaQuadra = filtroQuadraValue === "" || letraQuadra === filtroQuadraValue.toUpperCase();
    const matchLote = nomeUpper.match(/LOTE\s+(\d+)/);
    const numeroLote = matchLote ? matchLote[1] : "";
    const passaLote = filtroLoteValue === "" || numeroLote.includes(filtroLoteValue);

    if (passaEmpreendimento && passaQuadra && passaLote) {
      if (tipo === "valor") {
        lote.Valor += valorCorrecao;
      } else if (tipo === "percentual") {
        lote.Valor += lote.Valor * (valorCorrecao / 100);
      }
    }
  });

  montarTabela();
});

// 🔹 INICIALIZA
document.addEventListener("DOMContentLoaded", carregarLotes);