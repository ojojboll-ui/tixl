# Robo Ball — teknik

## 1. Rekommendation i en mening

**Godot 4, 2D, med Godots inbyggda fysik för världen och en handskriven markkontroller
för RB.** Skriptspråk: GDScript om webbexport ska vara ett förstahandsmål, C# om
Windows/Steam räcker.

## 2. Motorval — varför Godot

| Alternativ | För | Emot | Dom |
|---|---|---|---|
| **Godot 4** | gratis och MIT-licensierad (inga royalties, inga licensvillkor som ändras), utmärkt 2D som inte är påklistrat på en 3D-motor, inbyggd 2D-ljussättning med skuggkastare (ficklampan), litet nedladdningsbart bygge, exporterar till Windows/macOS/Linux/webb/mobil, öppen källkod → vi kan patcha motorn om ett tillgänglighetsbehov kräver det | mindre färdigt ekosystem än Unity, en del plugins är enmansprojekt | **Ja** |
| Unity | störst ekosystem, Box2D inbyggt, mycket färdig kod att köpa | licensmodellen har ändrats ensidigt förut → risk för ett projekt som ska leva länge och kanske delas ut gratis; tyngre pipeline | Nej |
| GameMaker | snabbt för 2D | svag stelkroppsfysik, svårare att bygga egna tillgänglighetslager | Nej |
| Egen motor i webben (TypeScript + PixiJS + Planck/Rapier) | maximal kontroll över input och tillgänglighet, körs överallt utan installation, fungerar med hjälpmedel som redan finns i webbläsaren | vi bygger editor, kartverktyg, partiklar, ljud, sparsystem själva — månader innan första hoppet känns bra | Nej som huvudspår |

Öppen källkod är dessutom ett argument i sig här: om projektet söker medel från t.ex.
Arvsfonden är "resultatet blir fritt tillgängligt och går att vidareutveckla av andra"
inte en teknikdetalj utan en del av ansökan.

### GDScript eller C#?
Du har C#-vana (det här repot är ett C#-projekt). C# i Godot är ett fullgott
förstahandsspråk och passar en stor kodbas som ska leva i flera år. **Men:**
webbexport för C#/.NET har historiskt legat efter GDScript-exporten. Om spelet ska
gå att spela direkt i webbläsaren — vilket är ett tungt tillgänglighetsargument, eftersom
skolor och habiliteringar sällan får installera program — så verifiera att C#-webbexport
fungerar i den Godot-version vi väljer *innan* vi låser språket. Gör den inte det:
GDScript.

Prototypen bör skrivas i det språk vi ska behålla. Att skriva om senare är dyrare än
att ta beslutet nu.

## 3. Fysikarkitektur

Det här är projektets svåraste tekniska beslut, så det förtjänar detaljer.

### Varför RB inte ska vara en RigidBody
Det frestande är att göra RB till en cirkelformad stelkropp och låta motorn sköta allt.
Det ger dålig känsla: hastigheten blir svårkontrollerad, han studsar och snurrar
oförutsägbart, och Sonic-loopar fungerar inte alls. Alla spel med den här sortens
rullande hjälte (Sonic, Rayman-boll-sektioner, Kirby-baller) använder en egen
markkontroller.

### RB:s tre lägen

```
GROUNDED   : hastighet lagras som skalär "markfart" längs ytans tangent.
             Varje tick: shapecast nedåt → hitta yta + normal → projicera
             rörelsen längs normalen → applicera gravitationens
             tangentkomponent (fart uppför backe, fart nedför).
             Släpper vid för låg fart i brant lutning ("gravitationsgräns"),
             vilket ger loopar gratis: har man fart klarar man loopen,
             annars ramlar man av.
AIRBORNE   : v += g·dt; position += v·dt. Ingen styrning. Kollision via
             shapecast; vid träff antingen landning (projicera in i
             GROUNDED) eller studs (reflektera med restitution).
AIMING     : RB fryst; bara pilen uppdateras. Världen kör med time_scale.
```

### Världens fysik
Allt destruerbart och gungande är riktiga `RigidBody2D`: lådor, plankstaplar,
stenblock, trapetser (`PinJoint2D`), vippbrädor. Skörhet modelleras som
"tål X joule" — vid träff jämförs `0.5·m·v²` mot tröskeln, över tröskeln byts objektet
mot sina bitar med ärvd rörelsemängd. Det är samma trick som Angry Birds använder och
det är billigt.

### Godots fysik eller Box2D?
Godots inbyggda 2D-fysik räcker med god marginal för det här. Om vi någon gång behöver
mer stabila staplar eller determinism finns färdiga GDExtensions som byter ut hela
fysikservern mot **Box2D** eller **Rapier2D** — ett rader i projektinställningarna,
inte en omskrivning. Det är alltså inget vi behöver bestämma nu, vilket är precis vad
man vill av ett sådant beslut.

Determinism är värt en tanke: om vi vill ha "spela upp ditt bästa hopp"-funktioner eller
automatiska regressionstester av banor behöver fysiken vara reproducerbar, och där är
Rapier/Box2D-extensionerna starkare än inbyggda. Inte ett krav för v1.

### Slow motion
Använd **inte** `Engine.time_scale` rakt av — den saktar ner allt, inklusive UI, ljud
och siktpilen, och gör slow motion-styrkan omöjlig att koppla loss från spelkänslan.
Lägg i stället en egen `WorldClock` som gameplay-noder läser sitt delta ifrån, medan
UI och siktpil kör på riktig tid. Slow motion-faktorn blir då ett rent
tillgänglighetsreglage (1.0 = av, 0.05 = nästan pausad).

## 4. Inputarkitektur — projektets viktigaste kodbeslut

Hela spelet får bara känna till **en** händelse:

```gdscript
signal_pressed   # "spelaren gjorde något"
signal_released  # (behövs bara för håll & släpp-varianten)
```

Allt annat är adaptrar som mynnar ut i den signalen:

| Källa | Adapter | Kommentar |
|---|---|---|
| Tangentbord (valfri tangent) | Godot input | de flesta kontaktmanöverdon (switchar) emulerar tangentbord |
| Mus/pekskärm (klick var som helst) | Godot input | ögonstyrningsprogram emulerar oftast musklick via dwell |
| Handkontroll (valfri knapp) | Godot input | inkl. Xbox Adaptive Controller |
| Blås/sug, blink, huvudmus | via HID-emulering | ingen egen kod behövs |
| Ögonstyrning (Tobii m.fl.) | i steg 1: hjälpmedlets egen dwell-klick. I steg 2: eget plugin för blickposition | se nedan |
| Ljud (rop/blås i mikrofon) | egen adapter, tröskel + brusgolv | överraskande populärt hos den som inte kan använda händer |

**Insikten:** eftersom praktiskt taget alla kommersiella hjälpmedel redan emulerar
tangentbord, mus eller handkontroll, så fungerar spelet med dem *utan att vi skriver
en rad hjälpmedelskod* — förutsatt att vi accepterar "vilken tangent som helst" och
"klick var som helst på skärmen". Det är gratis räckvidd, och det ska stå i kravet
från dag ett.

Ögonstyrning som *riktad* input (titta där du vill hoppa, i stället för pendelpil) är
en senare, större sak: den kräver plattformsspecifikt SDK och ett helt eget siktläge.
Lägg den i fas 4+, men designa siktsystemet så att "vinkeln kommer utifrån" är en
möjlig källa redan nu.

Lägg också in **inmatningsloggning** (anonymt, lokalt, avstängbart): tid mellan signaler,
missade hopp, var man fastnar. Utan den datan blir tillgänglighetsjusteringar gissningar.

## 5. Färdiga byggblock att använda

* **Fysik:** Godot inbyggd → vid behov `godot-box2d` eller `godot-rapier2d` (GDExtension).
* **Kamera:** Phantom Camera (Godot-addon) i stället för egen kameralogik — mjuk följning,
  zoner, look-ahead. Kameran är extra viktig här: spelaren styr inte, så kameran måste
  visa vad som kommer.
* **Banredigering:** Godots TileMapLayer räcker; Tiled + importplugin om vi vill ha
  externa banbyggare (t.ex. en pedagog som gör egna banor — värt att fundera på).
* **Animation:** hand­ritat i Krita/Aseprite; Godots AnimationPlayer + skelett för RB:s ben.
* **Ljud:** Godots bussar räcker; Audacity/Reaper för produktion. Ljud är ett
  tillgänglighetsverktyg här, inte dekor — varje viktig händelse behöver ett eget ljud.
* **Ljus/mörker:** `PointLight2D` + `LightOccluder2D` ger ficklampan direkt i motorn.
* **Sparning/inställningar:** eget litet JSON-lager (profiler, se ACCESSIBILITY.md).
* **Beteenden för fiender:** Beehave (behavior trees) om fienderna växer i komplexitet;
  börja med enkla tillståndsmaskiner.

## 6. Projektstruktur och arbetsflöde

```
robo-ball/
  docs/            # denna dokumentation
  game/            # Godot-projektet
    core/          # WorldClock, InputSignal, Save, Settings, Profiles
    actor/         # RB: markkontroller, siktläge, förmågor
    world/         # tiles, destruerbara objekt, faror, fiender
    ui/            # scanning-meny, HUD, karta
    levels/
    art/  audio/
  tools/           # bygg-/exportskript, banverktyg
```

* Git + **Git LFS** för bild- och ljudkällor (skanningar blir stora).
* GitHub Actions som bygger Windows- och webbexport på varje tagg och laddar upp till
  itch.io (butler) — testbygge i händerna på testarna samma dag som en ändring görs.
* Källfiler (Krita, ljudprojekt) i repo eller i molnmapp, men *versionera* dem.

## 7. Prestandabudget

Måltak: 60 fps på en sju år gammal bärbar dator med integrerad grafik, och på
Chromebook via webben. Det är målgruppens hårdvara, inte en speldator. Det betyder:
tak för antal aktiva stelkroppar per skärm (~80), destruktionsbitar med livslängd, och
partiklar som är avstängbara (vilket ändå krävs av tillgänglighetsskäl).
