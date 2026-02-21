
import skullImg from '@assets/ui/deco/skull_pink.png';

export function showLoadingScreen() {

	const loading = document.createElement('div');
	loading.id = 'loading-screen';
	loading.className = 'loading-screen';

	loading.innerHTML = `
		<div class="loading-content">
			<div class="diamond-outline" id="diamond-outline"></div>
			<div class="diamond-wrapper" id="diamond-wrapper">
				<div class="diamond" id="diamond"></div>
				<img src="${skullImg}" class="loading-skull" alt="skull"/>			
			</div>
		</div>`

	document.body.appendChild(loading);

	requestAnimationFrame(() => {
		loading.classList.add('visible');
	})
}

export function hideLoadingScreen() {

	const loading = document.getElementById('loading-screen');
	if (!loading) return;

	loading.classList.add('hiding');
	setTimeout(() => {
		loading.style.willChange = 'auto';
		loading.remove();
	}, 600)
}