// Conversa demonstrativa: fluxo guiado com respostas pré-programadas (sem IA real).
// Usa as mesmas funções de agenda e armazenamento do formulário.
import { SERVICES, BUSINESS } from '../data/services.js';
import {
  getAvailableSlots,
  nextOpenDays,
  formatDate,
  formatBRL,
} from './schedule.js';
import { loadBookings, createBooking } from './storage.js';

export function initChat(root, onBooked) {
  const log = root.querySelector('.chat-log');
  const opts = root.querySelector('.chat-options');
  const form = root.querySelector('.chat-form');
  const input = root.querySelector('input');
  let draft = {};
  let onText = null;

  const say = (text, who = 'bot') => {
    const p = document.createElement('p');
    p.className = `msg ${who}`;
    p.textContent = text;
    log.append(p);
    log.scrollTop = log.scrollHeight;
  };
  const ask = (items) => {
    form.hidden = true;
    opts.replaceChildren(
      ...items.map(([label, fn]) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = label;
        b.addEventListener('click', () => {
          say(label, 'user');
          fn();
        });
        return b;
      }),
    );
  };
  const askText = (cb) => {
    opts.replaceChildren();
    form.hidden = false;
    onText = cb;
    input.focus();
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = input.value.trim();
    if (!value || !onText) return;
    input.value = '';
    say(value, 'user');
    const cb = onText;
    onText = null;
    cb(value);
  });

  function start() {
    draft = {};
    say(
      'Olá. Este é o atendimento demonstrativo do Estilo Prime Studio. Qual serviço você deseja?',
    );
    ask([
      ...SERVICES.map((s) => [
        `${s.name}, ${formatBRL(s.price)}, ${s.duration} min`,
        () => pickDate(s),
      ]),
      ['Falar com uma pessoa', human],
    ]);
  }
  function human() {
    say(
      'Nesta demonstração não há atendimento humano. Em um uso real, a conversa seria encaminhada à equipe.',
    );
    ask([['Voltar ao início', start]]);
  }
  function pickDate(service) {
    draft.service = service;
    say('Para qual dia?');
    ask(
      nextOpenDays(5, BUSINESS).map((iso) => [
        formatDate(iso),
        () => pickTime(iso),
      ]),
    );
  }
  function pickTime(date) {
    draft.date = date;
    const slots = getAvailableSlots(
      date,
      draft.service,
      loadBookings(),
      BUSINESS,
    );
    if (!slots.length) {
      say('Não há horários livres neste dia. Escolha outro dia.');
      return pickDate(draft.service);
    }
    say('Estes são os horários livres. Qual prefere?');
    ask(slots.slice(0, 8).map((t) => [t, () => pickName(t)]));
  }
  function pickName(start) {
    draft.start = start;
    say('Qual nome devo usar na reserva? Use um nome fictício.');
    askText((name) => {
      draft.name = name;
      confirm();
    });
  }
  function confirm() {
    const { service, date, start, name } = draft;
    say(
      `${name}, confirma ${service.name} em ${formatDate(date)} às ${start}, por ${formatBRL(service.price)}?`,
    );
    ask([
      ['Confirmar', book],
      ['Cancelar', start_],
    ]);
  }
  const start_ = () => start();
  function book() {
    const result = createBooking(draft);
    if (result.ok) {
      say(
        'Reserva registrada pelo sistema. Você pode vê-la na agenda demonstrativa.',
      );
      onBooked();
    } else {
      say(result.error);
    }
    ask([['Nova conversa', start]]);
  }
  start();
}
