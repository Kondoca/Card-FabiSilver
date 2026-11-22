// Alternância entre modo claro e noturno.
// O tema inicial já foi aplicado por um script no <head> (antes da primeira pintura);
// aqui o botão troca o tema e salva a escolha no navegador.

const raiz = document.documentElement;
const botao = document.querySelector('.theme-toggle');
const sistema = window.matchMedia('(prefers-color-scheme: dark)');

function aplicar(escuro) {
  raiz.setAttribute('data-theme', escuro ? 'dark' : 'light');
  if (!botao) return;
  botao.setAttribute('aria-pressed', String(escuro));
  botao.setAttribute('aria-label', escuro ? 'Ativar modo claro' : 'Ativar modo noturno');
}

function salvo() {
  try { return localStorage.getItem('tema'); } catch { return null; }
}

aplicar(raiz.getAttribute('data-theme') === 'dark');

botao?.addEventListener('click', () => {
  const escuro = raiz.getAttribute('data-theme') !== 'dark';
  aplicar(escuro);
  try { localStorage.setItem('tema', escuro ? 'escuro' : 'claro'); } catch { /* navegação privada: vale só nesta visita */ }
});

// sem escolha salva, acompanha a mudança de tema do sistema
sistema.addEventListener('change', (e) => {
  if (!salvo()) aplicar(e.matches);
});
