
export function keyboardControls(handlers) {
    document.addEventListener("keydown", (event) => {

        switch(event.key) {
            case "ArrowUp":
            case "ArrowRight":
            case "W":
            case "w":
            case "D":
            case "d":
            case "+":
            case "=":
                handlers.onIncrease();
                break;

            case "ArrowDown":
            case "ArrowLeft":
            case "S":
            case "s":
            case "A":
            case "a":
            case "-":
            case "_":
                handlers.onDecrease();
                break;

            case "Escape":
                handlers.onRestart();
        }
    });
}