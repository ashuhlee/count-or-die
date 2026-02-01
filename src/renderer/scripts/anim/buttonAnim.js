
export const btnImages = {
	increase: {
		normal: "../assets/images/png/buttons/increase.png",
		pressed: "../assets/images/png/buttons/increase-press.png",
	},
	decrease: {
		normal: "../assets/images/png/buttons/decrease.png",
		pressed: "../assets/images/png/buttons/decrease-press.png",
	},
};

export function animateBtn(btnType) {

    const img = document.getElementById(`${btnType}-img`);
    img.src = btnImages[btnType].pressed;

	setTimeout(() => {
		img.src = btnImages[btnType].normal;
	}, 100);
}