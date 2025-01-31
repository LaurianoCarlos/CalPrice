document.addEventListener("DOMContentLoaded", async function () {
    // Captura valores da página ativa
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getPrices" }, async function (response) {
            if (chrome.runtime.lastError || !response) {
                document.getElementById("price").textContent = "Erro ao capturar";
                document.getElementById("shipping").textContent = "Erro ao capturar";
                document.getElementById("total").textContent = "Erro ao capturar";
                document.getElementById("totalBRL").textContent = "Erro ao capturar";
                return;
            }

            document.getElementById("price").textContent = `ARS ${response.price}`;
            document.getElementById("shipping").textContent = `ARS ${response.shipping}`;
            document.getElementById("total").textContent = `ARS ${response.total}`;

            // Converte ARS para BRL e aplica os cálculos financeiros
            const totalARS = formatToNumber(response.total);
            if (!isNaN(totalARS)) {
                const totalBRL = parseFloat(await converterARStoBRL(totalARS));
                
                if (!isNaN(totalBRL)) {
                    document.getElementById("totalBRL").textContent = `BRL ${formatNumberBRL(totalBRL)}`;
                    aplicarCalculosFinanceiros(totalBRL);
                } else {
                    document.getElementById("totalBRL").textContent = "Erro ao converter ARS para BRL";
                }
            } else {
                document.getElementById("totalBRL").textContent = "Erro na conversão";
            }
        });
    });

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

    // Aplicação dos cálculos financeiros
    function aplicarCalculosFinanceiros(valorEmReais) {
        if (isNaN(valorEmReais)) {
            console.error("Erro: valorEmReais não é um número válido.");
            document.getElementById("precoFinal").textContent = "Erro ao calcular valores.";
            return;
        }

        var oscilacaoCambio = 0.01;
        var markup = 2.7;
        var taxaCartao = 0.05;
        var taxaMarketing = 0.1;
        var taxaDevolucao = 0.03;
        var taxaPlataforma = 0.04;

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
        document.getElementById("precoFinal").textContent = `Preço Final: R$ ${formatNumberBRL(precoFinal)}`;
        document.getElementById("lucroBruto").textContent = `Lucro Bruto: R$ ${formatNumberBRL(lucroBruto)}`;
        document.getElementById("deducaoCartao").textContent = `Taxa do Cartão (5%): R$ ${formatNumberBRL(deducaoCartao)}`;
        document.getElementById("deducaoMarketing").textContent = `Taxa de Marketing (10%): R$ ${formatNumberBRL(deducaoMarketing)}`;
        document.getElementById("deducaoDevolucao").textContent = `Taxa de Devolução/Cancelamento (3%): R$ ${formatNumberBRL(deducaoDevolucao)}`;
        document.getElementById("deducaoPlataforma").textContent = `Comissão da Plataforma (4%): R$ ${formatNumberBRL(deducaoPlataforma)}`;
        document.getElementById("totalDeducoes").textContent = `Total de Deduções: R$ ${formatNumberBRL(totalDeducoes)}`;
        document.getElementById("margemContribuicao").textContent = `Margem de Contribuição: R$ ${formatNumberBRL(margemContribuicao)}`;
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

    // Evento de cópia para o botão
    document.getElementById("copyButton").addEventListener("click", function () {
        const textToCopy = document.getElementById("precoFinal").textContent;
        navigator.clipboard.writeText(textToCopy).catch(err => console.error("Erro ao copiar:", err));
    });
});
