
import { Client, ActivityType } from 'simple-discord-rpc';
import { green, red } from 'console-log-colors';


type BadgeInfo = {
	badge: string | undefined;
	label: string;
}

type GameStatus = 'Locked in' | 'Deceased';

export type Presence = {
	highScoreRPC?: number,
	gameStatusRPC?: 'in-game' | 'game-over'
}

const CLIENT_ID = '1471053459905052694';

const client = new Client({
	clientId: CLIENT_ID,
});

const playTime = Date.now();
const displayRank = true;

let currentPresence: Presence = { highScoreRPC: 0, gameStatusRPC: 'in-game' };

client.on('ready', () => {
	console.log(green.bold('✔'), 'RPC connected');
	void updateActivity();
});

client.on('close', (reason) => {
	console.log(red.bold('✘'), 'RPC not connected', reason);
});

client.login().catch(err => {
	console.warn('Discord not detected:', err.message);
});

function getTierInfo(highScore: number): BadgeInfo {
	if (highScore >= 400) {
		return { badge: 'tier_four', label: 'Legend' };
	}
	if (highScore >= 300) {
		return { badge: 'tier_three', label: 'Speed Demon' };
	}
	if (highScore >= 200) {
		return { badge: 'tier_two', label: 'Finger Breaker' };
	}
	if (highScore >= 100) {
		return { badge: 'tier_one', label: 'Slow Fingers' };
	}
	return { badge: undefined, label: 'Rookie' };

}

function getGameStatus(status: Presence['gameStatusRPC']): GameStatus {
	if (status === 'game-over') {
		return 'Deceased';
	}
	return 'Locked in';
}

async function updateActivity(): Promise<void> {

	const score = currentPresence.highScoreRPC;
	const status = currentPresence.gameStatusRPC;

	const tier = getTierInfo(score);
	const statusInfo = getGameStatus(status);

	try {
		await client.setActivity({
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
	} catch (error: unknown) {
		const msg = error instanceof Error ? error.message : String(error)
		console.warn('Failed to update Discord presence:', msg);
	}
}

export async function setDiscordStatus(updates: Partial<Presence> = {}): Promise<void> {
	currentPresence = {...currentPresence, ...updates};
	await updateActivity();
}