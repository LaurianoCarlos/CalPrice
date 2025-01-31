var valorEmReais = 74.39;
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

console.log(`PREÇO CALCULADO: R$ ${precoFinal}`);
console.log(`LUCRO BRUTO: R$ ${lucroBruto}`);
console.log(`% CARTÃO: R$ ${deducaoCartao}`);
console.log(`% MARKETING: R$ ${deducaoMarketing}`);
console.log(`% DEVOLUÇÃO/CANCELAMENTO: R$ ${deducaoDevolucao}`);
console.log(`COMISSÃO DA PLATAFORMA: R$ ${deducaoPlataforma}`);
console.log(`TOTAL DE DEDUÇÕES: R$ ${totalDeducoes}`);
console.log(`MARGEM DE CONTRIBUIÇÃO: R$ ${margemContribuicao}`);
