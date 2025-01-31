// Aguarda o carregamento completo da página antes de capturar os valores
window.addEventListener("load", () => {
    console.log("🔄 Página carregada, iniciando extração de valores...");

    // Função para limpar e converter valores para número corretamente
    const parseCurrency = (value, label) => {
        if (!value) {
            console.warn(`Elemento de ${label} não encontrado ou está vazio.`);
            return 0; // Retorna 0 caso não exista valor
        }

        console.log(`Valor original de ${label}:`, value);

        // Remove caracteres indesejados (exceto números, pontos e vírgulas)
        let cleanedValue = value.replace(/[^0-9,\.]/g, '');

        console.log(`Valor limpo de ${label} (antes do ajuste de milhar):`, cleanedValue);

        // Ajusta os separadores corretamente:
        // Se o valor contém vírgula e ponto, assume que a vírgula é decimal e o ponto é de milhar
        if (cleanedValue.includes(',') && cleanedValue.includes('.')) {
            cleanedValue = cleanedValue.replace(/,/g, '').replace(/\./g, ',');
        } 
        // Se o número tem um ponto e é um valor grande (milhares), transforma para o formato correto
        else if (cleanedValue.includes('.') && cleanedValue.match(/\d{4,}/)) {
            cleanedValue = cleanedValue.replace(/\./g, ',');
        }

        let numericValue = parseFloat(cleanedValue.replace(',', '.'));

        console.log(`Valor final convertido de ${label}:`, numericValue);

        return numericValue;
    };

    // Seleciona dinamicamente o primeiro preço encontrado na página
    const priceElement = document.querySelector(
        '[class*="price--currentPriceText"], [class*="banner--price"], [class*="price--current--"], [class*="pdp-price"], [class*="current-price"]'
    );

    // Seleciona dinamicamente o primeiro valor de frete encontrado na página
    const shippingElement = document.querySelector(
        '[class*="dynamic-shipping-line"] strong, [class*="shipping-cost"], [class*="delivery-price"], [class*="frete"]'
    );

 
    let price = priceElement ? parseCurrency(priceElement.innerText.trim(), "Preço") : 0;
    let shipping = shippingElement ? parseCurrency(shippingElement.innerText.trim(), "Frete") : 0;
    let total = price + shipping;

    const formatNumber = (num) =>
        num.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
            .replace(/\./g, 'X') // Temporário para evitar conflitos
            .replace(/,/g, '.')  // Troca a vírgula pelo ponto (decimal)
            .replace(/X/g, ','); // Troca temporário de volta para milhar com ponto


    const formatNumberBRL = (num) =>
        num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            
    
    console.log(`Preço Limpo: ARS ${formatNumber(price)}`);
    console.log(`Frete Limpo: ARS ${formatNumber(shipping)}`);
    console.log(`Total: ARS ${formatNumber(total)}`);
    console.log(`Total: ARS ${formatNumberBRL(total)}`);

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "getPrices") {
            sendResponse({
                price: formatNumber(price),
                shipping: formatNumber(shipping),
                total: formatNumberBRL(total)
            });
        }
    });

    console.log("✅ Extração de valores concluída!");
});
