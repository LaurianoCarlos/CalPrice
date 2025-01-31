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

            // Converte ARS para BRL e exibe
            const totalARS = formatToNumber(response.total);
            if (!isNaN(totalARS)) {
                const totalBRL = await converterARStoBRL(totalARS);
                document.getElementById("totalBRL").textContent = `BRL ${formatNumberBRL(totalBRL)}`;
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
            return "Erro";
        }
    }

    // Função para formatar números para BRL
    const formatNumberBRL = (num) =>
        parseFloat(num).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Função para converter string ARS para número válido
    function formatToNumber(value) {
        if (typeof value === "string") {
            return parseFloat(value.replace(/\./g, "").replace(",", "."));
        }
        return value;
    }

    // Evento de cópia para o botão
    document.getElementById("copyButton").addEventListener("click", function () {
        const textToCopy = document.getElementById("total").textContent;
        navigator.clipboard.writeText(textToCopy).catch(err => console.error("Erro ao copiar:", err));
    });
});
