export enum OrderStatus {
  PENDENTE = 'PENDENTE',
  EM_PREPARO = 'EM_PREPARO',
  PRONTO = 'PRONTO',
  SAIU_PARA_ENTREGA = 'SAIU_PARA_ENTREGA',
  ENTREGUE = 'ENTREGUE',
  CANCELADO = 'CANCELADO',
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  [OrderStatus.PENDENTE]: 'Pendente',
  [OrderStatus.EM_PREPARO]: 'Em preparo',
  [OrderStatus.PRONTO]: 'Pronto',
  [OrderStatus.SAIU_PARA_ENTREGA]: 'Saiu para entrega',
  [OrderStatus.ENTREGUE]: 'Entregue',
  [OrderStatus.CANCELADO]: 'Cancelado',
};
