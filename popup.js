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
