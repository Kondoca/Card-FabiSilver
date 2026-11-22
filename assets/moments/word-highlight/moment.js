// Momento "word-highlight": as palavras do texto da seção Sobre escurecem conforme a rolagem.
const phone = true;
function stdin_default(root, opts, lib) {
  const text = root.matches("p, h2, h3, blockquote") ? root : root.querySelector(".mo-wh__text") || [...root.querySelectorAll("p, h2, h3, blockquote")].find((p) => !p.matches(".t-label, .t-small, .muted"));
  if (!text) return {};
  root.classList.add("mo-wh");
  const words = lib.split(text, "words").map((i) => i.parentElement);
  if (lib.reduced()) {
    words.forEach((w) => w.classList.add("is-on"));
    root.classList.add("is-done");
    return {};
  }
  const from = opts.from ?? 0.85, to = opts.to ?? 0.45;
  let n = -1;
  const s = lib.scrub(text, (p, r) => {
    const vh = innerHeight, start = vh * from, end = vh * to;
    const t = lib.clamp((start - r.top) / Math.max(1, start - end + r.height));
    const atEnd = innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
    const k = atEnd ? words.length : Math.round(t * words.length);
    if (k === n) return;
    n = k;
    words.forEach((w, i) => w.classList.toggle("is-on", i < k));
  }, { mode: "view" });
  return { destroy: s.destroy };
}
export {
  stdin_default as default,
  phone
};
