# Estilo Prime Studio

Projeto fictício de portfólio: landing page e agendamento demonstrativo para um salão de beleza. Não há clientes, depoimentos ou resultados reais.

## Como executar

Os arquivos JavaScript usam módulos, então abra o projeto por um servidor local (por exemplo, a extensão Live Server do VS Code). Abrir o index.html direto do disco não funciona.

## Estrutura

- `assets/js/data/services.js`: serviços, preços, durações e horário de funcionamento.
- `assets/js/modules/schedule.js`: cálculo de horários livres e detecção de conflitos.
- `assets/js/modules/storage.js`: armazenamento das reservas (localStorage).
- `assets/js/modules/chat.js`: conversa demonstrativa.
- `assets/js/main.js`: ligação entre a página e os módulos.

## O que é simulado

- Reservas ficam no localStorage do navegador: não são compartilhadas, não são seguras e podem ser apagadas.
- A conversa usa respostas pré-programadas. Não há IA real nem WhatsApp.
- Endereço, contato, preços e horários são fictícios.

## Fase 2 (não implementada)

WhatsApp Cloud API, modelo de IA, agenda real, servidor com variáveis de ambiente e banco de dados com prevenção de reservas duplicadas.
