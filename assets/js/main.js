import { SERVICES, BUSINESS } from './data/services.js';
import {
  getAvailableSlots,
  isoDate,
  formatDate,
  formatBRL,
} from './modules/schedule.js';
import {
  loadBookings,
  createBooking,
  cancelBooking,
} from './modules/storage.js';
import { initChat } from './modules/chat.js';

const $ = (selector) => document.querySelector(selector);
const form = $('#booking-form');
const serviceSelect = $('#service');
const dateInput = $('#date');
const slotsBox = $('#slots');
const nameInput = $('#name');
const message = $('#form-message');
const agenda = $('#agenda');
const confirmButton = $('#confirm');

let selectedStart = null;
let rescheduleId = null; // reserva em remarcação, ignorada no cálculo de conflitos

const findService = (id) => SERVICES.find((s) => s.id === id);
const makeNote = (text) => {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
};
const say = (text, isError = false) => {
  message.textContent = text;
  message.className = isError ? 'error' : 'ok';
};

function renderServices() {
  $('#service-list').innerHTML = SERVICES.map(
    (s) =>
      `<li><span>${s.name}</span><span>${s.duration} min</span><strong>${formatBRL(s.price)}</strong></li>`,
  ).join('');
  serviceSelect.innerHTML = SERVICES.map(
    (s) => `<option value="${s.id}">${s.name}</option>`,
  ).join('');
}

function renderSlots() {
  selectedStart = null;
  slotsBox.replaceChildren();
  if (!dateInput.value)
    return slotsBox.append(makeNote('Escolha uma data para ver os horários.'));
  const bookings = loadBookings().filter((b) => b.id !== rescheduleId);
  const slots = getAvailableSlots(
    dateInput.value,
    findService(serviceSelect.value),
    bookings,
    BUSINESS,
  );
  if (!slots.length)
    return slotsBox.append(
      makeNote('Sem horários livres neste dia. Tente outra data.'),
    );
  slots.forEach((time) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = time;
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', () => {
      selectedStart = time;
      slotsBox
        .querySelectorAll('button')
        .forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    });
    slotsBox.append(b);
  });
}

function renderAgenda() {
  const list = loadBookings().sort((a, b) =>
    (a.date + a.start).localeCompare(b.date + b.start),
  );
  agenda.replaceChildren();
  if (!list.length)
    return agenda.append(
      Object.assign(document.createElement('li'), {
        textContent: 'Nenhuma reserva ainda.',
      }),
    );
  list.forEach((b) => {
    const li = document.createElement('li');
    const info = document.createElement('span');
    info.textContent = `${formatDate(b.date)}, ${b.start} às ${b.end}. ${findService(b.serviceId).name}, ${b.name}`;
    const reschedule = document.createElement('button');
    reschedule.type = 'button';
    reschedule.textContent = 'Remarcar';
    reschedule.addEventListener('click', () => startReschedule(b));
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Cancelar';
    cancel.addEventListener('click', () => {
      cancelBooking(b.id);
      say('Reserva cancelada.');
      refresh();
    });
    li.append(info, reschedule, cancel);
    agenda.append(li);
  });
}

function startReschedule(b) {
  rescheduleId = b.id;
  serviceSelect.value = b.serviceId;
  dateInput.value = b.date;
  nameInput.value = b.name;
  confirmButton.textContent = 'Confirmar remarcação';
  say('Remarcando: escolha o novo horário e confirme.');
  renderSlots();
  form.scrollIntoView({ behavior: 'smooth' });
}

function renderHeroSlots() {
  const found = [];
  const day = new Date();
  for (let i = 0; i < 7 && found.length < 4; i++) {
    const iso = isoDate(day);
    getAvailableSlots(iso, SERVICES[0], loadBookings(), BUSINESS)
      .slice(0, 2)
      .forEach(
        (t) => found.length < 4 && found.push(`${formatDate(iso)} às ${t}`),
      );
    day.setDate(day.getDate() + 1);
  }
  $('#hero-slots').innerHTML = found.map((t) => `<li>${t}</li>`).join('');
}

function refresh() {
  renderSlots();
  renderAgenda();
  renderHeroSlots();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!dateInput.value || !selectedStart)
    return say('Escolha a data e um horário.', true);
  const result = createBooking({
    service: findService(serviceSelect.value),
    date: dateInput.value,
    start: selectedStart,
    name: nameInput.value,
    ignoreId: rescheduleId,
  });
  if (!result.ok) {
    say(result.error, true);
    return renderSlots();
  }
  const b = result.booking;
  say(
    `Reserva confirmada para ${formatDate(b.date)}, das ${b.start} às ${b.end}.`,
  );
  rescheduleId = null;
  confirmButton.textContent = 'Confirmar reserva';
  nameInput.value = '';
  refresh();
});
serviceSelect.addEventListener('change', renderSlots);
dateInput.addEventListener('change', renderSlots);

dateInput.min = isoDate(new Date());
renderServices();
refresh();
initChat($('#chat'), refresh);
