// controle.js

const htmlForm = document.querySelector("#form");
const descTrasacaoInput = document.getElementById("descricao");
const valorTransacaoInput = document.getElementById("montante");
const tipoInput = document.getElementById("tipo");

const balancoH1 = document.querySelector("#balanco");
const receitaP = document.querySelector("#din-positivo");
const despesaP = document.querySelector("#din-negativo");
const trasacoesUl = document.querySelector("#transacoes");

const chave_transacoes_storage = "if_financas";
let transacoesSalvas = JSON.parse(localStorage.getItem(chave_transacoes_storage)) || [];
let contadorID = parseInt(localStorage.getItem("contador_id")) || 0;

htmlForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const descricaoTransacaoStr = descTrasacaoInput.value.trim();
    const valorTransacaoStr = valorTransacaoInput.value.trim();

    if (descricaoTransacaoStr === "") {
        alert("Preencha a descrição da transação!");
        descTrasacaoInput.focus();
        return;
    }

    if (valorTransacaoStr === "") {
        alert("Preencha o valor da transação!");
        valorTransacaoInput.focus();
        return;
    }

    let valor = parseFloat(valorTransacaoStr);
    if (tipoInput.value === "despesa") {
        valor = -Math.abs(valor);
    }

    const transacao = {
        id: contadorID++,
        descricao: descricaoTransacaoStr,
        valor: valor
    };

    localStorage.setItem("contador_id", contadorID);

    transacoesSalvas.push(transacao);
    localStorage.setItem(chave_transacoes_storage, JSON.stringify(transacoesSalvas));

    somaAoSaldo(transacao);
    somaReceitaDespesa(transacao);
    addTransacaoALista(transacao);

    descTrasacaoInput.value = "";
    valorTransacaoInput.value = "";
});

function addTransacaoALista(transacao) {
    const sinal = transacao.valor > 0 ? "" : "-";
    const classe = transacao.valor > 0 ? "positivo" : "negativo";

    const li = document.createElement("li");
    li.classList.add(classe);
    li.setAttribute("data-id", transacao.id);
    li.innerHTML = `
        ${transacao.descricao} 
        <span>${sinal}R$${Math.abs(transacao.valor)}</span>
        <button class="delete-btn" onclick="removeTrasaction(${transacao.id})">X</button>
    `;
    trasacoesUl.appendChild(li);
}

function somaReceitaDespesa(transacao) {
    const elemento = transacao.valor > 0 ? receitaP : despesaP;
    const prefixo = transacao.valor > 0 ? "+ R$" : "- R$";

    let valorAtual = parseFloat(elemento.innerHTML.replace(prefixo, "")) || 0;
    valorAtual += Math.abs(transacao.valor);

    elemento.innerHTML = `${prefixo}${valorAtual.toFixed(2)}`;
}

function somaAoSaldo(transacao) {
    let total = parseFloat(balancoH1.innerHTML.replace("R$", "")) || 0;
    total += transacao.valor;
    balancoH1.innerHTML = `R$${total.toFixed(2)}`;
}

function atualizaBalancoRemocao(transacao) {
    const valor = transacao.valor;
    let total = parseFloat(balancoH1.innerHTML.replace("R$", "")) || 0;
    total -= valor;
    balancoH1.innerHTML = `R$${total.toFixed(2)}`;

    if (valor > 0) {
        let receita = parseFloat(receitaP.innerHTML.replace("+ R$", "")) || 0;
        receita -= valor;
        receitaP.innerHTML = `+ R$${receita.toFixed(2)}`;
    } else {
        let despesa = parseFloat(despesaP.innerHTML.replace("- R$", "")) || 0;
        despesa -= Math.abs(valor);
        despesaP.innerHTML = `- R$${despesa.toFixed(2)}`;
    }
}

function removeTrasaction(transactionId) {
    const index = transacoesSalvas.findIndex(t => t.id === transactionId);
    if (index > -1) {
        const transacao = transacoesSalvas[index];
        transacoesSalvas.splice(index, 1);
        localStorage.setItem(chave_transacoes_storage, JSON.stringify(transacoesSalvas));

        const li = document.querySelector(`li[data-id='${transactionId}']`);
        if (li) li.remove();

        atualizaBalancoRemocao(transacao);
    }
}

function carregaDados() {
    trasacoesUl.innerHTML = "";
    receitaP.innerHTML = "+ R$0.00";
    despesaP.innerHTML = "- R$0.00";
    balancoH1.innerHTML = "R$0.00";

    transacoesSalvas.forEach(transacao => {
        somaAoSaldo(transacao);
        somaReceitaDespesa(transacao);
        addTransacaoALista(transacao);
    });
}

carregaDados();
