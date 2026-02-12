
import { Client, ActivityType } from 'simple-discord-rpc';

const CLIENT_ID = '1471053459905052694';

const client = new Client({
 clientId: CLIENT_ID,
});

const playTime = Date.now();
const displayRank = true;

let currentPresence = { highScoreRPC: 0, gameStatusRPC: 'in-game' };

client.on('ready', () => {
	console.log('RPC connected');
	updateActivity();
});

client.on('close', (reason) => {
	console.log('RPC disconnected', reason);
});

client.login().catch(err => {
	console.warn('Discord not detected:', err.message);
});

function getTierInfo(highScore) {
	if (highScore >= 300) {
		return { badge: 'tier_three', label: 'Speed Demon' };
	}
	else if (highScore >= 200) {
		return { badge: 'tier_two', label: 'Finger Breaker' };
	}
	else if (highScore >= 100) {
		return { badge: 'tier_one', label: 'Slow Fingers' };
	}
	else {
		return { badge: 'tier_one', label: 'Rookie' };
	}
}

function getGameStatus(status) {
	if (status === 'game-over') {
		return 'Deceased';
	}
	return 'Locked in';
}

function updateActivity() {

	const score = currentPresence.highScoreRPC;
	const status = currentPresence.gameStatusRPC;

	const tier = getTierInfo(score);
	const statusInfo = getGameStatus(status);

	try {
		client.setActivity({
			type: ActivityType.Playing,
			details: `Nerd Out Mode · ${statusInfo}`,
			state: undefined,

			timestamps: {
				start: playTime,
			},
			assets: {
				large_image: 'main_icon',
				large_text: 'Count or Die',
				small_image: displayRank ? tier.badge : undefined,
				small_text: displayRank ? tier.label : undefined,
			},
			buttons: [
				{ label: 'Play Count or Die', url: 'https://www.countordie.gg' }
			]
		});
	} catch (error) {
		console.warn('Failed to update Discord presence:', error.message);
	}
}

export function setDiscordStatus(updates = {}) {
	currentPresence = {...currentPresence, ...updates};
	updateActivity();
}