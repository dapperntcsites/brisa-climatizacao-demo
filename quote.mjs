const services = { instalacao: 'Instalação', limpeza: 'Limpeza', manutencao: 'Manutenção' };
const properties = { residencial: 'Residencial', comercial: 'Comercial' };

export function validateQuote(input = {}) {
  const errors = {};
  if (!Object.hasOwn(services, input.service)) errors.service = 'Escolha o serviço que você precisa.';
  if (!Object.hasOwn(properties, input.property)) errors.property = 'Escolha o tipo de imóvel.';
  const raw = input.quantity;
  const quantity = Number(raw);
  if (!['string', 'number'].includes(typeof raw) || String(raw).trim() === '' || !Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    errors.quantity = 'Informe de 1 a 20 aparelhos, usando um número inteiro.';
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, value: { service: input.service, quantity, property: input.property } };
}

export function formatQuote(value) {
  return `Pedido de orçamento • Brisa Climatização\n\nServiço: ${services[value.service]}\nQuantidade: ${value.quantity} ${value.quantity === 1 ? 'aparelho' : 'aparelhos'}\nImóvel: ${properties[value.property]}\n\nValor sujeito à avaliação técnica.\n\nEsta é uma demonstração. Nenhum pedido foi enviado.`;
}
