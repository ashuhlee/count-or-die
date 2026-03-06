
export function keyboardControls(handlers: any): void {
    document.addEventListener('keydown', (event) => {

		if (event.key === 'Escape') {
			alert('Oops! The settings menu is not available in the beta.');
			return;
		}

		// don't trigger if disabled or modifier keys are pressed
		if (handlers.disabled && handlers.disabled()) {
			return;
		}
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
            return;
        }
        switch(event.key) {
            case 'ArrowUp':
            case 'ArrowRight':
            case 'W':
            case 'w':
            case 'D':
            case 'd':
                handlers.onIncrease();
                break;

            case ' ':
                handlers.onBoost();
                break;
        }
    });
}