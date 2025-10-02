import type { Theme } from "../core/types";

export const SETTINGS_KEY = "snake_ui_settings_v3";
export const BEST_KEY = "snake_best_score_v2";

export const THEMES: Theme[] = [
    { bg: "#0f1320", grid: "#1b2233", snake: "#58ffb3", head: "#a7ffea", food: "#ff5b6e", text: "#e8ecf1", obstacle: "#8c9db8", powerup: "#ffffff" },
    { bg: "#101418", grid: "#1a232c", snake: "#9dd6ff", head: "#d6f0ff", food: "#ffc857", text: "#e7eef5", obstacle: "#6b7b95", powerup: "#ffffff" },
    { bg: "#121212", grid: "#1e1e1e", snake: "#b4e197", head: "#d6ffb7", food: "#ff7aa2", text: "#efefef", obstacle: "#7a7a7a", powerup: "#ffffff" },
];

export const COMBO_WINDOW_MS = 4000;
export const SHRINK_EVERY_MS = 12000;

export const SCORE_MILESTONES = [10, 25, 50];