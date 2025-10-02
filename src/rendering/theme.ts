import { THEMES } from "../app/config";
export const nextThemeIndex = (i: number) => (i + 1) % THEMES.length;
export const themeAt = (i: number) => THEMES[i];