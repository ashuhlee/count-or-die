import DiscordRPC from 'discord-rich-presence';

const CLIENT_ID = '1471053459905052694';
const client = DiscordRPC(CLIENT_ID);

const playTime = Date.now();
const displayRank = true;

let currentPresence = { highScoreRPC: 0, gameStatusRPC: 'in-game' };

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

export function setDiscordStatus(updates = {}) {
	try {
		currentPresence = {...currentPresence, ...updates};
	
		const score = currentPresence.highScoreRPC;
		const status = currentPresence.gameStatusRPC;
	
		const tier = getTierInfo(score);
		const statusInfo = getGameStatus(status);
	
		client.updatePresence({
	
			details: `Nerd Out Mode · ${statusInfo}`,
			startTimestamp: playTime,
	
			largeImageKey: 'main_icon',
			largeImageText: 'Count or Die',
	
			smallImageKey: displayRank ? tier.badge : undefined,
			smallImageText: displayRank ? tier.label : undefined,
	
			instance: true,
			buttons: [
				{ label: 'Play Count or Die', url: 'https://www.countordie.gg' }
			]
		});		
	} catch (error) {
		console.warn('Discord not detected');
	}
}