let oscilacaoCambio = 0.01;
let markup = 2.7;
let taxaCartao = 0.05;
let taxaMarketing = 0.1;
let taxaDevolucao = 0.03;
let taxaPlataforma = 0.04;

let totalBRL = 0;

document.addEventListener("DOMContentLoaded", async function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getPrices" }, async function (response) {
            if (chrome.runtime.lastError || !response) {
                document.getElementById("price").textContent = "Erro ao capturar";
                document.getElementById("shipping").textContent = "Erro ao capturar";
                document.getElementById("total").textContent = "Erro ao capturar";
                document.getElementById("totalBRL").textContent = "Erro ao capturar";
                document.getElementById("totalARS").textContent = "Erro ao capturar";
                return;
            }

            document.getElementById("price").textContent = `ARS ${response.price}`;
            document.getElementById("shipping").textContent = `ARS ${response.shipping}`;
            document.getElementById("total").textContent = `ARS ${response.total}`;

            const totalARS = formatToNumber(response.total);
            if (!isNaN(totalARS)) {
                totalBRL = parseFloat(await converterARStoBRL(totalARS));

                if (!isNaN(totalBRL)) {
                    document.getElementById("totalBRL").textContent = `BRL ${formatNumberBRL(totalBRL)}`;
                    const precoFinal = aplicarCalculosFinanceiros(totalBRL);
                    atualizarPrecoARS(precoFinal);
                } else {
                    document.getElementById("totalBRL").textContent = "Erro ao converter ARS para BRL";
                }
            } else {
                document.getElementById("totalBRL").textContent = "Erro na conversão";
            }
        });
    });

    // Captura os valores dos inputs e atualiza as variáveis
    document.querySelectorAll(".container input").forEach(input => {
        input.addEventListener("input", async function () {
            oscilacaoCambio = parseFloat(document.getElementById("oscilacaoCambio").value) / 100;
            markup = parseFloat(document.getElementById("markup").value);
            taxaCartao = parseFloat(document.getElementById("taxaCartao").value) / 100;
            taxaMarketing = parseFloat(document.getElementById("taxaMarketing").value) / 100;
            taxaDevolucao = parseFloat(document.getElementById("taxaDevolucao").value) / 100;
            taxaPlataforma = parseFloat(document.getElementById("taxaPlataforma").value) / 100;

            if (!isNaN(totalBRL) && totalBRL > 0) {
                const precoFinal = aplicarCalculosFinanceiros(totalBRL);
                atualizarPrecoARS(precoFinal);
            }
        });
    });
});

// Atualiza o preço final convertido para ARS em tempo real
async function atualizarPrecoARS(precoFinal) {
    if (!isNaN(precoFinal)) {
        const precoFinalARS = await converterBRLtoARS(precoFinal);
        document.getElementById("totalARS").textContent = `PREÇO DE VENDA: ARS ${formatNumberBRL(precoFinalARS)}`;
    } else {
        document.getElementById("totalARS").textContent = "Erro ao calcular preço em ARS";
    }
}

// Aplicação dos cálculos financeiros
function aplicarCalculosFinanceiros(valorEmReais) {
    if (isNaN(valorEmReais)) {
        console.error("Erro: valorEmReais não é um número válido.");
        document.getElementById("precoFinal").textContent = "Erro ao calcular valores.";
        return NaN;
    }

    function calcularPrecoFinal() {
        let valorComOscilacao = valorEmReais + (valorEmReais * oscilacaoCambio);
        let precoFinal = valorComOscilacao * markup;
        return parseFloat(precoFinal.toFixed(2));
    }

    function calcularLucroBruto(precoFinal) {
        return parseFloat((precoFinal - valorEmReais).toFixed(2));
    }

    function calcularDeducao(precoFinal, taxa) {
        return parseFloat((precoFinal * taxa).toFixed(2));
    }

    const precoFinal = calcularPrecoFinal();
    const lucroBruto = calcularLucroBruto(precoFinal);
    const deducaoCartao = calcularDeducao(precoFinal, taxaCartao);
    const deducaoMarketing = calcularDeducao(precoFinal, taxaMarketing);
    const deducaoDevolucao = calcularDeducao(precoFinal, taxaDevolucao);
    const deducaoPlataforma = calcularDeducao(precoFinal, taxaPlataforma);

    const totalDeducoes = deducaoCartao + deducaoMarketing + deducaoDevolucao + deducaoPlataforma;
    const margemContribuicao = parseFloat((lucroBruto - totalDeducoes).toFixed(2));

    // Exibe os valores no HTML com descrições
    document.getElementById("precoFinal").textContent = `Preço Calculado: R$ ${formatNumberBRL(precoFinal)}`;
    document.getElementById("lucroBruto").textContent = `Lucro Bruto: R$ ${formatNumberBRL(lucroBruto)}`;
    document.getElementById("deducaoCartao").textContent = `Taxa do Cartão: R$ ${formatNumberBRL(deducaoCartao)}`;
    document.getElementById("deducaoMarketing").textContent = `Taxa de Marketing: R$ ${formatNumberBRL(deducaoMarketing)}`;
    document.getElementById("deducaoDevolucao").textContent = `Taxa de Devolução: R$ ${formatNumberBRL(deducaoDevolucao)}`;
    document.getElementById("deducaoPlataforma").textContent = `Taxa da Plataforma: R$ ${formatNumberBRL(deducaoPlataforma)}`;
    document.getElementById("totalDeducoes").textContent = `Total de Deduções: R$ ${formatNumberBRL(totalDeducoes)}`;
    document.getElementById("margemContribuicao").textContent = `Margem de Contribuição: R$ ${formatNumberBRL(margemContribuicao)}`;

    return precoFinal;
}

// Função para formatar valores em BRL
function formatNumberBRL(num) {
    return parseFloat(num).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função para converter string ARS para número válido
function formatToNumber(value) {
    if (typeof value === "string") {
        return parseFloat(value.replace(/\./g, "").replace(",", "."));
    }
    return value;
}

// Função para converter ARS para BRL
async function converterARStoBRL(valorARS) {
    const url = 'https://economia.awesomeapi.com.br/last/ARS-BRL';
    try {
        const response = await fetch(url);
        const data = await response.json();
        const taxaDeCambio = parseFloat(data.ARSBRL.bid);
        return (valorARS * taxaDeCambio).toFixed(2);
    } catch (error) {
        console.error('Erro ao obter a taxa de câmbio:', error);
        return NaN;
    }
}

// Função para converter BRL para ARS
async function converterBRLtoARS(valorBRL) {
    const url = 'https://economia.awesomeapi.com.br/last/BRL-ARS';
    try {
        const response = await fetch(url);
        const data = await response.json();
        const taxaDeCambio = parseFloat(data.BRLARS.bid);
        return (valorBRL * taxaDeCambio).toFixed(2);
    } catch (error) {
        console.error('Erro ao obter a taxa de câmbio para ARS:', error);
        return NaN;
    }
}

// Evento de cópia para o botão
document.getElementById("copyButton").addEventListener("click", function () {
    const textToCopy = document.getElementById("totalARS").textContent;
    navigator.clipboard.writeText(textToCopy).catch(err => console.error("Erro ao copiar:", err));
});
