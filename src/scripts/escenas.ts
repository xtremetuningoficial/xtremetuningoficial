/**
 * Kit de escenas de SurgirIA — movimiento ligado al scroll para landings.
 *
 * Se copia tal cual a src/scripts/escenas.ts del proyecto (Astro, Next, Vite o HTML plano
 * compilando a JS). No depende de ninguna librería. Se activa con atributos en el HTML:
 *
 *   data-escena="abre"   Sección alta con un hijo [data-fijo] que se queda pegado. Entrega
 *                        --a (0→1 en la primera parte) y --b (0→1 en la segunda). Sirve para
 *                        el héroe que se abre y la frase que entra. Los cortes se cambian con
 *                        data-corte-a="0.42" y data-corte-b="0.38,0.88". Sólo se activa si el
 *                        contenido de [data-fijo] cabe entero en la pantalla.
 *   data-escena="riel"   Sección con [data-fijo] y una pista [data-pista]: el scroll vertical
 *                        pasa las tarjetas de lado. Opcionales: botones [data-riel] (uno por
 *                        tarjeta), [data-riel-lleno] (barra de avance) y [data-mover="-1|1"].
 *                        La tarjeta en foco recibe .is-foco.
 *   data-escena="pila"   Contenedor cuyas hijas se apilan (position: sticky en el CSS). Cada
 *                        hija recibe --c (0→1) a medida que la siguiente la tapa. Sólo se
 *                        activa (.is-activa) si cada hija cabe entera en la pantalla.
 *   data-escena="traza"  Lista de pasos: entrega --p (0→1) y marca .is-on en cada hijo al paso.
 *   data-entra           Cualquier bloque: entrega --e (0→1) mientras entra en pantalla.
 *
 * Clases que pone en <html>:
 *   con-movimiento  hay movimiento (no se pidió quitarlo)
 *   con-escenas     pantalla ancha y con alto: se permiten las escenas "abre"
 * Clase que pone en cada escena activa: is-activa. Variable global: --tope (alto de la barra fija).
 *
 * Reglas de la casa:
 * - Sin JS todo queda visible y quieto: el CSS de cada escena cuelga de .is-activa.
 * - Se respeta prefers-reduced-motion y el control propio del sitio
 *   (<html data-movimiento="reducido">). Un sitio puede decidir ignorar la preferencia del
 *   sistema con iniciarEscenas({ respetarSistema: false }); queda como decisión del dueño.
 * - Sólo transform, opacity, clip-path y filter acotado. Nada de animar ancho, alto o márgenes.
 */

export type OpcionesEscenas = {
  /** Selector de la barra fija de arriba; su alto se resta del área fija. */
  barra?: string;
  /** Si es false, el sitio ignora prefers-reduced-motion y sólo obedece data-movimiento. */
  respetarSistema?: boolean;
  /** Consulta de medios que permite las escenas "abre". */
  ancho?: string;
  /** Consulta de medios que permite las escenas "riel". */
  alto?: string;
};

type Escena = {
  inicio: number;
  fin: number;
  actual: number;
  pintado: number;
  siempre?: boolean;
  medir: () => void;
  pintar: (p: number) => void;
  soltar: () => void;
};

const root = document.documentElement;
const limitar = (n: number) => Math.min(1, Math.max(0, n));
const suave = (t: number) => t * t * (3 - 2 * t);
const arriba = (el: Element) => el.getBoundingClientRect().top + window.scrollY;
const numeros = (txt: string | undefined, def: number[]) => {
  // Sin el atributo (o con un valor que no sirve) manda el valor por defecto.
  const v = (txt ?? '')
    .split(',')
    .filter((t) => t.trim() !== '')
    .map(Number)
    .filter((n) => Number.isFinite(n) && n > 0);
  return v.length === def.length ? v : def;
};

let escenas: Escena[] = [];
let tope = 0;
let raf = 0;
let ultimo = 0;
let primera = true;
let opciones: Required<OpcionesEscenas>;
const rieles = new Map<HTMLElement, { ir: (i: number, salto?: boolean) => void; activa: () => number; total: number }>();

function escenaAbre(seccion: HTMLElement): Escena | null {
  const fijo = seccion.querySelector<HTMLElement>('[data-fijo]');
  if (!fijo) return null;
  const [corteA] = numeros(seccion.dataset.corteA, [0.42]);
  const [b0, b1] = numeros(seccion.dataset.corteB, [0.38, 0.88]);
  const inertes = Array.from(seccion.querySelectorAll<HTMLElement>('[data-sale]'));
  let cabe = false;
  const limpiar = () => {
    seccion.style.removeProperty('--a');
    seccion.style.removeProperty('--b');
    inertes.forEach((el) => (el.inert = false));
  };
  const e: Escena = {
    inicio: 0,
    fin: 1,
    actual: 0,
    pintado: -1,
    medir() {
      // El área fija mide lo que mide la pantalla: si el contenido no cabe entero, la escena
      // no se prende y el héroe queda como una sección normal, sin cortar nada.
      seccion.classList.add('is-activa');
      cabe = fijo.scrollHeight <= fijo.clientHeight + 2;
      if (!cabe) {
        seccion.classList.remove('is-activa');
        limpiar();
        return;
      }
      e.inicio = Math.max(0, arriba(seccion) - tope);
      e.fin = e.inicio + Math.max(1, seccion.offsetHeight - fijo.offsetHeight);
    },
    pintar(p) {
      if (!cabe) return;
      const a = suave(limitar(p / corteA));
      const b = limitar((p - b0) / Math.max(0.01, b1 - b0));
      seccion.style.setProperty('--a', a.toFixed(4));
      seccion.style.setProperty('--b', b.toFixed(4));
      // Lo que se retira (data-sale) deja de recibir foco cuando ya no se ve.
      inertes.forEach((el) => (el.inert = a > 0.85));
    },
    soltar() {
      seccion.classList.remove('is-activa');
      limpiar();
    },
  };
  return e;
}

function escenaRiel(seccion: HTMLElement): Escena | null {
  const fijo = seccion.querySelector<HTMLElement>('[data-fijo]');
  const pista = seccion.querySelector<HTMLElement>('[data-pista]');
  if (!fijo || !pista) return null;
  const tarjetas = Array.from(pista.children) as HTMLElement[];
  const botones = Array.from(seccion.querySelectorAll<HTMLButtonElement>('[data-riel]'));
  const lleno = seccion.querySelector<HTMLElement>('[data-riel-lleno]');
  let recorrido = 0;
  let activa = 0;
  const e: Escena = {
    inicio: 0,
    fin: 1,
    actual: 0,
    pintado: -1,
    medir() {
      pista.style.transform = '';
      seccion.style.height = '';
      const ultima = tarjetas[tarjetas.length - 1];
      const relleno = parseFloat(getComputedStyle(pista).paddingRight) || 0;
      const ancho = ultima ? ultima.offsetLeft + ultima.offsetWidth + relleno : pista.clientWidth;
      recorrido = Math.max(0, ancho - pista.clientWidth);
      seccion.style.height = fijo.offsetHeight + recorrido + 'px';
      e.inicio = Math.max(0, arriba(seccion) - tope);
      e.fin = e.inicio + Math.max(1, recorrido);
    },
    pintar(p) {
      pista.style.transform = `translate3d(${(-p * recorrido).toFixed(1)}px,0,0)`;
      if (lleno) lleno.style.transform = `scaleX(${p.toFixed(4)})`;
      activa = Math.round(p * (tarjetas.length - 1));
      tarjetas.forEach((t, k) => t.classList.toggle('is-foco', k === activa));
      botones.forEach((b, k) => (k === activa ? b.setAttribute('aria-current', 'true') : b.removeAttribute('aria-current')));
    },
    soltar() {
      pista.style.transform = '';
      seccion.style.height = '';
      if (lleno) lleno.style.transform = '';
      tarjetas.forEach((t) => t.classList.remove('is-foco'));
      botones.forEach((b) => b.removeAttribute('aria-current'));
      rieles.delete(seccion);
    },
  };
  rieles.set(seccion, {
    total: tarjetas.length,
    activa: () => activa,
    ir(i, salto = false) {
      const p = limitar(i / Math.max(1, tarjetas.length - 1));
      window.scrollTo({ top: e.inicio + p * (e.fin - e.inicio), behavior: salto ? 'auto' : 'smooth' });
    },
  });
  return e;
}

function escenaPila(caja: HTMLElement): Escena | null {
  const hijas = Array.from(caja.children) as HTMLElement[];
  if (hijas.length < 2) return null;
  let cabe = false;
  const e: Escena = {
    inicio: 0,
    fin: 1,
    actual: 0,
    pintado: -1,
    siempre: true,
    medir() {
      // Sólo se apila si cada tarjeta cabe entera bajo la barra; si no, queda en lista.
      caja.classList.add('is-activa');
      const mayor = Math.max(...hijas.map((h) => h.offsetHeight));
      cabe = mayor + tope + 16 + hijas.length * 15 + 8 <= window.innerHeight;
      if (!cabe) {
        caja.classList.remove('is-activa');
        hijas.forEach((h) => h.style.removeProperty('--c'));
      }
    },
    pintar() {
      if (!cabe) return;
      const cajas = hijas.map((h) => h.getBoundingClientRect());
      for (let i = 0; i < hijas.length - 1; i++) {
        const c = limitar(1 - (cajas[i + 1].top - cajas[i].top) / (cajas[i].height || 1));
        hijas[i].style.setProperty('--c', c.toFixed(3));
      }
    },
    soltar() {
      caja.classList.remove('is-activa');
      hijas.forEach((h) => h.style.removeProperty('--c'));
    },
  };
  return e;
}

function escenaTraza(lista: HTMLElement): Escena {
  const items = Array.from(lista.children) as HTMLElement[];
  const e: Escena = {
    inicio: 0,
    fin: 1,
    actual: 0,
    pintado: -1,
    medir() {
      const y = arriba(lista);
      e.inicio = y - window.innerHeight * 0.82;
      e.fin = y - window.innerHeight * 0.32;
    },
    pintar(p) {
      lista.style.setProperty('--p', p.toFixed(4));
      const n = Math.max(1, items.length - 1);
      items.forEach((it, k) => it.classList.toggle('is-on', p >= k / n - 0.02 && p > 0.01));
    },
    soltar() {
      lista.style.removeProperty('--p');
      items.forEach((it) => it.classList.remove('is-on'));
    },
  };
  return e;
}

function escenaEntra(el: HTMLElement): Escena {
  const e: Escena = {
    inicio: 0,
    fin: 1,
    actual: 0,
    pintado: -1,
    medir() {
      const y = arriba(el);
      e.inicio = y - window.innerHeight;
      e.fin = y - window.innerHeight * 0.3;
    },
    pintar(p) {
      el.style.setProperty('--e', suave(p).toFixed(4));
    },
    soltar() {
      el.style.removeProperty('--e');
    },
  };
  return e;
}

function cuadro(t: number) {
  raf = 0;
  const dt = Math.min(64, ultimo ? t - ultimo : 16);
  ultimo = t;
  const k = primera ? 1 : 1 - Math.exp(-dt / 105);
  primera = false;
  const y = window.scrollY;
  let vivo = false;
  for (const e of escenas) {
    const meta = limitar((y - e.inicio) / Math.max(1, e.fin - e.inicio));
    const d = meta - e.actual;
    if (Math.abs(d) > 0.0005) {
      e.actual += d * k;
      vivo = true;
    } else {
      e.actual = meta;
    }
    if (e.siempre || e.actual !== e.pintado) {
      e.pintar(e.actual);
      e.pintado = e.actual;
    }
  }
  if (vivo) pedir();
  else ultimo = 0;
}

function pedir() {
  if (!raf) raf = requestAnimationFrame(cuadro);
}

function medir() {
  const barra = opciones.barra ? document.querySelector<HTMLElement>(opciones.barra) : null;
  tope = barra ? Math.round(barra.getBoundingClientRect().height) : 0;
  root.style.setProperty('--tope', tope + 'px');
  for (const e of escenas) {
    e.medir();
    e.pintado = -1;
  }
  pedir();
}

function quieto() {
  if (root.getAttribute('data-movimiento') === 'reducido') return true;
  return opciones.respetarSistema && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function configurar() {
  for (const e of escenas) e.soltar();
  document.querySelectorAll('[data-escena].is-activa').forEach((el) => el.classList.remove('is-activa'));
  escenas = [];
  root.classList.remove('con-movimiento', 'con-escenas');
  if (quieto()) return;

  root.classList.add('con-movimiento');
  const ancho = window.matchMedia(opciones.ancho).matches;
  const alto = window.matchMedia(opciones.alto).matches;
  if (ancho) root.classList.add('con-escenas');

  const lista: (Escena | null)[] = [];
  const activar = (el: HTMLElement, e: Escena | null) => {
    if (e) el.classList.add('is-activa');
    lista.push(e);
  };
  document.querySelectorAll<HTMLElement>('[data-escena]').forEach((el) => {
    const tipo = el.dataset.escena;
    if (tipo === 'abre' && ancho) lista.push(escenaAbre(el));
    else if (tipo === 'riel' && alto) activar(el, escenaRiel(el));
    else if (tipo === 'pila') lista.push(escenaPila(el));
    else if (tipo === 'traza') activar(el, escenaTraza(el));
  });
  document.querySelectorAll<HTMLElement>('[data-entra]').forEach((el) => lista.push(escenaEntra(el)));
  escenas = lista.filter((e): e is Escena => e !== null);

  primera = true;
  medir();
}

function rielDe(el: Element | null) {
  const seccion = el?.closest<HTMLElement>('[data-escena="riel"]');
  return seccion ? rieles.get(seccion) : undefined;
}

/** Lleva al elemento con ese id si es una tarjeta de un riel activo. Devuelve true si lo hizo. */
export function irAlAncla(id: string, salto = false): boolean {
  const tarjeta = id ? document.getElementById(id) : null;
  const r = rielDe(tarjeta);
  const pista = tarjeta?.closest('[data-pista]');
  if (!tarjeta || !r || !pista || tarjeta.parentElement !== pista) return false;
  r.ir(Array.from(pista.children).indexOf(tarjeta), salto);
  return true;
}

export function iniciarEscenas(o: OpcionesEscenas = {}) {
  opciones = {
    barra: o.barra ?? 'header',
    respetarSistema: o.respetarSistema ?? true,
    ancho: o.ancho ?? '(min-width: 981px) and (min-height: 620px)',
    alto: o.alto ?? '(min-height: 620px)',
  };
  configurar();

  window.addEventListener('scroll', pedir, { passive: true });
  let espera = 0;
  const remedir = () => {
    cancelAnimationFrame(espera);
    espera = requestAnimationFrame(medir);
  };
  window.addEventListener('resize', remedir);
  document.fonts?.ready.then(remedir).catch(() => {});
  if ('ResizeObserver' in window) new ResizeObserver(remedir).observe(document.body);

  window.matchMedia(opciones.ancho).addEventListener('change', configurar);
  window.matchMedia(opciones.alto).addEventListener('change', configurar);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', configurar);
  new MutationObserver(configurar).observe(root, { attributes: true, attributeFilter: ['data-movimiento'] });

  // Riel: botones, flechas, teclado y enlaces #ancla llevan a la tarjeta dentro de la escena.
  document.addEventListener('click', (ev) => {
    const el = ev.target instanceof Element ? ev.target : null;
    const boton = el?.closest<HTMLElement>('[data-riel]');
    const flecha = el?.closest<HTMLElement>('[data-mover]');
    const r = rielDe(boton ?? flecha ?? null);
    if (!r) return;
    if (boton) {
      const hermanos = Array.from(boton.closest('[data-escena="riel"]')!.querySelectorAll('[data-riel]'));
      r.ir(hermanos.indexOf(boton));
    } else if (flecha) {
      ev.preventDefault();
      r.ir(Math.min(r.total - 1, Math.max(0, r.activa() + Number(flecha.dataset.mover))));
    }
  });
  document.addEventListener('focusin', (ev) => {
    const el = ev.target instanceof Element ? ev.target : null;
    const pista = el?.closest('[data-pista]');
    const r = rielDe(pista ?? null);
    if (!pista || !r) return;
    const tarjeta = Array.from(pista.children).find((t) => t.contains(el));
    const i = tarjeta ? Array.from(pista.children).indexOf(tarjeta) : -1;
    if (i >= 0 && i !== r.activa()) r.ir(i, true);
  });
  // El navegador primero salta al ancla por su cuenta; se corrige después, ya con todo medido.
  window.addEventListener('hashchange', () => setTimeout(() => irAlAncla(location.hash.slice(1)), 0));
  window.addEventListener('load', () => {
    setTimeout(() => {
      medir();
      irAlAncla(location.hash.slice(1), true);
    }, 150);
  });
}

/*
 * Ajuste para sitios de una sola página (React/Vite) — no viene en el kit original.
 * En una SPA las secciones se montan y desmontan sin recargar: el motor se inicia una
 * sola vez y, cada vez que cambia el DOM de las escenas, se vuelve a configurar.
 */
let iniciado = false;

/** Inicia el motor la primera vez; las siguientes sólo vuelve a buscar las escenas. */
export function montarEscenas(o: OpcionesEscenas = {}) {
  if (!iniciado) {
    iniciado = true;
    iniciarEscenas(o);
    return;
  }
  configurar();
}
