<div align="center">
  <img width="90" alt="mac-icon" src="https://github.com/user-attachments/assets/6e20b57d-ebc2-435a-9af9-0ddef5458834" />
  <h1>Count or Die</h1>
  <p>An arcade clicker game where speed meets strategy</p>

[![GitHub Repo stars](https://img.shields.io/github/stars/ashuhlee/count-or-die?style=for-the-badge&logo=starship&logoColor=%23D7E0ED&labelColor=%232F2D42&color=%23FFBDF2)](https://github.com/ashuhlee/count-or-die/stargazers)
[![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/ashuhlee/count-or-die?style=for-the-badge&logo=gitbook&logoColor=%23D9E0EE&labelColor=%232F2D42&color=C1B5FF)](https://github.com/ashuhlee/count-or-die/issues)
[![GitHub repo size](https://img.shields.io/github/repo-size/ashuhlee/count-or-die?style=for-the-badge&logo=removedotbg&logoColor=%23D9E0EE&labelColor=%232F2D42&color=AEE5FF)](https://github.com/ashuhlee/count-or-die)
[![GitHub Release](https://img.shields.io/github/v/release/ashuhlee/count-or-die?include_prereleases&label=version&style=for-the-badge&logoColor=%23D9E0EE&labelColor=2F2D42&color=A5A2B7)](https://github.com/ashuhlee/count-or-die/releases)

<a href="https://www.youtube.com/watch?v=l_mUEsx0na8"><img width="170" alt="watch demo" src="https://github.com/user-attachments/assets/5ccf0b8a-1534-4543-a59d-48f33cb7a98a" /></a> <a href="https://github.com/ashuhlee/count-or-die/releases"><img width="170" alt="download" src="https://github.com/user-attachments/assets/73fc2b6a-9571-4893-85b5-dbf2f7eccd92" /></a> <a href="https://play.countordie.gg"><img width="170" alt="play online" src="https://github.com/user-attachments/assets/ea84589e-ab85-424f-8cad-c6bc435ff070" /></a>

</div>

## About the Game

**Platforms:** Windows, MacOS, Browser <br>
**Status:** In Development - Beta 1 Released

Count or Die is an arcade counting game with progressive difficulty, randomized power-ups, multiple game modes, and a timer that gets faster as you level up!

### Gameplay Demo

<div align="center">

https://github.com/user-attachments/assets/31746f90-5190-4f27-89c4-96ff47f62f6b

</div>

## Play the beta

### Desktop

To try out the beta, download the latest release for your platform from the [releases page](https://github.com/ashuhlee/count-or-die/releases/tag/v1.0.0-beta.1), or via the links below:

| Platform              | File                                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Windows (64-bit)      | [CountOrDie-1.0.0-beta.1-win64.exe](https://github.com/ashuhlee/count-or-die/releases/download/v1.0.0-beta.1/CountOrDie-1.0.0-beta.1-win64.exe)     |
| macOS (Apple Silicon) | [Count.or.Die-1.0.0-beta.1-arm64.dmg](https://github.com/ashuhlee/count-or-die/releases/download/v1.0.0-beta.1/Count.or.Die-1.0.0-beta.1-arm64.dmg) |

The desktop apps update themselves when a new version is released. Intel Macs aren't supported yet.

### Online

You can also play the beta directly in your browser! No download needed:

- [play.countordie.gg](https://play.countordie.gg)
- [itch.io](https://ashuhlee.itch.io/count-or-die)

## Gameplay

### Core Mechanics

The main objective is straightforward, reach the counting goal before the timer runs out. The game however, will do its best to stop you.

- **Progressive Difficulty:** each completed goal makes the timer 1.2x quicker
- **Strategic Boosts:** boosts let you skip straight to the goal. Use them early and you'll regret it. Use them too late and you'll also regret it. You can pick up extra boosts via power ups.

Compete against your personal best high score. In future versions, compare your scores with others via the global leaderboard!

### Game Modes

- **Regular Mode:** Classic sequential counting with regular numbers only
- **Nerd-Out Mode:** Math equations only (e.g., 4 × 10, 100 ÷ 2). Solve in your head and keep clicking _(Coming soon)_

### Power-Up System

As you play, power-ups randomly spawn on the screen, but you have to click them before they vanish. And try not to click _certain_ ones.

| Type                                                                                                                    | Effect              | Chance of Spawning |
| ----------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------ |
| <img width="36" alt="purple candy" src="src/renderer/assets/ui/power-ups/candy-purple.png"/>                            | 2x counter          | 40%                |
| <img width="36" alt="blue candy" src="src/renderer/assets/ui/power-ups/candy-blue.png"/>                                | 4x counter          | 20%                |
| <img width="36" alt="pink candy" src="src/renderer/assets/ui/power-ups/candy-pink.png"/>                                | Combo (+1, +2, +3…) | 15%                |
| <img width="36" alt="pink donut" src="src/renderer/assets/ui/power-ups/donut-pink.png"/>                                | +25 bonus           | 20%                |
| <img width="36" alt="brown donut" src="src/renderer/assets/ui/power-ups/donut-brown.png"/>                              | −25 penalty         | 20%                |
| <img width="36" alt="popsicle" src="src/renderer/assets/ui/power-ups/popsicle-pink.png"/>                               | Time freeze         | 15%                |
| <img width="36" alt="blue popsicle" src="src/renderer/assets/ui/power-ups/popsicle-blue.png"/>                          | Time rush           | 15%                |
| <img width="36" alt="star" src="https://github.com/user-attachments/assets/f52dbe04-cbde-4de5-af6d-f8ca8b51cb09"/>      | Extra boost         | 10%                |
| <img width="36" alt="superstar" src="https://github.com/user-attachments/assets/5b54f551-8a58-4822-b929-9ab59617f6d2"/> | Replenish boosts    | 8%                 |

### Controls

| Input               | Action                     |
| ------------------- | -------------------------- |
| `↑` `→` `W` `D` `+` | Increase counter           |
| `Spacebar`          | Use a boost (jump to goal) |
| Mouse click         | Button interactions        |

## Discord Rich Presence

<div>
    <img width="300" align="right"
    src="https://github.com/user-attachments/assets/76b878b1-1305-4037-8d1c-5bf0a25dbdf8"/>

Count or Die has support for Discord Rich Presence, allowing friends to see your game status, current mode and rank. Brag about how fast you can click to your friends!

</div>

#### Available Ranks

| Badge                                                                                                                   | Tier                               |
| ----------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| <img align="center" width="40" src="https://github.com/user-attachments/assets/e87985a4-9e9a-4aae-b80c-76df72130d57" /> | Slow Fingers (High score - 100+)   |
| <img align="center" width="40" src="https://github.com/user-attachments/assets/b1eeff7a-9dbd-428c-83bc-2897faf7cfc4" /> | Finger Breaker (High score - 200+) |
| <img align="center" width="40" src="https://github.com/user-attachments/assets/9d9ee416-1912-4259-a0df-ad60a0f85dd8" /> | Speed Demon (High score - 300+)    |
| <img align="center" width="40" src="https://github.com/user-attachments/assets/0d0a0278-56fb-481e-a9e6-569cf537a11d" /> | Legend 😮‍💨 (High score - 400+)      |

> [!NOTE]
> Discord Rich Presence is only supported in the desktop version (Windows and macOS), not the web version.

## Installation

For local development or contributing, run the app locally using the steps below.

### Requirements

- Node.js (version 20 or higher recommended)
- npm (comes with Node.js)

### Build from Source

1. Clone this repository:

```zsh
git clone https://github.com/ashuhlee/count-or-die.git
cd count-or-die
```

2. Install dependencies:

```zsh
npm install
```

3. Run the app in development mode:

```zsh
npm start
```

The app will launch with hot-reload enabled for faster development

### Testing for Production

1. Package the app and build distributable:

```bash
npm run package
npm run make
```

### Updating

To update your local installation to the latest version:

```zsh
git pull origin main
npm install
```

## Features Coming to Beta 2

- Additional game mode for the math enjoyers
- Improved high score management system

## Tech Stack

- **Electron:** framework for cross-platform desktop app development
- **Electron Forge:** for packaging and distributing Electron apps
- **React:** runs the game and renders its interface
- **Vite+:** toolchain for bundling, linting, formatting and testing
- **Discord Integration:** Discord Rich Presence support [(simple-discord-rpc)](https://www.npmjs.com/package/simple-discord-rpc)

## Contributing

This is a personal project, but suggestions and contributions are welcome!

### Ways to Contribute

- [Report bugs](https://github.com/ashuhlee/count-or-die/issues/new?template=bug_report.yml): open an issue with details
- [Suggest features](https://github.com/ashuhlee/count-or-die/issues/new?template=feature_request.yml): share your ideas for gameplay improvements
- [Feedback](https://forms.gle/zqN2TVqHpaTRiNJSA): try the game and share feedback on gameplay and user experience

Feel free to check out the [project tracker](https://ashuhlee.notion.site/Count-or-Die-2f5a30a56798803383e7dd6b54a77d4e?source=copy_link) to see what's currently in progress.

<br>
⭐ If you like this project, please consider giving this repo a star!
<!-- 🎮 Made for gamers, pixel art lovers, and anyone with a slow reaction time -->
