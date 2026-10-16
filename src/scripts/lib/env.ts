export const mqReduced = () => window.matchMedia('(prefers-reduced-motion: reduce)');
export const prefersReduced = () => mqReduced().matches;
export const isFinePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;
export const isMobile = () => window.matchMedia('(max-width: 760px)').matches;
export const supportsVT = () => typeof document !== 'undefined' && 'startViewTransition' in document;

export type Cleanup = () => void;
export interface PageCtx {
  reduced: boolean;
  mobile: boolean;
  /** Register a cleanup to run before the next page swap. */
  onCleanup: (fn: Cleanup) => void;
}

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** Remap v from [a,b] to [0,1], clamped. */
export const range = (v: number, a: number, b: number) => clamp((v - a) / (b - a));
export const smooth = (t: number) => t * t * (3 - 2 * t);

/** Progress of an element's scroll range, from its top at viewport top to its bottom at viewport bottom. */
export const stickyProgress = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  const total = r.height - window.innerHeight;
  return total <= 0 ? 0 : clamp(-r.top / total);
};
