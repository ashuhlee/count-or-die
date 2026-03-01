
<div align="center">
  <img width="80" alt="mac-icon" src="https://github.com/user-attachments/assets/76287ee2-f7d1-454d-ab64-e59e637ee1ee" />
  <h1 style="margin-top: 5px;">Count or Die</h1>
  <p>A cutesy arcade clicker game where speed meets strategy</p>

[![GitHub Repo stars](https://img.shields.io/github/stars/ashuhlee/count-or-die?style=for-the-badge&logo=starship&logoColor=%23D7E0ED&labelColor=%232F2D42&color=%23FFBDF2)](https://github.com/ashuhlee/count-or-die/stargazers)
[![GitHub Issues or Pull Requests](https://img.shields.io/github/issues/ashuhlee/count-or-die?style=for-the-badge&logo=gitbook&logoColor=%23D9E0EE&labelColor=%232F2D42&color=C1B5FF)](https://github.com/ashuhlee/count-or-die/issues)
[![GitHub repo size](https://img.shields.io/github/repo-size/ashuhlee/count-or-die?style=for-the-badge&logo=removedotbg&logoColor=%23D9E0EE&labelColor=%232F2D42&color=AEE5FF)](https://github.com/ashuhlee/count-or-die)
![Static Badge](https://img.shields.io/badge/version-beta-A5A2B7?style=for-the-badge&logoColor=%23D9E0EE&labelColor=2F2D42)

<a href="https://www.youtube.com/watch?v=l_mUEsx0na8"><img width="170" alt="demo link" src="https://github.com/user-attachments/assets/dbb3d7da-7247-433b-8e1d-a31b979113f5" style="margin-right: 10px;" /></a><a href="https://ashuhlee.notion.site/Count-or-Die-2f5a30a56798803383e7dd6b54a77d4e?source=copy_link"><img width="170" alt="tracker link" src="https://github.com/user-attachments/assets/a3df7a77-42dc-4c1b-93cc-cd844d3f12d7" /></a>

</div>

## About the Game

**Platforms:** Windows, MacOS, Browser <br>
**Status:** In Development - Beta

Count or Die is an arcade counting game with progressive difficulty, randomized power-ups, multiple game modes, and a timer that gets faster as you level up!

### Gameplay Demo
<div align="center">

https://github.com/user-attachments/assets/31746f90-5190-4f27-89c4-96ff47f62f6b

</div>

## Gameplay

### Core Mechanics
The main objective is straightforward, reach the counting goal before the timer runs out. The game however, will do its best to stop you.

- **Progressive Difficulty:** Each completed goal makes the timer 1.2x quicker. Don't get too comfortable!
- **Strategic Boosts:** 4 boosts per game let you skip straight to the goal. Use them early and you'll regret it. Use them too late and you'll also regret it.
  
Compete against your personal best high score. In future versions, compare your scores with others via the global leaderboard!

### Game Modes
- **Regular Mode:** Classic sequential counting with regular numbers only
- **Nerd-Out Mode:** A random mix of numbers and math equations (e.g., 25, 4 × 10, 100 ÷ 2) _(Coming soon)_

### Power-Up System
As you play, power-ups randomly spawn on the screen, but you have to click them before they vanish. And try not to click _certain_ ones.
| Type | Effect | Chance of Spawning |
|------|--------|--------------------|
| <img height="36" alt="candy" src="https://github.com/user-attachments/assets/aff7a350-c06e-4e74-8612-f2e313e364df"/>     | 2x counter       |  40%   |
| <img height="36" alt="donut" src="https://github.com/user-attachments/assets/bcc83aa0-7ebb-4d22-a9b5-5b86ae725106"/>     | 4x counter       |  20%   |
| <img height="36" alt="star" src="https://github.com/user-attachments/assets/f52dbe04-cbde-4de5-af6d-f8ca8b51cb09"/>      | Extra boost      |  10%   |
| <img height="36" alt="superstar" src="https://github.com/user-attachments/assets/5b54f551-8a58-4822-b929-9ab59617f6d2"/> | Replenish boosts |  8%    |

### Controls
| Input                | Action                     |
|----------------------|----------------------------|
| `↑` `→`  `W` `D`  `+`| Increase counter           |
| `Spacebar`           | Use a boost (jump to goal) |
| Mouse click          | Button interactions        |

## Discord Rich Presence
<div>
    <img width="280" align="right"
    src="https://github.com/user-attachments/assets/76b878b1-1305-4037-8d1c-5bf0a25dbdf8"/>

  Count or Die has support for Discord Rich Presence, allowing friends to see your game status, current mode and rank. Brag about how fast you can click to your friends!

</div>

#### Available Ranks

| Badge                                                                                                     | Tier           |
|-----------------------------------------------------------------------------------------------------------|----------------|
| <img align="center" width="40" src="https://github.com/user-attachments/assets/e87985a4-9e9a-4aae-b80c-76df72130d57" /> | Slow Fingers (High score - 100+)   |
| <img align="center" width="40" src="https://github.com/user-attachments/assets/b1eeff7a-9dbd-428c-83bc-2897faf7cfc4" /> | Finger Breaker (High score - 200+) |
| <img align="center" width="40" src="https://github.com/user-attachments/assets/9d9ee416-1912-4259-a0df-ad60a0f85dd8" /> | Speed Demon (High score - 300+)    |
| <img align="center" width="40" src="https://github.com/user-attachments/assets/0d0a0278-56fb-481e-a9e6-569cf537a11d" /> | Legend 😮‍💨 (High score - 400+)    |

## Installation
Downloadable installers (`.exe`, `.dmg`) are not yet available in the beta. For play testing, local development, or contributing, run the app locally using the steps below.

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

## Features Currently in Development
- Additional game mode for the math enjoyers
- Improved high score management system

## Tech Stack
- **Electron:** Framework for cross-platform desktop application development
- **Vite:** Build tool for fast development and bundling
- **Discord Integration:** Discord Rich Presence support [(simple-discord-rpc)](https://www.npmjs.com/package/simple-discord-rpc)
- **Electron Forge:** For packaging and distributing Electron apps

   
## Contributing
This is a personal project, but suggestions and contributions are welcome!

### Ways to Contribute
- Report bugs – Open an issue with details
- Suggest features – Share your ideas for gameplay improvements
- Playtesting – Try the game and share feedback on gameplay and user experience

Feel free to check out the [project tracker](https://ashuhlee.notion.site/Count-or-Die-2f5a30a56798803383e7dd6b54a77d4e?source=copy_link) to see what's currently in progress.

<br>
⭐ If you like this project, please consider giving this repo a star!
<!-- 🎮 Made for gamers, pixel art lovers, and anyone with a slow reaction time -->
