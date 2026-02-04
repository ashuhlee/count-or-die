
export function keyboardControls(handlers) {
    document.addEventListener("keydown", (event) => {

        // dont trigger if modifier keys are pressed
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return;
        }
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
                handlers.onBoost();
                break;

            case "Escape":
                handlers.onRestart();
        }
    });
}