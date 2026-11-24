"use client";
/**
 * Tiny external store for viewer preferences + live scene state.
 * Prefs persist per-viewer in localStorage (wrapped in try/catch — private
 * windows can throw) and are mirrored to <html data-motion / data-scene>.
 */
import { useSyncExternalStore } from "react";

export type MotionPref = "full" | "reduced";
export type State = {
  motion: MotionPref;
  scene3d: boolean;
  /** scene finished first render */
  ready: boolean;
  /** scene could not start (no WebGL, error) */
  failed: boolean;
  active: number;
  /** Skills section: side the glass takes for the selected category, and its accent colour */
  skillSide: "left" | "right";
  skillAccent: string;
};

const KEY = "db-portfolio-prefs";
let state: State = { motion: "full", scene3d: true, ready: false, failed: false, active: 0, skillSide: "left", skillAccent: "#a78bfa" };
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function reflect() {
  if (typeof document === "undefined") return;
  const el = document.documentElement;
  el.dataset.motion = state.motion;
  el.dataset.scene = state.scene3d && !state.failed ? "on" : "off";
}

export function initPrefs() {
  if (typeof window === "undefined") return;
  let saved: Partial<State> = {};
  try {
    saved = JSON.parse(localStorage.getItem(KEY) || "{}");
  } catch {}
  const systemReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  state = {
    ...state,
    motion: saved.motion ?? (systemReduced ? "reduced" : "full"),
    scene3d: saved.scene3d ?? true,
  };
  reflect();
  emit();
}

export function setPrefs(patch: Partial<State>) {
  state = { ...state, ...patch };
  if ("motion" in patch || "scene3d" in patch) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ motion: state.motion, scene3d: state.scene3d }));
    } catch {}
  }
  reflect();
  emit();
}

export const getPrefs = () => state;

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function usePrefs<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state), () => select(state));
}
