let lotes = [];

document.getElementById("upload").addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        lotes = JSON.parse(event.target.result);
        montarTabela();
    };
    reader.readAsText(file);
});

function montarTabela() {
    const tbody = document.querySelector("#tabela tbody");
    tbody.innerHTML = "";

    lotes.forEach((lote, index) => {
        const tr = document.createElement("tr");
        tr.className = lote.Vendido === "TRUE" ? "vendido" : "livre";

        tr.innerHTML = `
            <td>${lote.ID}</td>
            <td>${lote.Nome}</td>
            <td>${lote.Area}</td>

            <td>
                <input 
                    type="number" 
                    value="${lote.Valor}"
                    style="width:120px"
                    onchange="alterarValor(${index}, this.value)"
                >
            </td>

            <td>
                <select onchange="alterarVendido(${index}, this.value)">
                    <option value="FALSE" ${lote.Vendido === "FALSE" ? "selected" : ""}>Disponível</option>
                    <option value="TRUE" ${lote.Vendido === "TRUE" ? "selected" : ""}>Vendido</option>
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
    lotes[index].Vendido = valor;
    montarTabela();
}

function salvar() {
    const json = JSON.stringify(lotes, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "lotes_atualizado.json";
    a.click();

    URL.revokeObjectURL(url);
}



