document.addEventListener("DOMContentLoaded", function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "getPrices" }, function (response) {
            if (chrome.runtime.lastError || !response) {
                document.getElementById("price").textContent = "Erro ao capturar";
                document.getElementById("shipping").textContent = "Erro ao capturar";
                document.getElementById("total").textContent = "Erro ao capturar";
                return;
            }

            document.getElementById("price").textContent = `ARS ${response.price}`;
            document.getElementById("shipping").textContent = `ARS ${response.shipping}`;
            document.getElementById("total").textContent = `ARS ${response.total}`;
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const formatNumberBRL = (num) =>
        num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const totalValue = 1234567.89;
    document.getElementById("total").textContent = formatNumberBRL(totalValue);

    document.getElementById("copyButton").addEventListener("click", function () {
        const textToCopy = document.getElementById("total").textContent;
        navigator.clipboard.writeText(textToCopy).catch(err => console.error("Erro ao copiar:", err));
    });
});

