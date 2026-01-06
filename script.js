const API_BASE = "https://backend-parque-riogrande.onrender.com";

let lotes = [];

// 🔹 CARREGA DO BACKEND
async function carregarLotes() {
  try {
    const res = await fetch(`${API_BASE}/lotes`);
    if (!res.ok) throw new Error("Erro ao buscar lotes");

    const data = await res.json();

    lotes = data.map(l => ({
      ...l,
      Valor: Number(l.Valor),
      Vendido: l.Vendido === true || l.Vendido === "TRUE"
    }));

    montarTabela();
  } catch (err) {
    alert("Erro ao carregar lotes do servidor");
    console.error(err);
  }
}

function montarTabela() {
  const tbody = document.querySelector("#tabela tbody");
  if (!tbody) {
    console.error("Tabela não encontrada");
    return;
  }

  tbody.innerHTML = "";

  lotes.forEach((lote, index) => {
    const tr = document.createElement("tr");
    tr.className = lote.Vendido ? "vendido" : "livre";

    tr.innerHTML = `
      <td>${lote.ID}</td>
      <td>${lote.Nome}</td>
      <td>${lote.Area}</td>
      <td>
        <input type="number"
               value="${lote.Valor}"
               onchange="alterarValor(${index}, this.value)">
      </td>
      <td>
        <select onchange="alterarVendido(${index}, this.value)">
          <option value="false" ${!lote.Vendido ? "selected" : ""}>Disponível</option>
          <option value="true" ${lote.Vendido ? "selected" : ""}>Vendido</option>
        </select>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function alterarValor(index, novoValor) {
  lotes[index].Valor = Number(novoValor);
}

function alterarVendido(index, valor) {
  lotes[index].Vendido = valor === "true";
  montarTabela();
}

async function salvar() {
  try {
    for (const lote of lotes) {
      await fetch(`${API_BASE}/lotes/${lote.ID}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Valor: lote.Valor,
          Vendido: lote.Vendido
        })
      });
    }
    alert("Lotes atualizados com sucesso!");
  } catch (err) {
    alert("Erro ao salvar dados");
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", carregarLotes);









