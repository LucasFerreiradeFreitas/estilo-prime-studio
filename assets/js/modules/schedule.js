// Lógica de agenda. Funções puras: não mexem na tela nem no armazenamento.
export const toMinutes = (t) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const toTime = (n) =>
  `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;

export const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const formatDate = (iso) =>
  iso.split('-').reverse().slice(0, 2).join('/');
export const formatBRL = (v) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Dois intervalos conflitam quando um começa antes de o outro terminar, e vice-versa.
export const overlaps = (aStart, aEnd, bStart, bEnd) =>
  aStart < bEnd && bStart < aEnd;

export function getAvailableSlots(date, service, bookings, business) {
  const weekday = new Date(`${date}T00:00`).getDay();
  if (business.closedWeekdays.includes(weekday)) return [];
  const now = new Date();
  const nowMinutes =
    isoDate(now) === date ? now.getHours() * 60 + now.getMinutes() : -1;
  const open = toMinutes(business.open);
  const close = toMinutes(business.close);
  const sameDay = bookings.filter((b) => b.date === date);
  const slots = [];
  for (
    let start = open;
    start + service.duration <= close;
    start += business.slotStep
  ) {
    if (start <= nowMinutes) continue;
    const end = start + service.duration;
    const busy = sameDay.some((b) =>
      overlaps(start, end, toMinutes(b.start), toMinutes(b.end)),
    );
    if (!busy) slots.push(toTime(start));
  }
  return slots;
}

export function nextOpenDays(count, business) {
  const days = [];
  const d = new Date();
  while (days.length < count) {
    if (!business.closedWeekdays.includes(d.getDay())) days.push(isoDate(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}
