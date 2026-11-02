# Harmonices

En fristående prototyp (en enda HTML-fil, ingen build) av en synt/sequencer som utforskar sambanden mellan geometri och musik. Öppna `index.html` i en webbläsare och tryck **Starta ljud**.

## Ljudmotorer (per röst, tre röster samtidigt)

- **Form**: en punkt åker runt en form (polygon, rundning, stjärna, vridning, sträckning). Punktens höjd blir vågformen. Formen räknas om till övertonsspektrum (Fourier → `PeriodicWave`), så ljudet blir bandbegränsat.
  - *Fart*: punkten går med jämn fart längs kanten (diamant → triangelvåg, kvadrat → trapetsvåg).
  - *Vinkel* + *Excentricitet*: punkten ses från ett nav som flyttats ur mitten och vinkeln går jämnt. Det ger fasdistorsion, så en cirkel närmar sig en sågtand.
  - *XY*: x går till vänster kanal och y till höger, som i oskilloskopmusik.
- **Cirklar**: upp till tre cirklar med varvtalskvoter (heltal, Fibonacci-kvoter, φ, √2, π, e).
  - *Epicykel*: additiv syntes, spirografmönstret är exakt det man hör.
  - *FM*: cirkel 2 och 3 modulerar farten (radien blir modulationsindex). Ljudet visas som en "blomma" runt grundtonens varv.

## Sequencerlägen

- **Polygoner**: polyrytm av regelbundna polygoner i en cirkel. Knappen "Hör hörnen som ackord" spelar samma kvoter som frekvenser.
- **Euklidisk**: Bjorklund-/euklidiska rytmer i tre ringar av olika längd.
- **Fibonacci**: Fibonacci (och Lucas) modulo m väljer skalsteg och loopar efter Pisanoperioden. Fibonacciordet ger rytmen.
- **Gyllene vinkeln**: solrosmodellen (137,5°) väljer toner, så melodin aldrig upprepas.

## Övrigt

Stämningar (ren, 12-TET, pytagoreisk, övertonsserien), skalor som polygoner i tonhjulet, notfärger från "ljusets oktav" (frekvens × 2⁴⁰ → våglängd) eller kvintcirkeln, och ett XY-oskilloskop.

Prototypen är tänkt som underlag för att senare kunna bygga motsvarande operatorer i TiXL.
