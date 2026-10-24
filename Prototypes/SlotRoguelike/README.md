# One-Armed Hero (prototype)

A roguelike played on a real five-reel online slot. The machine is fixed and certified at 96% RTP, so you lose money in the long run, like at any casino. The run is where you grow: charms change what every win does in combat.

Open `index.html` in a browser. It is a single file with no dependencies besides Google Fonts. All pixel art is hand-drawn in code (`SPR`).

## The machine

Fixed math, the same for every player and every run (`STRIPS`, `PAYTABLE`, `LINES`):

- 5×3 reels, 30 stops per reel, generated once from a fixed seed.
- 10 fixed paylines, left to right from reel 1.
- **Nudging wild** on reels 2–4: nudges to the middle and expands over the whole reel.
- **Scatter:** 3 / 4 / 5 anywhere give 10 / 15 / 25 free spins with wins ×3. Retriggers.
- **Hold & Spin:** 6+ coins. Coins stick, 3 respins, every new coin resets the count. Coin values 0.5×–50× bet, filling all 15 cells adds a GRAND of 100× bet.
- **Bonus buy:** 10 free spins for 24× bet (average return 22.6×).
- Big Win (10×), Mega Win (25×) and Epic Win (50×) celebrations, a teasing slow-down when two scatters are showing, autoplay and turbo.

### PAR sheet

From a 20 million spin simulation of this exact machine:

| | |
|---|---|
| RTP | 96.01% |
| Base game | 65.12% |
| Free spins | 19.92% |
| Hold & Spin | 10.97% |
| Hit rate | 24.2% |
| Free spins | about 1 in 117 spins |
| Hold & Spin | about 1 in 411 spins |
| Std. dev. per spin | 5.2× bet |

If you change `STRIPS`, `PAYTABLE` or the feature constants, re-run the simulation and update `PAR`.

## The meta game

Nothing in the run touches the payouts. Everything below is combat:

- **Attack row** (the middle row): weapons there always strike, win or not. Sword and Fire deal 3, Shield gives 4 block. The bet does not change this.
- **Every win fights.** Each winning line fires its symbol's power. Sword and Fire lines hit for 4 / 10 / 25 per 10 gold of bet, Shield lines block as much, BAR stuns (the enemy attacks a spin later), Seven crits (all damage ×2), Cherry charges your special. Every winning line also adds +1 charge.
- **Free spins** freeze the enemy. **Hold & Spin** coins also pelt the enemy.
- **Special:** each class has one, ready at 10 charge (Berserk, Meteor, Lucky Break).
- **Charms** (5 slots, 18 in total) change those rules, in the style of Balatro's jokers. Forge boosts improve the attack row.
- **Elites and bosses bend the rules:** armor, a reel that stays put, wilds that don't expand, halved block.

## Balance

The logic sits between `// ===== LOGIC START =====` and `// ===== LOGIC END =====` and runs in Node for simulation. A simple bot (no bonus buys, greedy charm picks) beats the dragon in about 40–47% of runs.
