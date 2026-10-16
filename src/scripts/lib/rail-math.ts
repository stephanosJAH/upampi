import { stickyProgress } from './env';

/**
 * Horizontal rail: a tall section with a sticky viewport; vertical scroll is
 * mapped to the track's translateX. Pure + synchronous so it can run during
 * `astro:after-swap`, before the View Transition snapshots the new page —
 * that keeps card ↔ detail morphs landing on the card's real position.
 */
export function positionRail(section: HTMLElement) {
  const track = section.querySelector<HTMLElement>('[data-rail-track]');
  if (!track) return 0;
  const p = stickyProgress(section);
  const max = Math.max(0, track.scrollWidth - window.innerWidth);
  track.style.transform = `translate3d(${(-p * max).toFixed(2)}px,0,0)`;
  section.style.setProperty('--rail-p', p.toFixed(4));
  return p;
}

export const railActive = () =>
  window.innerWidth > 760 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Height comes from CSS (`--rail-w`), so scroll restoration is never clamped. */
export function positionRails() {
  if (!railActive()) return;
  document.querySelectorAll<HTMLElement>('[data-rail]').forEach((s) => positionRail(s));
}

/** Services sequence: card column offset as a pure function of scroll (shared with the module). */
export const SVC_C0 = 0.27;
export const SVC_C1 = 0.97;
export function servicesCardsOffset(section: HTMLElement, cardsEl: HTMLElement, p: number) {
  const travel = Math.max(0, cardsEl.scrollHeight - window.innerHeight * 0.35);
  const c = Math.min(1, Math.max(0, (p - SVC_C0) / (SVC_C1 - SVC_C0)));
  void section;
  return { y: -c * travel, travel };
}
export function positionServices() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const section = document.querySelector<HTMLElement>('#servicios[data-module="services"]');
  const cards = section?.querySelector<HTMLElement>('.svc-cards');
  if (!section || !cards) return;
  const p = stickyProgress(section);
  const { y } = servicesCardsOffset(section, cards, p);
  cards.style.transform = `translate3d(0,${y.toFixed(1)}px,0)`;
  const dark = Math.min(1, Math.max(0, (p - 0.05) / 0.09));
  section.querySelector<HTMLElement>('.svc-stage')?.style.setProperty('--dark', String(dark));
  section.querySelector<HTMLElement>('.svc-stage')?.style.setProperty('--foot', String(Math.min(1, Math.max(0, (p - 0.3) / 0.08))));
}
