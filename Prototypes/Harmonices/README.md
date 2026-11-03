# Harmonices

En fristående prototyp (en enda HTML-fil, ingen build) av en synt/sequencer som utforskar sambanden mellan geometri och musik. Öppna `index.html` i en webbläsare och tryck **Spela**.

## Starta med MIDI, Bluetooth och Ableton Link

Webbläsare kan inte prata Ableton Link direkt, och MIDI/Bluetooth kräver att sidan körs från en säker adress. Den lilla bryggan i `bridge/` löser båda:

```
cd Prototypes/Harmonices/bridge
npm install        # bygger Link-modulen (kräver Node 18+ och byggverktyg: Xcode på Mac, Build Tools på Windows)
npm start
```

Öppna sedan **http://localhost:20809** i Chrome eller Edge.

- **MIDI**: tryck *MIDI* och tillåt åtkomst. Kanal 1–3 spelar röst I–III (eller välj *Vald röst* / *Alla röster*). Pitch bend (±2 halvtoner), sustain (CC64), modhjul/CC74 (lågpass), CC71 (resonans) och CC7 (volym) fungerar. *Följ MIDI-klocka* synkar tempo, start och stopp mot en DAW.
- **Bluetooth-MIDI**: tryck *Bluetooth-MIDI* och välj ditt keyboard (Web Bluetooth, Chrome/Edge på dator eller Android). På Mac kan du också para keyboardet i Ljud-MIDI-konfiguration och sedan använda *MIDI*.
- **Ableton Link**: tryck *Ableton Link*. Tempo synkas åt båda hållen, takterna ligger i fas och start/stopp följer sessionen (aktivera Start Stop Sync i Live).
- Utan keyboard: spela på klaviaturen på sidan eller med datorns tangenter (A W S E D F T G Y H U J K, Z/X byter oktav).

Bryggan lyssnar bara på 127.0.0.1 och tar bara emot WebSocket-anslutningar från localhost.

## Modulering (LFO)

Två LFO:er rör formerna i takt med tempot. Varje LFO har en form (Cirkel, Diamant, Kvadrat, Sågtand, Slump eller Gyllene, där Gyllene är en sample-and-hold som stegar med φ), en takt från 8 takter till 1/16, djup, mål och röst (I, II, III eller alla med fasförskjutning mellan rösterna). Målen är vridning, rundning/stjärna, sträckning, excentricitet, cirkel 2/3:s radie (FM-index), lågpass och volym/storlek. Eftersom formen är ljudet räknas vågformen om löpande (FFT) och spelande toner byter våg medan de klingar. Dra utåt i en LFO för djup och runt för takt. LFO-inställningarna sparas i patchen.

## Arpeggiator

Slå på **Arpeggio** i panelen Spela och håll ett ackord (keyboard, Bluetooth, klaviaturen eller datorns tangenter). Tonerna spelas en i taget i takt med tempot, och i fas med sequencern och Link när de är igång. Mönster: Upp, Ner, Upp/ner, **Stjärna** (stjärnpolygonen {n/k} runt ackordet), **Gyllene** (137,5° per steg, upprepas aldrig), **Fibonacci** (talföljden modulo antalet toner), Slump och Spelordning. Takt 1/4–1/32 med trioler, 1–4 oktaver, tonlängd, swing och *Lås ackord*. Mönstret ritas som en figur över ackordet: dra runt i den för att ändra k och utåt för tonlängd. Sustainpedalen håller kvar toner i arpeggiot, och inställningarna sparas i patchen.

## Patcher

Knappen **Patcher** öppnar biblioteket med fabrikspatcher och dina egna, med en miniatyr av rösternas former. **Spara** skriver över den aktuella egna patchen (eller sparar en ny om du utgår från en fabrikspatch), **Spara som ny** skapar en kopia och Ctrl/Cmd+S sparar. **Exportera** och **Importera** flyttar patcher som `.harmonices.json`-filer. På claude.ai sparas patcherna privat på ditt konto, i den fristående versionen i webbläsaren. En patch innehåller tonart, stämning, tempo, sequencerläge och mönster, alla tre röster med filter samt eko och rymd.

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
