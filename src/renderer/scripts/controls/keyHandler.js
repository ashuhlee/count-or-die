
export function keyboardControls(handlers) {
    document.addEventListener("keydown", (event) => {

		if (event.key === "Escape") {
			handlers.onRestart();
			return;
		}

		// dont trigger if disabled or modifier keys are pressed
		if (handlers.disabled && handlers.disabled()) {
			return;
		}
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
                handlers.onIncrease();
                break;

            case " ":
                handlers.onBoost();
                break;
        }
    });
}