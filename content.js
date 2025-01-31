
window.addEventListener("load", () => {
    console.log("🔄 Página carregada, iniciando extração de valores...");

 
    const parseCurrency = (value, label) => {
        if (!value) return 0;

        console.log(`Valor original de ${label}:`, value);
        let cleanedValue = value.replace(/[^0-9,\.]/g, '');

        console.log(`Valor limpo de ${label}:`, cleanedValue);

        if (cleanedValue.includes(',') && cleanedValue.includes('.')) {
            cleanedValue = cleanedValue.replace(/\./g, '').replace(',', '.');
        } else if (cleanedValue.includes('.') && cleanedValue.match(/\d{4,}/)) {
            cleanedValue = cleanedValue.replace(/\./g, '');
        } else if (cleanedValue.includes(',')) {
            cleanedValue = cleanedValue.replace(',', '.');
        }

        let numericValue = parseFloat(cleanedValue.replace(',', '.'));
        console.log(`Valor final convertido de ${label}:`, numericValue);

        return numericValue;
    };

 
    const getPriceElement = () => {
        return document.querySelector(
            '[class*="price--currentPriceText"], [class*="banner--price"], [class*="price--current--"], [class*="pdp-price"], [class*="current-price"]'
        );
    };

    const getShippingElement = () => {
        return document.querySelector(
            '[class*="dynamic-shipping-line"] strong, [class*="shipping-cost"], [class*="delivery-price"], [class*="frete"]'
        );
    };


    let priceElement = getPriceElement();
    let shippingElement = getShippingElement();

    if (!priceElement) console.warn("⚠️ Elemento do preço não encontrado! Verifique a estrutura do site.");
    if (!shippingElement) console.warn("⚠️ Elemento do frete não encontrado! Verifique a estrutura do site.");

    let price = priceElement ? parseCurrency(priceElement.innerText.trim(), "Preço") : 0;
    let shipping = shippingElement ? parseCurrency(shippingElement.innerText.trim(), "Frete") : 0;
    let total = price + shipping;


    const formatNumber = (num) => num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    console.log(`Preço Limpo: ARS ${formatNumber(price)}`);
    console.log(`Frete Limpo: ARS ${formatNumber(shipping)}`);
    console.log(`Total: ARS ${formatNumber(total)}`);

 
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "getPrices") {
            sendResponse({
                price: formatNumber(price),
                shipping: formatNumber(shipping),
                total: formatNumber(total)
            });
        }
    });

    console.log("✅ Extração de valores concluída!");
});
