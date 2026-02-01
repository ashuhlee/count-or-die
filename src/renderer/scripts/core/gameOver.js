
export function toggleGameOver(isGameOver = false) {

    const gameOverScreen = document.getElementById("game-over");
    gameOverScreen.style.display = isGameOver ? "grid" : "none";
}