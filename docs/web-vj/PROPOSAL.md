# Webbaserad VJ-app — förslag, avvägningar och öppna frågor

Status: **skiss / diskussionsunderlag**. Ingen kod skriven ännu.
Syfte: komma överens om arkitektur och avgränsning innan bygget startar.

---

## 0. Kort sammanfattning

En realtidsrenderad VJ-app i webbläsaren med:

- **Lagerstruktur med mappar** (2D och 3D i samma träd), där varje mapp renderas till
  en egen buffert — det är mekanismen som gör "lägg en kamera över lagren" möjlig.
- **Kameralager** med orbit/fly/look-at samt DOF, aperture/bokeh, exponering, shutter.
- **Effektstackar** per lager och per mapp, i fem kategorier
  (färg/bild, distort, 3D-objekt, partiklar, matematik/fraktaler).
- **Modulationsmatris** som binder ljud, takt, MIDI/OSC, touch och gyro till vilken
  parameter som helst — det är här "audio/MIDI-reaktivt" faktiskt bor.
- **Transport** med BPM, takter och beat-synkade modulatorer i stället för en
  klassisk keyframe-tidslinje.
- **Två UI-lägen**: *Perform* (fullskärm, tumvänligt, för iPhone) och *Edit*.

Det största vägvalet är inte tekniskt utan **omfattning**. Kravlistan motsvarar
ungefär Resolume + TouchDesigner + en demoscene-raymarcher i en app. Förslaget nedan
delar upp det i faser där varje fas är körbar och användbar för sig.

---

## 1. Relation till TiXL (viktigaste frågan)

Repot är TiXL: C#/.NET, DirectX 11 via SharpDX, HLSL-shaders, en operatorgraf som
sparas som `.t3`/`.t3ui`. Inget av det kan köras i en webbläsare — varken körtiden
(.NET + D3D11) eller shaderspråket (HLSL) eller compute-pipelinen.

Tre realistiska vägar:

| # | Väg | Vad det innebär | Bedömning |
|---|-----|-----------------|-----------|
| A | **Fristående webapp i det här repot** (`web/`) som *lånar* TiXL:s vokabulär, operatornamn och shaderidéer, men är en egen kodbas | Ny TypeScript/WebGPU-app. Effektkatalogen speglar `Operators/Lib/...` så att man känner igen sig. Kan porteras shader-för-shader manuellt över tid. | **Rekommenderas** |
| B | **Webb-player för TiXL-projekt** — läsa `.t3` och exekvera grafen i browsern | Kräver transpilering HLSL→WGSL/GLSL, portering av hundratals operatorer inkl. C#-logik och compute-shaders, plus TiXL:s utvärderingsmodell. Månader innan en kub syns på skärmen. | Nej, inte som start |
| C | **Eget repo** | Renast beroendemässigt, men tappar kopplingen till TiXL:s community och operatorkatalog. | Rimligt alternativ till A |

Mitt förslag: **A**. Vi lägger appen i `web/` med egen `package.json`, helt skild från
`.sln`-bygget, och använder `Operators/Lib`-trädet som facit för namngivning och som
referensmaterial när vi portar effekter (HLSL→WGSL är ofta 20 minuters jobb per shader).

---

## 2. Teknisk grund

### Renderer

Rekommendation: **Three.js med `WebGPURenderer` + TSL, med automatisk WebGL2-fallback.**

Motivering:
- **WebGPU finns nu i Safari på iOS 26+** och ger riktiga compute-shaders — det som gör
  miljonpartikelsystem, SDF-fält och GPU-sortering möjliga på telefon.
- Äldre iPhones/iPads sitter kvar på WebGL2. Three:s backend-abstraktion gör att
  samma noder (TSL) kompileras till både WGSL och GLSL — vi slipper två kodbaser.
- Three ger gratis: GLTF/OBJ-laddare, DRACO/meshopt/KTX2, kamerakontroller, render targets,
  instansiering, tonemapping.

Alternativ som övervägts:
- *Rå WebGL2 + eget minimalt ramverk*: mer kontroll, mindre bundle, men vi bygger om
  laddare, instansiering och materialsystem själva. Kostar veckor.
- *Three klassisk WebGLRenderer*: säkrast, men inga compute-shaders → partiklar måste
  köras som ping-pong-texturer med transform feedback. Går, men taket blir lägre.
- *Babylon.js*: starkare "engine"-känsla, men Three ligger närmare demoscene-idiomen.

### Appstack

- **TypeScript + Vite**. Rendering sker helt utanför React; React används bara till UI-chrome.
- **Zustand** (eller motsvarande) för projektstate; renderloopen läser state direkt, aldrig via React.
- **PWA**: installerbar, fullskärm på iPhone, Wake Lock så skärmen inte somnar under en spelning.
- **OPFS/IndexedDB** för projekt och importerade assets, så en reload inte tömmer allt.
  Projektfil = JSON + assets, exporteras som `.zip`.

### Prestandabudget (styrande, inte önsketänkande)

- Mål: 60 fps på iPhone 13-klass, 30 fps golv med automatisk nedskalning.
- **Adaptiv renderskala** 0.5–1.0× som primärt reglage — en fullskärms-raymarcher på
  en telefon ska rendera i halv upplösning och skalas upp, alltid.
- **Kvalitetsnivåer** (Low/Med/High) som stänger av dyra pass (DOF, motion blur,
  antal raymarch-steg, partikelantal) i stället för att låta allt tugga ihjäl sig.
- HDR-compositing i `rgba16float`, linjärt ljusrum, tonemap sist.

---

## 3. Datamodell: lager, mappar, kamera

```
Project
 └─ Root (folder)
     ├─ Folder "Scene A"           ← renderas till egen buffert, har blend+effekter
     │   ├─ Camera (orbit)         ← gäller alla 3D-lager i mappen
     │   ├─ Layer  Mesh3D  (glb)
     │   ├─ Layer  Shape3D (torus)
     │   └─ Layer  Particles
     ├─ Folder "Overlay"
     │   ├─ Layer  Text
     │   └─ Layer  Image
     └─ Layer Feedback              ← läser föregående frame
```

**Nyckelidé:** *en mapp är ett render target.* En mapp med 3D-innehåll renderas med sin
kamera till en textur; i föräldern beter den sig sedan exakt som ett 2D-lager
(blendläge, opacitet, effektstack). Det ger:

- "Kamera över lagren" utan specialfall — kameran är ett lager i mappen.
- Per-grupp DOF, motion blur och bloom (som behöver djup och rörelsevektorer,
  vilket bara finns inuti en 3D-mapp).
- Möjlighet att stapla flera oberoende 3D-scener med olika kameror.

### Lagertyper

`Shape3D` (kub, sfär, torus, torusknut, cylinder, kon, plan, ikosaeder, superformel) ·
`Mesh3D` (importerad OBJ/GLB) · `Particles` · `Field` (SDF/raymarch/fraktal) ·
`Image` · `Video` · `Camera-in` (webbkamera) · `Solid/Gradient` · `Text` ·
`Feedback` · `Folder`.

### Kameralager

- Lägen: **Orbit** (auto-rotation med hastighet/radie/höjd), **Fly/Free**,
  **Look-at target** (följ ett annat lager), **Path** (rör sig längs spline),
  **Handheld/Shake**, **Locked**.
- Optik: FOV/brännvidd, near/far, **fokusavstånd** (manuellt eller auto-fokus på ett lager),
  **aperture/f-tal**, antal bländarblad → bokehform, exponering, shutter angle → motion blur.
- DOF-implementation: separerbar bokeh i halvupplösning med circle-of-confusion från djup.
  Ärlig varning: "riktig" bokeh med blad-form kostar; på Low-nivå blir det gaussiskt.

### Parametrar

Varje parameter är `{ value, min, max, curve, modulation[] }`. Samma typ överallt →
modulationsmatrisen kan nå allt, och "MIDI learn"/"audio learn" fungerar generellt
i stället för på utvalda parametrar.

---

## 4. Effektsystem

Två nivåer:

1. **Färdiga effektnoder med parametrar** — det är vad man använder live. Ligger i en
   *stack* per lager/mapp (som insert-effekter i en mixer), inte i en fri graf.
   En stack är dramatiskt lättare att förstå och att köra med tummen på en telefon,
   och täcker uppskattningsvis 90 % av behovet.
2. **Fri nodgraf + shader-editor** — senare fas, för den som vill gå djupare.

### Katalog (förslag, speglar `Operators/Lib`)

**Bild & färg**
Levels · Curves · HueSat · ColorGrade/LUT · Tonemap · Exposure · Vignette · Grain ·
Bloom · Glow · Sharpen · Blur (gauss/directional/radial/zoom) · Chromatic aberration ·
Dither · Posterize/Steps · Pixelate · ASCII · Halftone · Voronoi-celler · Mosaic/honeycomb ·
Edge detect · Fake light · Invert/Threshold · **Feedback/trails** (med transform per frame —
den klassiska VJ-effekten: rotera+skala föregående bild lite varje frame).

**Distort**
Displace (via textur/brus/fält) · Wave/Ripple · Twirl · Bubble/lens zoom · Polar coords ·
Kaleidoskop (Koch/KIFS) · Slit-scan · RGB-shift · Glitch (blockförskjutning, pixel sort,
scanline/RGB-TV, subdivision stretch) · Edge repeat/mirror · Datamosh-look.

**3D-objektmanipulation**
Transform · Noise displace (vertex/point) · Twist/Bend/Taper · Explode/shatter per triangel ·
Inflate/extrude · Instansiering & arrays (grid, radial, fibonacci, längs spline) ·
Mesh → punktmoln → partiklar · Wireframe/edges · Subdivide/smooth · Boolean/SDF-blandning ·
Vertex-attributmappning (färg per normal/höjd/ljud) · Melt/tessellation.

**Partiklar** (GPU: WebGPU compute, annars ping-pong-texturer)
- *Emitters:* punkt, meshyta, meshvolym, bildluminans, kant/kontur, ljudtriggad burst.
- *Krafter:* gravitation, turbulens (curl noise), attract/repel, vortex, drag, vind,
  kollision mot plan/SDF, flocking/boids, fältföljning.
- *Renderare:* billboard-sprites, trails/ribbons, instansierad mesh, linjer till närmsta
  grannar ("plexus"), metaballs.

**Matematik & fraktaler (demoscene)**
Ett `Field`-lager som raymarchar en SDF-scen, med djuputskrivning så att det kan blandas
med vanlig geometri:
- 3D: **Mandelbulb**, **Mandelbox**, **Menger-svamp**, **Sierpinski/KIFS**,
  **Apollonian gasket**, kvaternion-Julia, Kleinian-grupper, domain repetition
  (oändliga tunnlar/städer), SDF-primitiver med smooth-min-blandning.
- 2D: Mandelbrot/Julia, plasma, Truchet-plattor, reaction-diffusion, cellulära automater,
  flow fields.
- Attraktorer (Lorenz, De Jong, Clifford, Thomas) som **partikelkällor** — billigt och
  visuellt oerhört tacksamt.
- Belysning: enkel AO + normal från gradient + en "glow by iteration count"-läge, vilket
  är vad de flesta 64k-intron faktiskt gör.

*Ärlig varning:* fullskärms-raymarch av en Mandelbulb är den dyraste saken i hela appen.
Den ska köras i halv/kvarts upplösning på telefon, med begränsat antal steg.

---

## 5. Modulation: ljud, MIDI, takt, touch

Hjärtat i appen. En **modulationsmatris**: `källa → mål`, med `amount`, `kurva`,
`smoothing`, `range` och polaritet.

**Källor**
- **Ljud:** RMS/volym, frekvensband (bas/mellan/diskant + fritt definierade band),
  enskilda spektrumbins, onset/beat-detektion, BPM-estimering.
- **Klocka:** bar, beat, 1/4, 1/8, 1/16, fas 0–1, ramp, beat-synkade LFO:er.
- **LFO:** fri (sin/tri/saw/square/perlin/S&H).
- **Envelope follower**, random, step sequencer.
- **MIDI:** CC, noter, velocity, pitchbend, MIDI-clock. Med **MIDI learn**.
- **OSC** via WebSocket-brygga.
- **Touch:** XY-pads, makroreglage, tryckkänslighet.
- **Gyro/accelerometer** på telefonen — underskattad och väldigt rolig live-kontroll.
- **Kamera/video-luminans** som modulator.

### Två plattformsbegränsningar du behöver känna till

1. **Web MIDI finns inte i Safari — varken macOS eller iOS.** WebKit har medvetet valt
   bort det av fingerprinting-skäl och har ingen offentlig roadmap. Eftersom *alla*
   webbläsare på iOS tvingas använda WebKit gäller det Chrome och Firefox på iPhone med.
   Konsekvens: **MIDI fungerar på desktop (Chrome/Edge/Firefox) men inte på iPhone via Safari.**
   Möjliga vägar runt det:
   - OSC/WebSocket-brygga: en liten app på datorn skickar MIDI vidare till telefonen. Fungerar idag.
   - Native wrapper (Capacitor/WKWebView + CoreMIDI) om iPhone-MIDI är ett hårt krav.
   - Acceptera att telefonen styrs med touch-makron + gyro + ljud, och att MIDI är en desktop-funktion.
2. **Ljudingång på iPhone** kommer från mikrofonen (eller ett USB-C-ljudinterface) —
   du kan inte tappa systemljudet. Kräver dessutom HTTPS och en användargest för att starta.

---

## 6. Tidslinje och transport

Du skriver att tidslinjen inte behöver användas eftersom allt renderas i realtid. Jag
tror det betyder att du egentligen vill ha en **transport/klocka**, inte en
keyframe-tidslinje. Förslag:

- **Transport:** BPM (tap tempo, MIDI-clock, auto-detektion från ljud), taktart,
  bar/beat-räknare, play/pause/resync, "nudge".
- **Bar-rutnät v1 = scener/cues, inte keyframes.** Du lägger ut scenbyten på takter
  och loopar 4/8/16 takter — alltså närmare Ableton Session view / en clip launcher
  än After Effects tidslinje. Det passar live och passar en telefonskärm.
- **Keyframe-automation** blir en senare fas om behovet finns.

Allt beat-synkat (LFO:er, sequencers, triggers) hämtar fas från transporten, så
"blinka på fjärdedelar" är en modulationskoppling, inte en tidslinjekurva.

---

## 7. Import av OBJ och GLB

- GLB/GLTF via `GLTFLoader` med DRACO-, meshopt- och KTX2-stöd. OBJ via `OBJLoader` + MTL.
- Vid import normaliseras modellen: centrering, skalning till enhetsstorlek, generering av
  normaler/tangenter, samt en punktmolnsvariant för partikel- och punktoperatorer.
- **Mobilbudget:** varning vid stora filer/trianglar, valfri decimering, texturkomprimering
  till KTX2. En 80 MB GLB kraschar en iPhone-flik.
- Filval fungerar via vanlig file picker på iOS; drag & drop på desktop. Assets sparas i
  OPFS så projektet överlever en omladdning.

---

## 8. UI — "enkelt att förstå, körbart på iPhone"

**Perform-läge** (default på telefon, liggande läge, output i fullskärm bakom UI:t):
- Scen-/cue-knappar (stora, 4–8 st).
- 2 XY-pads + 8 makroreglage som mappas till vad du vill.
- Tap tempo, blackout, strobe/freeze, master-crossfade.
- UI:t tonar bort automatiskt och kommer tillbaka vid beröring.

**Edit-läge:**
- Lagerlista till vänster (kollapsbara mappar, drag för att sortera, öga/lås per lager).
- Parametrar för valt lager i ett panel/"sheet" som dras upp från botten på telefon.
- Effektstack med `+`-knapp och kategorivis bläddring.
- Modulationsmatris som en egen vy: dra från källa till parameter, eller "learn".

**Gestregler (icke förhandlingsbara om det ska funka med en tumme):**
44 pt minsta träffyta · inga hover-beroenden · inga dubbelklick · reglage dras
horisontellt var som helst i sin rad, med finjustering vid långsam dragning ·
långtryck = kontextmeny · allt nåbart utan zoom.

**Output till projektor:** på desktop går det via ett andra fönster/fullskärm på skärm 2.
På iPhone finns inget bra sätt att få ut en separat output-signal från Safari — det blir
skärmspegling via AirPlay eller en HDMI-adapter, vilket speglar hela UI:t. Något att
väga in om telefonen ska driva projektorn och inte bara fjärrstyra.

---

## 9. Faser

| Fas | Innehåll | Syfte |
|-----|----------|-------|
| **0 — Prototyp** | Renderer, lagerlista, 3 primitiver, en kamera, 5 effekter, ljudreaktivitet, BPM-klocka | Bevisa att det känns rätt i handen på en riktig iPhone innan vi bygger vidare |
| **1 — MVP** | Full lagerstruktur med mappar, GLB/OBJ-import, ~25 effekter, modulationsmatris, partiklar v1, spara/ladda, Perform-läge | Användbar app för en riktig spelning |
| **2 — Djup** | Raymarch/fraktal-lager, partiklar v2 (compute), DOF/motion blur, MIDI/OSC, cue-system på takter | Det som gör den till en demoscene-maskin |
| **3 — Expert** | Shader-editor, fri nodgraf, presetdelning, desktop-wrapper för NDI/Spout/MIDI | För den som vill gå hela vägen |

---

## 10. Ärlig feedback och risker

- **Omfattningen är det verkliga problemet.** Kravlistan är tre professionella
  produkter i en. Fas 0 bör därför vara en liten, spelbar app snarare än ett halvfärdigt
  ramverk — den avgör alla senare beslut.
- **Termik på telefonen:** en iPhone som renderar fullskärms-raymarch i 60 fps
  strypnedtaktar efter några minuter. Adaptiv renderskala är en funktion, inte en optimering.
- **Safari-fällor:** ingen Web MIDI, ljud kräver användargest, WebGL-kontext tappas när
  fliken går i bakgrunden (måste kunna återskapas), minnestak per flik, video kräver
  `playsinline`, Wake Lock behövs.
- **Presets och preset-morphing** är det som gör en VJ-app rolig att spela på. Det bör
  planeras in i datamodellen från början (alla parametrar serialiserbara och interpolerbara),
  även om UI:t kommer senare.
- **Ett urval slår ett överflöd.** 25 välvalda effekter som går att kombinera slår
  150 som ingen hittar i. TiXL:s befintliga katalog är en bra urvalsgrund.

---

## 11. Öppna frågor

1. **Relation till TiXL:** fristående app i `web/` (A), eller ett eget repo (C)? Ska den
   på sikt kunna läsa TiXL-projekt, eller är det bara vokabulär och stil vi lånar?
2. **Renderer:** WebGPU-först med WebGL2-fallback (mitt förslag), eller ren WebGL2 för
   maximal kompatibilitet med äldre telefoner? Vilken iPhone-modell/iOS-version är din
   lägsta nivå i praktiken?
3. **Primär enhet:** är iPhone huvudinstrumentet, eller är det "måste också fungera på
   iPhone" medan desktop är där du faktiskt jobbar? Det styr hela UI-prioriteringen.
4. **MIDI på iPhone:** givet att Safari inte stöder Web MIDI alls — räcker desktop-MIDI
   plus OSC-brygga, eller är MIDI direkt till telefonen ett hårt krav (som då kräver en
   native wrapper)?
5. **Output:** ska telefonen driva projektorn direkt (skärmspegling), eller styra en
   dator som renderar? Det andra alternativet öppnar för fjärrstyrning över nätverk.
6. **A/B-decks?** Vill du ha två oberoende decks med crossfade (Resolume-modell), eller
   en enda scen där du tänder och släcker lager?
7. **Effektstack eller fri nodgraf** som utgångspunkt? Jag förordar stack först, graf senare.
8. **Ljudkälla:** mikrofon, ljudfil laddad i appen, eller båda? Finns det behov av att
   synka mot en DJ-mjukvara (då blir MIDI-clock/Link-brygga relevant)?
9. **Tidslinjen:** ska den kunna spela upp en show automatiskt (scenbyten på takt),
   eller räcker det att den ger takt och fas till modulatorerna?
10. **Video som lager** — behövs det (uppspelning av klipp, webbkamera), eller är allt
    genererat?
11. **Presets:** ska de kunna delas mellan användare/enheter, eller räcker lokalt?
12. **Videoreferenserna:** nätverket här blockerar YouTube, så jag kunde bara identifiera
    en av länkarna ("Clean Slate", Conspiracy, Revision 2021 — 64k intro). Kan du i en
    mening per video säga vad det är du fastnar för? Geometrin, ljussättningen,
    klippningen mot musiken, fraktalerna, partiklarna? Det styr vilka effekter som
    hamnar i fas 0 mer än något annat i det här dokumentet.
