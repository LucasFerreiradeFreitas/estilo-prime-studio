// Dados fictícios. Para alterar preço, duração ou horário, edite somente este arquivo.
export const BUSINESS = {
  open: '09:00',
  close: '19:00',
  slotStep: 30, // intervalo entre inícios possíveis, em minutos
  closedWeekdays: [0], // 0 = domingo
};

export const SERVICES = [
  { id: 'corte-feminino', name: 'Corte feminino', price: 120, duration: 60 },
  { id: 'corte-masculino', name: 'Corte masculino', price: 70, duration: 45 },
  { id: 'escova', name: 'Escova', price: 80, duration: 45 },
  { id: 'hidratacao', name: 'Hidratação', price: 90, duration: 60 },
  { id: 'coloracao', name: 'Coloração', price: 220, duration: 150 },
  { id: 'finalizacao', name: 'Finalização', price: 60, duration: 30 },
];
