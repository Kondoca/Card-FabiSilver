// Interações do cartão digital: entrada suave dos blocos, barra fixa do celular,
// setas do carrossel e lightbox da galeria. Sem dependências.

const movimentoReduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------------------------------------------------------------- entrada suave
// Os blocos com .revela aparecem ao entrar na tela (uma vez só).
const revelaveis = document.querySelectorAll('.revela');
if (movimentoReduzido || !('IntersectionObserver' in window)) {
  revelaveis.forEach((el) => el.classList.add('visivel'));
} else {
  const observador = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        observador.unobserve(e.target);
      }
    }
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revelaveis.forEach((el) => observador.observe(el));
}

// ---------------------------------------------------------------- barra fixa do celular
// Aparece quando o botão de agendar da abertura sai da tela e some enquanto o
// botão do fechamento estiver visível, para nunca mostrar o mesmo botão duas vezes.
const barra = document.querySelector('.barra');
const botaoTopo = document.getElementById('agendar-topo');
const botaoFim = document.getElementById('agendar-fim');
if (barra && botaoTopo && 'IntersectionObserver' in window) {
  const visiveis = new Set();
  const atualizar = () => {
    const mostrar = !visiveis.has(botaoTopo) && !visiveis.has(botaoFim);
    barra.classList.toggle('visivel', mostrar);
    barra.toggleAttribute('inert', !mostrar);
    barra.setAttribute('aria-hidden', String(!mostrar));
  };
  const obs = new IntersectionObserver((entradas) => {
    for (const e of entradas) {
      if (e.isIntersecting) visiveis.add(e.target); else visiveis.delete(e.target);
    }
    atualizar();
  });
  obs.observe(botaoTopo);
  if (botaoFim) obs.observe(botaoFim);
}

// ---------------------------------------------------------------- carrossel
const carrossel = document.querySelector('.carrossel');
const setas = document.querySelectorAll('[data-rolar]');

function passo() {
  const item = carrossel.querySelector('li');
  const gap = parseFloat(getComputedStyle(carrossel).columnGap) || 0;
  return item ? item.getBoundingClientRect().width + gap : carrossel.clientWidth;
}

function atualizarSetas() {
  const max = carrossel.scrollWidth - carrossel.clientWidth - 2;
  setas.forEach((b) => {
    b.disabled = Number(b.dataset.rolar) < 0 ? carrossel.scrollLeft <= 2 : carrossel.scrollLeft >= max;
  });
}

if (carrossel) {
  setas.forEach((b) => b.addEventListener('click', () => {
    carrossel.scrollBy({ left: Number(b.dataset.rolar) * passo(), behavior: movimentoReduzido ? 'auto' : 'smooth' });
  }));
  carrossel.addEventListener('scroll', atualizarSetas, { passive: true });
  window.addEventListener('resize', atualizarSetas);
  atualizarSetas();
}

// ---------------------------------------------------------------- lightbox
const lightbox = document.querySelector('.lightbox');
const fotos = [...document.querySelectorAll('.carrossel .foto img')];
let atual = 0;
let origem = null;   // botão que abriu o lightbox, para devolver o foco ao fechar

function mostrar(i) {
  atual = (i + fotos.length) % fotos.length;
  const img = fotos[atual];
  const grande = lightbox.querySelector('.lightbox__foto');
  grande.src = img.dataset.grande || img.currentSrc || img.src;
  grande.alt = img.alt;
  lightbox.querySelector('.lightbox__contador').textContent = `${atual + 1} de ${fotos.length}`;
}

if (lightbox && fotos.length && typeof lightbox.showModal === 'function') {
  fotos.forEach((img, i) => {
    const botao = img.closest('.foto');
    botao.setAttribute('aria-label', `Ampliar foto: ${img.alt}`);
    botao.addEventListener('click', () => {
      origem = botao;
      mostrar(i);
      lightbox.showModal();
    });
  });

  lightbox.querySelector('.lightbox__fechar').addEventListener('click', () => lightbox.close());
  lightbox.querySelector('.lightbox__ant').addEventListener('click', () => mostrar(atual - 1));
  lightbox.querySelector('.lightbox__prox').addEventListener('click', () => mostrar(atual + 1));

  // tocar fora da foto e dos botões fecha
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) lightbox.close();
  });

  lightbox.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') mostrar(atual - 1);
    if (e.key === 'ArrowRight') mostrar(atual + 1);
  });

  // arrastar para o lado troca de foto no celular
  let inicioX = null;
  const foto = lightbox.querySelector('.lightbox__foto');
  foto.addEventListener('pointerdown', (e) => { inicioX = e.clientX; });
  foto.addEventListener('pointerup', (e) => {
    if (inicioX === null) return;
    const dx = e.clientX - inicioX;
    inicioX = null;
    if (Math.abs(dx) > 40) mostrar(atual + (dx < 0 ? 1 : -1));
  });

  // ao fechar, o foco volta para a foto que foi tocada e o carrossel mostra a última vista
  lightbox.addEventListener('close', () => {
    const alvo = fotos[atual].closest('.foto');
    alvo.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'auto' });
    (alvo || origem)?.focus({ preventScroll: true });
  });
}
