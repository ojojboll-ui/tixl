# Harmonices

En fristående prototyp (en enda HTML-fil, ingen build) av en synt/sequencer som utforskar sambanden mellan geometri och musik. Öppna `index.html` i en webbläsare och tryck **Starta ljud**.

## Gränssnitt

Allt styrs helst genom att dra direkt i formerna. Värdet du ändrar tonas fram vid pekaren.

- **Klang**: alla tre röster ligger ovanpå varandra. Formens storlek är volymen och vågen som ritar formen syns halvgenomskinlig bakom. Dra utåt/inåt för volym, runt för vridning. Vald röst har handtag: ◆ antal hörn, ● rundning/stjärna, ✚ nav (excentricitet), ■ sträckning. För Cirklar är handtagen 2 och 3 cirklarna (utåt = radie/FM-index, runt = varvtal).
- **Sequencer**: dra hörn utåt/inåt för tonhöjd och runt för vridning, tryck på euklidiska steg för att slå av/på, dra Fibonaccis startvärden runt cirkeln och dra solrosens vinkel (snäpper vid 137,5°). Siffermärkena i hörnet scrubbas upp/ner.
- **Filter per röst**: en ruta visar röstens övertoner och filterkurvan. Dra handtagen HP och LP i sidled för frekvens och uppåt för resonans. Filtret räknas också på formen, så ett stängt lågpass rundar av hörnen tills bara cirkeln (grundtonen) finns kvar.
- **Eko och rymd** (globala): XY-ytor. Ekot (tid 1/16 till 1/4·, återkoppling, mix) skickar en kopia av formen utåt för varje eko, i takt. Rymden (genererat impulssvar, storlek 0,3–8 s, mix) gör glöden starkare och längre när tonerna slår an.
- Reglage finns kvar för oktav, attack och släpp, och för exakta värden under "Alla värden" och "Reglage".

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
