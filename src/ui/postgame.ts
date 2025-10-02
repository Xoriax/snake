export const homeEl = document.getElementById("home") as HTMLElement;
export const gameShellEl = document.getElementById("game-shell") as HTMLElement;

export const menuEl = document.getElementById("menu") as HTMLElement;
export const hudEl = document.querySelector(".hud") as HTMLElement;
export const helpEl = document.querySelector(".help") as HTMLElement;
export const badgesEl = document.querySelector(".badges") as HTMLElement;
export const postgameEl = document.getElementById("postgame") as HTMLElement;

export function showGameUI() {
    homeEl.style.display = "none";
    gameShellEl.style.display = "grid";   // affiche la grille 3 colonnes
    hudEl.style.display = "grid";         // HUD (colonne droite)
    helpEl.style.display = "block";       // texte commandes (colonne gauche)
    badgesEl.style.display = "flex";
    postgameEl.style.display = "none";
}

export function showMenuUI() {
    homeEl.style.display = "grid";
    gameShellEl.style.display = "none";
    hudEl.style.display = "none";
    helpEl.style.display = "none";
    badgesEl.style.display = "none";
    postgameEl.style.display = "none";
}

export function showPostGame(show: boolean) {
    postgameEl.style.display = show ? "flex" : "none";
}