# Enarmad Hjälte (prototyp)

Ett roguelike på en riktig enarmad bandit. Guld är ditt liv, och huset vinner alltid till slut.

Öppna `index.html` i en webbläsare. Det är en enda fil utan beroenden förutom Google Fonts. All pixelgrafik är handritad i koden (`SPR`).

## Automaten

- **Tre riktiga hjul** med fasta remsor (22 stopp vid start). Varje snurr väljer ett stopp per hjul.
- **En vinstlinje:** bara mittenraden räknas.
- **Vinsttabell + kalibrering:** `PAYS` har grundvärden. `machine()` räknar exakt fram den förväntade utbetalningen ur hjulen (en par-sheet i miniatyr) och skalar tabellen så att RTP alltid blir exakt målvärdet. När du ändrar hjulen ändras därför volatiliteten och träffrekvensen, aldrig RTP:n.
- **Valörer:** högre insats ger något högre RTP, som på riktiga kasinon (`RTP_BY_BET`: 94 % vid insats 1 till 96,5 % vid insats 10).
- **Lås:** priset är `max(insats + 50 % per låst hjul, förväntad vinst / RTP)`. Ett lås kan alltså aldrig slå huset i guld. Det du köper är stridseffekten.
- **Fickan:** spara en symbol från linjen och lägg den på valfritt hjul senare. Den räknas och prissätts som ett lås.

## Strid

- Ett vapen på linjen gör fast skada, oavsett insats (svärd och eld 3, sköld 4 block).
- Tre lika vapen (jokern räknas) är en power-kombo: `12 × insats` i skada (Fästning `8 × insats` block) plus utbetalning.
- Fienden anfaller med fast guldskada enligt sin nedräkning. Dödskallar på linjen skyndar på den.

## Balans

Logiken ligger mellan `// ===== LOGIC START =====` och `// ===== LOGIC END =====` och kan köras i Node för simulering.
