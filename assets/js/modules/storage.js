// Camada de armazenamento. localStorage guarda dados só neste navegador:
// não é compartilhado, não é seguro e pode ser apagado pelo usuário.
// Na fase 2, este é o arquivo que será trocado por um servidor com banco de dados.
import { BUSINESS } from '../data/services.js';
import { getAvailableSlots, toMinutes, toTime } from './schedule.js';

const KEY = 'estilo-prime-demo-bookings';

export function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}
const save = (list) => localStorage.setItem(KEY, JSON.stringify(list));

export function createBooking({ service, date, start, name, ignoreId = null }) {
  const clean = String(name).trim().slice(0, 60);
  if (clean.length < 2)
    return { ok: false, error: 'Informe um nome com pelo menos 2 letras.' };
  const others = loadBookings().filter((b) => b.id !== ignoreId);
  // Revalida a disponibilidade no momento de gravar.
  if (!getAvailableSlots(date, service, others, BUSINESS).includes(start)) {
    return {
      ok: false,
      error: 'Este horário não está mais disponível. Escolha outro.',
    };
  }
  const booking = {
    id: crypto.randomUUID(),
    serviceId: service.id,
    date,
    start,
    end: toTime(toMinutes(start) + service.duration),
    name: clean,
  };
  save([...others, booking]);
  return { ok: true, booking };
}

export function cancelBooking(id) {
  save(loadBookings().filter((b) => b.id !== id));
}
