# One-Armed Hero (prototype)

A roguelike played on a real one-armed bandit. Gold is your life, and the house always wins in the long run.

Open `index.html` in a browser. It is a single file with no dependencies besides Google Fonts. All pixel art is hand-drawn in code (`SPR`).

## The machine

- **Five real reels** with fixed strips (19 stops each at the start). Each spin picks one stop per reel.
- **One payline:** only the middle row counts, read from the left (3, 4 or 5 in a row; 1–2 cherries on the first reels). Wilds stand in for anything.
- **Calibrated paytable:** `PAYTABLE` holds base pays. `machine()` enumerates the strips exactly (a PAR sheet in miniature) and scales the table so the RTP is always the target. Changing the reels changes hit rate and volatility, never RTP.
- **Denominations:** higher bets return slightly more, as in real casinos (`RTP_BY_BET`: 94% at bet 1 up to 96.5% at bet 10).
- **Holds:** price is `max(bet + 50% per held reel, expected win / RTP)`, so a hold can never beat the house in gold. Reels rest after being held.
- **Nudges:** after the reels stop, pull the symbol above or below onto the line. A nudged spin pays no gold, it only fights, so the house edge stays intact. One nudge per fight, more from the Rogue, relics, the merchant, and a 5% award after losing spins.
- **Pocket:** save a symbol from the line and drop it on any reel later. It counts and is priced as a hold.

## Combat

- A weapon on the line deals a flat effect regardless of the bet (Sword and Fire 3 damage, Shield 4 block).
- 3/4/5 of a weapon from the left is a combo: `10 / 25 / 60 × bet` damage (or block), ignoring armor, plus the payout.
- Enemies attack for flat gold on a countdown. Skulls on the line rush them.

## Balance

The logic sits between `// ===== LOGIC START =====` and `// ===== LOGIC END =====` and runs in Node for simulation. A simple bot (greedy nudges, no holds or pocket) beats the dragon in roughly half its runs.
