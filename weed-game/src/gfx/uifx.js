// UI-viimeistely: fontit (Google Fonts, display=swap; offline -> järjestelmäfontti), tyylit ja ?fps-mittari.
import './ui.css';

export function initUiFx(E) {
  // Fontit ladataan ei-estävästi; jos verkkoa ei ole, CSS:n varafontit (system-ui / Arial Narrow) jäävät käyttöön.
  try {
    const pre = document.createElement('link'); pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = '';
    const l = document.createElement('link'); l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=Oswald:wght@500;700&family=Barlow:ital,wght@0,400;0,600;0,800;1,600&display=swap';
    l.onerror = () => l.remove();
    document.head.append(pre, l);
  } catch (_) {}

  if (E.params.has('fps')) {
    const el = document.createElement('div'); el.id = 'gfx-fps'; document.body.appendChild(el);
    setInterval(() => {
      const q = E.quality, s = E.stats || {};
      el.textContent = `${E.fps.toFixed(0)} fps · ${q.tier} · x${q.scale.toFixed(2)} · ${s.calls | 0} draw · ${((s.tris | 0) / 1000).toFixed(1)}k tri`;
    }, 500);
  }
}
