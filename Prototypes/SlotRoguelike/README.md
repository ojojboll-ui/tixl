# Enarmad Hjälte (prototyp)

Ett roguelike där du slåss med en spelautomat i stället för kort. Guld är ditt liv: varje snurr kostar guld, och når du 0 är rundan slut.

- Öppna `index.html` i en webbläsare (en enda fil, inga beroenden förutom Google Fonts).
- All pixelgrafik är handritad i koden (`SPR` längst upp i skriptet), 16×16 med automatisk kontur.
- Spellogiken ligger mellan `// ===== LOGIC START =====` och `// ===== LOGIC END =====` och kan köras i Node för balanssimulering.

## Balansreglage

| Konstant | Var | Vad |
|---|---|---|
| `SPIN_COST` | logik | Kostnad per snurr |
| `CLASSES` | logik | Startguld, startväska och passiv per klass |
| `ENEMIES` | logik | HP, attack, takt (`every`), rustning, förbannelse |
| `LINE_FX` | logik | Vad tre i rad ger |
| `rewardSymbols`, `genMap` | logik | Belöningar och kartans rumsfördelning |
