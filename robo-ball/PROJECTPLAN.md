# Robo Ball — projektplan

## 1. Mål

Ett färdigt, säljbart 2D-metroidvania på 3–4 timmars speltid som går att spela med en
enda signal, med grafik och fysikkänsla som håller kommersiell nivå, och med
tillgänglighetsinställningar som gör att målgruppen faktiskt kan spela det själva —
inte titta på när någon annan gör det.

Sekundärt mål: att inställningslagret och inputlagret är återanvändbart och öppet, så
att andra utvecklare kan göra samma sak billigare.

## 2. Arbetssätt

* **Vertikal skiva före bredd.** Ett litet område som är helt färdigt säger mer om
  projektet än sex halvfärdiga.
* **Speltest med målgruppen i varje fas**, från gråboxprototypen och framåt.
* **Tillgänglighet byggs in i systemen, inte ovanpå.** Varje ny mekanik ska svara på
  "hur ställs den in?" innan den byggs klart.
* **Alltid spelbart.** `main` ska alltid gå att exportera och skicka till en testare.

## 3. Faser

### Fas 0 — Beslut och känsla (3–4 veckor)
Syfte: ta reda på om kärnan är rolig innan vi bygger något runt den.

* Låsa motor och språk (se "Öppna frågor").
* Gråboxprototyp: auto-gång, vändning, siktläge med pendelpil, slow motion,
  ballistiskt hopp, landning. Ingen grafik, en enda testbana.
* WorldClock och InputSignal på plats från början — det är dessa två som allt annat
  bygger på.
* En hink med lådor att krossa, för att känna på Angry Birds-biten.
* **Milstolpe:** någon som aldrig sett spelet kan ta sig genom en hinderbana med
  mellanslag som enda knapp, och tycker det är kul. Första speltestet med 1–2 barn.
* **Beslutspunkt:** känns hoppet bra? Om pendelpilen är frustrerande måste vi lösa det
  här, inte i fas 3.

### Fas 1 — Systemgrunden (2–3 månader)
Syfte: bygga det som är dyrt att lägga till i efterhand.

* Markkontrollern på riktigt: ramper, lutningar, en fungerande loop, vändlogik,
  kantskydd.
* Fysiklagret: destruerbara objekt med energitröskel, trapetser, vippbrädor.
* Inputadaptrar för alla källor i TECH.md, plus inmatningslogg.
* Inställnings- och profilsystem, sparning, scanning-UI för menyer.
* Förmågesystem (ramverk) + förmåga 1–2 (rulla, ben).
* Kamera (Phantom Camera), grundläggande ljudbussar.
* **Milstolpe:** hela inställningsmatrisen i ACCESSIBILITY.md går att ändra i spelet och
  påverkar något synligt. Genomgång mot Game Accessibility Guidelines.

### Fas 2 — Vertikal skiva (3–4 månader)
Syfte: ett område i färdig kvalitet, som också blir vårt visningsmaterial.

* Kraschplatsen + början av grottorna, 20–30 minuters spel.
* Förmåga 3 (spikar) och 5 (ficklampan) med sina grindar.
* Färdig grafik i konceptskissernas stil, animerad RB, ljudbild, en mellansekvens.
* Två fiendetyper, en minichef.
* **Milstolpe:** speltest med hela referensgruppen (5–8 barn). Trailer-dugligt material.
* **Beslutspunkt:** här vet vi vad ett område kostar i tid, och kan räkna om resten av
  planen på riktiga siffror i stället för gissningar.

### Fas 3 — Världen (6–9 månader)
* Resterande biotoper: skrotupplaget, rörsystemet, rampdalen.
* Förmåga 4, 6, 7, 8 med tillhörande grindar och genvägar.
* Kartsystem, snabbresa, samlarföremål.
* Fiendegalleri, 2–3 chefer.
* Löpande speltest varje kvartal.

### Fas 4 — Tornet och polering (3–4 månader)
* Sluttornet: sammanfattar alla förmågor, slutchef, avslutning.
* Balansering av alla assistlägen — varje läge ska klara hela spelet.
* Prestandaarbete mot budgeten i TECH.md.
* Lokalisering svenska/engelska, uppläst text.
* Vuxenläget (inställningsguide för föräldrar och personal).

### Fas 5 — Release och efter (2 månader + löpande)
* Steam- och itch-sidor med konkret tillgänglighetsbeskrivning, webbversion om möjlig.
* Pressarbete riktat mot både speltidningar och funktionsrättsrörelsen — det här är en
  berättelse som har publik.
* Efter release: ögonstyrning som riktad input, fler styrningsvarianter, ev. banredigerare
  för pedagoger.

### Total tidsuppskattning
Cirka **18–24 månader på heltid för en person**, väsentligt längre på fritiden. Med en
deltidsartist och en deltidsljudperson i fas 2–4 kan det pressas mot 12–15 månader
kalendertid. Det är en ärlig siffra för ambitionen "riktigt spel med snygg grafik";
den kan halveras genom att korta speltiden till 90 minuter, vilket är en fullt rimlig
första utgåva.

## 4. Roller

| Roll | Behov | Kommentar |
|---|---|---|
| Programmering | genomgående | fysik, systemarkitektur, tillgänglighetslager |
| Speldesign / banor | från fas 1 | banbyggande i ett spel utan styrning är en egen konstform |
| 2D-grafik och animation | tyngdpunkt fas 2–4 | konceptskisserna finns redan, stilen är satt |
| Ljud och musik | fas 2–4 | ljud bär mycket av tillgängligheten |
| Tillgänglighetsrådgivning | löpande | arbetsterapeut/specialpedagog, gärna betald konsulttid |
| Testledning | varje fas | boka, genomföra och tolka speltest med barnen |

Du täcker sannolikt de två första själv. Den viktigaste externa personen är
tillgänglighetsrådgivaren — den rollen sparar mest omarbete.

## 5. Risker

| Risk | Konsekvens | Motmedel |
|---|---|---|
| Enknappsstyrningen blir tråkig i längden | projektet dör i fas 3 | fas 0 avgör detta; djupet ska komma från *världen* och förmågorna, inte från inmatningen |
| Pendelpilen känns som ett lotteri | frustration hos just den målgrupp vi bygger för | förhandsbana, siktehjälp, diskreta vinkelsteg, auto-sikte — alla finns i planen |
| Markkontroller + stelkroppsvärld krockar (RB fastnar, skakar, skjuts genom väggar) | klassisk tidstjuv | tydlig gräns mellan lägena, shapecast i stället för punktkollision, "fastnat"-detektor som återställer |
| Scope creep (fler förmågor, större värld) | aldrig färdig | förmågelistan är låst efter fas 2; nya idéer går till "efter release" |
| Speltest med målgruppen är logistiskt tungt | vi bygger på gissningar | bygg relationer med habilitering/särskola redan under fas 0, inte när vi behöver testarna |
| Webbexport kraschar i språkvalet | ombyggnad | verifiera i fas 0, inte senare |
| Ensamprojekt tappar fart | vanligaste dödsorsaken | kvartalsvisa speltest ger yttre deadlines och den bästa sortens motivation |

## 6. Finansiering (svenska spår att undersöka)

* **Allmänna Arvsfonden** — finansierar nyskapande projekt för barn, unga och personer
  med funktionsnedsättning. Det här projektet ligger mitt i deras uppdrag. Kräver
  normalt en ideell organisation som huvudman, så samarbete med en förening
  (t.ex. inom funktionsrättsrörelsen) är en förutsättning värd att lösa tidigt.
* **Postkodstiftelsen** och liknande stiftelser.
* **Nordisk kulturkontakt / Creative Europe** för spelutveckling.
* **Kommersiellt:** utgivare inriktade på tillgängliga eller "wholesome" spel; plattformarnas
  egna tillgänglighetsprogram (Xbox har haft initiativ på området).
* Kombinationen "socialt uppdrag + kommersiellt spel" är stark i ansökningar, men kräver
  att man är tydlig med båda delarna. Verifiera aktuella villkor innan ansökan.

## 7. Öppna frågor att besluta

1. **Var ska koden bo?** Det här repot är en fork av TiXL (ett C#-verktyg för motion
   graphics). Ett Godot-spel hör inte hemma i samma repo. Förslag: eget repo
   `robo-ball`. Denna dokumentation ligger tills vidare här.
2. **Plattformsmål:** Windows först, eller webb från början? Webb ger enorm räckvidd i
   skola och habilitering (ingen installation), men styr språkvalet i motorn.
3. **Språk:** GDScript eller C#? Beror på fråga 2 och på hur mycket du vill återanvända
   din C#-vana.
4. **Ambition för v1:** 3–4 timmar (planen ovan) eller 90 minuter (halva tiden, tidigare
   i händerna på barnen)?
5. **Ensam eller med hjälp?** Grafik och ljud är de områden där extern hjälp ger mest
   per krona.
6. **Speltestare:** vilka kontakter finns redan från ditt arbete med barnen? Det är
   projektets mest värdefulla tillgång.

## 8. Nästa konkreta steg

1. Besluta fråga 1–3 ovan.
2. Sätta upp repo, Godot-projekt, CI som exporterar ett bygge.
3. Bygga fas 0-prototypen (auto-gång, sikte, hopp, en hög lådor).
4. Boka första speltestet innan prototypen ens är klar — datumet driver arbetet.
