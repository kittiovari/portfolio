# Portfólió — projektleírások és háttéradatok (kivonat ChatGPT-nek)

_Generálva a kittipedia.hu élő forrásából (`src/i18n/translations.js`, magyar blokk) + a repó `PROJEKTEK.md` háttérdokumentumából._

## Mi a feladat

Az alábbi szövegek egy UX/UI designer portfólióoldalán jelennek meg. Kérek rájuk szövegmódosítási javaslatokat.

### Hangnem és stílus

- Közvetlen, barátságos és szakmai — **ne** corporate, **ne** túl marketinges.
- Magyar tipográfia (gondolatjel, magyar idézőjel: „”).
- A „user” helyett **„felhasználó”**.
- A projektek nevei **nem változhatnak**.
- Első személyű, aktív hang („terveztem”, „dolgoztam”), ne passzív.

### Technikai korlátok (fontos!)

| Szövegtípus | Hol jelenik meg | Hossz | Kiemelés |
|---|---|---|---|
| Bemutatkozó bekezdések | „Rólam” kártya | 2 bekezdés, egyenként ~2–3 mondat | nem lehet (sima szöveg) |
| Módszertani kártyák | „Hogyan dolgozom?” 3 kártya | ~2–3 mondat / kártya | IGEN: `<strong class="copper-text">…</strong>`, kártyánként 1–2 |
| Projekt rövid leírás | projekt-modal, a cím alatt | **1–2 mondat** | nem lehet (sima szöveg) |
| „Mire kerestünk választ?” | projekt-modal | 1 kérdő mondat | nem lehet |
| „Fő megoldások & eredmények” | projekt-modal, listaelemek | `Címke: magyarázat` formátum | a `Címke:` rész automatikusan accent színt kap |
| „Tanulság” | projekt-modal, kiemelt doboz | `Címke: magyarázat` formátum | ugyanaz |

A három módszertani kártya desktopon **azonos magasságú** — a szövegek közel azonos hosszúak legyenek.

---

# 1. rész — Oldalszintű szövegek

## Főcím (változatlan maradjon)

> Az emberi viselkedés megértéséből építek **intuitív élményeket**

_(a félkövér rész accent színnel jelenik meg)_

## Bemutatkozó

> Horváthné Óvári Kitti vagyok, product designer és UX generalista. A nyelvészet és a pszichológia felől érkeztem a UX világába, ezért különösen érdekel, hogyan gondolkodnak az emberek, mi motiválja őket, és hol akadnak el.

> A munkám során kutatással, rendszerezéssel és tervezéssel kötöm össze a felhasználói igényeket az üzleti célokkal. Komplex folyamatokból egyszerűbb, átláthatóbb digitális élményeket építek.

## „Hogyan dolgozom?” — 3 kártya

### 1. Megértés & Kutatás

Megjelenő szöveg (a **félkövér** részek accent kiemelések):

> Mielőtt megoldást tervezek, szeretném érteni a **valódi problémát**. Kérdezek, kutatok és megfigyelek, hogy ne feltételezésekből, hanem **valódi felhasználói igényekből** induljunk ki.

Nyers forma:

```html
Mielőtt megoldást tervezek, szeretném érteni a <strong class="copper-text">valódi problémát</strong>. Kérdezek, kutatok és megfigyelek, hogy ne feltételezésekből, hanem <strong class="copper-text">valódi felhasználói igényekből</strong> induljunk ki.
```

### 2. Tisztaság & Rendszer

Megjelenő szöveg (a **félkövér** részek accent kiemelések):

> Szeretem kibogozni az összetett folyamatokat, **megtalálni az elakadásokat**, majd **egyszerűbb és átláthatóbb rendszert** építeni belőlük. Olyat, amit a felhasználónak nem kell megfejtenie.

Nyers forma:

```html
Szeretem kibogozni az összetett folyamatokat, <strong class="copper-text">megtalálni az elakadásokat</strong>, majd <strong class="copper-text">egyszerűbb és átláthatóbb rendszert</strong> építeni belőlük. Olyat, amit a felhasználónak nem kell megfejtenie.
```

### 3. Együttműködés

Megjelenő szöveg (a **félkövér** részek accent kiemelések):

> **A jó termék csapatmunka.** Szeretek fejlesztőkkel, üzleti szereplőkkel és tervezőkkel együtt gondolkodni, és olyan közeget teremteni, ahol **a félkész ötleteket is érdemes kimondani**. 😊

Nyers forma:

```html
<strong class="copper-text">A jó termék csapatmunka.</strong> Szeretek fejlesztőkkel, üzleti szereplőkkel és tervezőkkel együtt gondolkodni, és olyan közeget teremteni, ahol <strong class="copper-text">a félkész ötleteket is érdemes kimondani</strong>. 😊
```

---

# 2. rész — Projektek

Projektenként előbb az, ami **megjelenik az oldalon**, majd a **háttérinfó** (ez nem jelenik meg, csak kontextus a javaslatokhoz).

---

## 1. Lakás- és életbiztosítási portálcsalád  `[cig]`

- **Időszak:** 2024. nov. – 2026. máj.
- **Szerep:** Lead UX/UI Designer & Kutató (End-to-End)
- **Csapat:** 6 fejlesztő, 2 business analyst, 1 delivery lead, 1 UX/UI Designer
- **Domain:** Biztosítás / InsurTech
- **Címkék:** UX Research · Rebranding · Design System · AI integráció · B2C & B2B · Insurtech
- **Kiemelt projekt az oldalon**

### Megjelenő szövegek

**Rövid leírás** (`context` mező):

> Lakás- és életbiztosítási portálok tervezése a kutatástól a UX- és UI-designig. A projekt része volt egy egységes design system és vizuális rendszer kialakítása is.

**Fő megoldások & eredmények:**

- Életbiztosítási domain & Szinkronizáció: Rendkívül összetett életbiztosítási logikát és a termékszinkronizációs kihívásokat kezeltem.
- AI-ajánló & 7 perces flow: Személyre szabott csomagválasztót terveztem, ami radikálisan lecsökkentette a kötési időt.
- Rebranding & Design System: Egységes, skálázható UI kitet építettem a teljes portálcsaládhoz.
- B2C + B2B folyamatszinkron: Azonos logikájú publikus és ügynöki felületeket hoztam létre a mentális tehermentesítésért.

**Tanulság:**

- Domain-komplexitás: Átlátható digitális élménnyé egyszerűsítettem egy szigorúan szabályozott termékstruktúrát.
- Szervezeti koordináció: Nagy fejlesztői csapatban gyakoroltam a perszóna-alapú tervezést szoros határidők mellett.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A biztosítók elavult rendszerekkel dolgoztak, az ügyfelek nehezen intézték online ügyeiket. Nem volt egységes portálcsalád.
- **Mit csináltam?** AI-támogatott lakástermék publikus és partner portált terveztem, design systemet alakítottam ki külső brand book alapján, és egy ~10 termékes életbiztosítási csoport legacy rendszerét újraterveztem. Discovery research interjúkkal, usability tesztelés 2 turnusban.
- **Mi lett az eredmény?** Egységes portálcsalád (publikus, partner, ügyfél), design system, usability tesztekkel validált felületek.
- **Extra:** 6 fős fejlesztői csapat, 2 business analyst.

---

## 2. Vállalati és ügyfélportálok  `[cib]`

- **Időszak:** 2024. nov. – 2025. okt.
- **Szerep:** Lead UX Consultant & End-to-End Designer (Solo)
- **Csapat:** 5 fejlesztő + 1 business analyst (külső ügynökség), 1 UX Designer
- **Domain:** Banki / Pénzügy
- **Címkék:** UX Kutatás · Design System · Vállalati Bankolás · Oktatás · Feltáró Workshopok Stakeholderekkel
- **Kiemelt projekt az oldalon**

### Megjelenő szövegek

**Rövid leírás** (`context` mező):

> Vállalati és ügyfélportálok, valamint biztosítási digitális termékek tervezése. UX/UI design mellett design systemen és Figma-oktatáson is dolgoztam.

**Fő megoldások & eredmények:**

- Koncepcióalkotás & kutatás: Workshopokkal és interjúkkal feltártam az elakadásokat és kutatásalapú javaslatokat dolgoztam ki.
- Brand-rekonstrukció & UI kit: Újraépítettem a brand elemeket és márkahű komponenskönyvtárat alakítottam ki.
- Figma oktatás: 10 alkalmas belső képzést tartottam, megalapozva a 2026-os brandújítást.

**Tanulság:**

- Kultúraváltás: Kis lépésekkel és workshopokkal szigorúan szabályozott banki környezetben is sikerült UX-igényt teremtenem.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A bank digitális csatornáin nem volt egységes élmény, nem létezett design system. A call center operátorok több rendszert (CEUS, FLOW, ECM) használtak párhuzamosan, manuális kategorizálással, központi tudásbázis nélkül.
- **Mit csináltam?** Discovery fázistól: perszónaépítés, feltáró mélyinterjúk, kihívás-térképezés (technológiai, munkafolyamat, képzési, ügyfélkapcsolati, adminisztratív). Usability tesztek. Design system nulláról. CIB Bingo, Corporate Portal, Customer Portal. Figma/UX kurzus a csapatnak. 7 AI-alapú megoldási javaslat.
- **Mi lett az eredmény?** Egységes design system, validált portálok, upskilled csapat. Azonosított fájdalompontok: rendszerintegráció hiánya, lassú rendszerindulás, manuális folyamatok, túlterhelés, stressz.
- **Extra:** Mentor szerep is (junior betanítás). Perszónák: Szűcs Anna (CC operátor, 26), Kovács János (biztosított, 48).

---

## 3. Gombaazonosító mobil webapp  `[gombarat]`

- **Időszak:** 2026. március – 2026. június
- **Szerep:** Solo Product Owner, UX Designer & Full-Stack Developer
- **Csapat:** Solo (AI-assisted development: Claude Code, React, Supabase)
- **Domain:** Mobil app / Természet
- **Címkék:** Mobile Webapp · AI integráció · AI-Assisted Coding · Pet-project
- **Kiemelt projekt az oldalon**

### Megjelenő szövegek

**Rövid leírás** (`context` mező):

> Saját AI-kódolt tanulóprojektem, amelyet a kutatástól a UX- és UI-designig építettem fel.

**Fő megoldások & eredmények:**

- Felelősségteljes AI-azonosítás: Olyan fotóalapú azonosítást alakítottam ki, ami egyezőségi valószínűséget mutat és figyelmeztet a szakellenőrzésre legközelebbi kontaktokkal.
- Tudásbázis & Szakellenőr-kereső: 300+ fajt tartalmazó gombatárat és gombaellenőr-keresőt építettem be.
- Vibe-coding játszótér: Kutatással, tervezéssel, AI-támogatott kódolással (React + Supabase+Netlify) önállóan voltam képes a terméket életre hívni.

**Tanulság:**

- AI Prototípusépítés: Kitapasztaltam az AI-kódolás lehetőségeit a gyors koncepció-validálásban.
- Rendszerkorlátok: Felismertem az AI-assisted coding határait a skálázhatóság és konzisztencia terén.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A gombászok nehezen azonosítják a vadon termő gombákat, a téves azonosítás életveszélyes.
- **Mit csináltam?** Kameraalapú azonosító app 300+ fajjal, szezonális naptárral, szakértői hálózattal és interaktív kvízrendszerrel.
- **Mi lett az eredmény?** Működő mobil alkalmazás (React + Supabase + Netlify).
- **Extra:** Személyes pet-projekt, AI-támogatott kódolással (Claude Code).

---

## 4. Customer és ügyfélszolgálati portál  `[uniqa]`

- **Időszak:** 2023. szept. – 2024. március
- **Szerep:** UX/UI Designer (Solo)
- **Csapat:** 4 fejlesztő, 1 business analyst, 1 delivery lead, 1 UX/UI Designer
- **Domain:** Biztosítás
- **Címkék:** UX/UI Design · Insurtech · Felhasználói Tesztelés · UI Refactoring · Agilis Csapatműködés

### Megjelenő szövegek

**Rövid leírás** (`context` mező):

> Az online ügyfélportál újratervezésén dolgoztam, a meglévő felületek és folyamatok átgondolásával.

**Fő megoldások & eredmények:**

- UI refactoring & szerkezeti rekonstrukció: Újragondoltam a nem strukturált drótvázakat, és szisztematikus komponenshasználattal konzisztens Hi-Fi UI felületeket alakítottam ki.
- Koncepciókibontás & folyamatkiterjesztés: Kidolgoztam a teljes ügyfélútvonalakat (regisztráció, onboarding, szerződéskezelés, zöldkártya-igénylés).
- Kutatás & Usability tesztelés: Felhasználói tesztekkel validáltam a folyamatokat az elakadások megszüntetésére.

**Tanulság:**

- Állandósult UX hely: Közvetlen, agilis bevonódással vettem át a külsős partnerek feladatait.
- Szervezeti hatás: A szoros fejlesztői együttműködéssel belső UX-igényt teremtettem a megrendelőnél.
- Workflow kilépítése solo designerként: Önállóan tisztáztam az információátadás és az iterációk kereteit.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** Az ügyfelek nehezen navigáltak a biztosítási portálon és elakadtak a fontos folyamatokban.
- **Mit csináltam?** UI kit tisztázás, login és regisztrációs flow, ügyfélmigrálás, zöldkártya-igénylés, dashboard és szerződés-részletező tervezése.
- **Mi lett az eredmény?** Gördülékenyebb ügyintézés, tisztázott UI kit.
- **Extra:** A kulcsképernyők készen voltak; a fő feladat a UI kit tisztázása volt.

---

## 5. AI ügyfélszolgálati chatbot  `[aimee]`

- **Időszak:** 2024. augusztus – 2025. március
- **Szerep:** UX/UI Designer (Solo)
- **Csapat:** 4 fejlesztő, 1 product owner, 1 UX/UI Designer
- **Domain:** AI / InsurTech
- **Címkék:** UX Design · Insurtech · Human-Centered AI · Termékarculat-tervezés

### Megjelenő szövegek

**Rövid leírás** (`context` mező):

> AI-alapú ügyfélszolgálati chatbot felületének tervezése, ahol a komplex technológiát egyszerűen használható felületté kellett formálni.

**Fő megoldások & eredmények:**

- Perszónaépítés & Scope-validáció: Kidolgoztam biztosítók belső operátori és végfelhasználói perszónáit, és kutatás alapján segítettem tisztázni AImee MVP scope-ját.
- Termékesítés & Brandépítés: Arculattal és UI kittel ruháztam fel a koncepciót, egységes felületté formálva az AI funkciókat.
- Panaszkezelési folyamat: Átlátható, magas-fidelitású drótvázakká alakítottam az összetett biztosítási panaszkezelést.

**Tanulság:**

- Kétoldalú fókusz: Párhuzamosan fedtem le az operátori és végfelhasználói igényeket.
- Fejlesztésből termék: A technológiai alapokat szerethető, tisztázott UI kitre épülő termékké formáltam.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** Az ügyfélszolgálat nem győzte feldolgozni a beérkező megkereséseket.
- **Mit csináltam?** AI tudásbázis-chatbot, beérkező e-mail kategorizáló sürgősség-méréssel, automatikus válaszgeneráló tervezése.
- **Mi lett az eredmény?** Tehermentesített operátorok, gyorsabb válaszidő.

---

## 6. Tappancs biztosítás és kárbejelentés  `[alphavet]`

- **Időszak:** 2024. március – 2024. szeptember
- **Szerep:** UX/UI Designer (Solo)
- **Csapat:** 1 fejlesztő (külsős ügynökség), partneri kontaktok (CIG & Állatorvosod.hu), 1 UX/UI Designer
- **Domain:** Biztosítás / Állategészségügy
- **Címkék:** UX/UI Design · Insurtech · E-commerce · Benchmarking · UI Kit

### Megjelenő szövegek

**Rövid leírás** (`context` mező):

> Kisállat-biztosítási felületek tervezése a biztosításkötéstől a kárbejelentésig. A teljes folyamat UX- és UI-designján dolgoztam.

**Fő megoldások & eredmények:**

- Versenytárs-elemzés: Elemeztem a hazai és nemzetközi piacot a leggördülékenyebb minták azonosítására.
- Brand-rekonstrukció & Illusztrációk: Újraépítettem a márkaelemeket, UI kitet építettem és egyedi illusztrációs koncepciót alkottam.
- Kötési és kárbejelentési flow-k: Tiszta lépésekre bontott kötési és kárbejelentési űrlapokat terveztem.

**Tanulság:**

- Konzisztens UI alapozás: Szoros határidők mellett is sikerült a brand elemeket UI kitként értelmezni, konzisztens komponens könyvtárat létrehozni.
- Proaktivitással az információhiány ellen: A partnerekkel és a külsős fejlesztővel a szokásosnál önállóbb kapcsolattartás elengedhetetlen volt az igények tisztázásához, a termékkoncepció időre formálódásához, az időre szállításhoz.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A kisállat-tulajdonosoknak nem volt egyszerű módja a biztosításkötésre és kárbejelentésre. Fájdalompontok: hosszú várakozás, mobil csatorna hiánya, problémás ügykezelés, nehéz információ-elérhetőség.
- **Mit csináltam?** Biztosítási termék és kárbejelentési flow-k tervezése. Viselkedési minták vizsgálata. Az igényeket közvetlenül az ügyféltől és a biztosítótól nyertem ki.
- **Mi lett az eredmény?** Egyszerűsített kárbejelentési flow, kevesebb lemorzsolódás. A leggyakoribb ügyintézési kérdések feltérképezése (díjak, módosítások, kárügyek, felmondás).
- **Extra:** Perszóna: Kovács János (48, alap digitális készségek). CIG Pannónia + allatorvosod.hu együttműködés, külső fejlesztői csapattal.

---

## 7. Foglalómotorból okos magánszálláshely weboldal  `[appartman]`

- **Időszak:** 2022. október – 2023. március
- **Szerep:** Junior UX/UI Designer
- **Csapat:** 1 PO, 1 Marketinges, 2 Dev, 3 Designer (1 Mentor + 2 Junior)
- **Domain:** SaaS / Hospitality
- **Címkék:** UX Research · Hotjar · Redesign · SaaS · Product Positioning · Benchmarking

### Megjelenő szövegek

**Rövid leírás** (`excerpt` mező):

> Magánszálláshelyek foglalómotorján és weboldal-szerkesztőjén dolgoztam. A kutatási eredményekre építve terveztem a felhasználói folyamatokat és a felületeket.

**Mire kerestünk választ?**

> Miért nehéz önállóan igazodniuk a szállásadóknak az admin felületen, és miért volt félreértve a termék értéke (pl. a „foglalómotor" kifejezés) a célközönség körében?

**Fő megoldások & eredmények:**

- Multi-metódusú UX kutatás & Döntéselőkészítés: Mélyinterjúkkal, Hotjar-elemzéssel, versenytárs-benchmarkinggal és FB-csoportos véleménykutatással tártam fel a szállásadók valós fájdalompontjait és nyelvezetét.
- Stratégiai termékpozicionálási javaslat: A kutatások alapján a nehezen értelmezhető „foglalómotor" helyett a magánszálláshelyek közvetlen webes foglalását támogató, „okos felület" koncepciójára tettem javaslatot.
- Navigáció & Automatizációs redesign (UX csapattal): A UX csapattal együttműködve gondoltuk újra az admin navigációt, a pricing modult, az automatizált e-mail folyamatokat és a Google-integrációk felületeit az elakadások megszüntetésére.

**Tanulság:**

- Kutatásalapú javaslattétel: Megtapasztaltam, hogy a felhasználói visszajelzésekre építő, megalapozott javaslatok alapjaiban formálhatják át a termék stratégiai irányát.
- Agilis design csapatmunka: Erős alapokat szereztem a szisztematikus kutatási módszertanokban és a társtervezőkkel közös, összetett SaaS-redesign folyamatokban.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A szállásadók nehezen navigáltak a régi admin felületen, fontos funkciók rejtve maradtak.
- **Mit csináltam?** Mélyinterjúkkal feltártam az igényeket, majd új navigációt, Google-értékelés integrálást és automatizált e-mail rendszert terveztem.
- **Mi lett az eredmény?** Átláthatóbb munkamenet, jobb navigáció.
- **Extra:** Szerep a CV-ben: Termékmenedzser + UX Designer.

---

## 8. B2B lead generátor platform  `[mixie]`

- **Domain:** SaaS / B2B Sales
- **Címkék:** SaaS · B2B

### Megjelenő szövegek

**Rövid leírás** (`excerpt` mező):

> B2B leadgeneráló alkalmazás meglévő funkcióinak továbbfejlesztése és új funkciók tervezése.

_Az adatban szerepel, de az oldalon **nem jelenik meg**:_

- `summary`: Lassú lead generálás → optimalizált flow → hatékonyabb sales
- `scope`: UX research | flow | UI

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A cégek nehezen generáltak értékesítési leadeket, a hagyományos módszerek lassúak és költségesek voltak.
- **Mit csináltam?** UX kutatás, felhasználói flow-k tervezése, reszponzív webes + mobil felület. Work flow egyszerűsítése, stratégiai céloldalak és lead scoring funkció.
- **Mi lett az eredmény?** Működő leadgenerátor platform reszponzív felülettel.
- **Extra:** Danubius IT Solutions projekt. Presales kontextusban is használva.

---

## 9. EU borcímke compliance platform  `[winefo]`

- **Időszak:** 2023. július – augusztus
- **Szerep:** Lead UX/UI Designer & Kutató (End-to-End)
- **Csapat:** 4 fejlesztő, 1 product owner, 1 delivery lead, 1 UX/UI Designer
- **Domain:** SaaS / Boripar / RegTech
- **Címkék:** SaaS · RegTech · Branding · Design System · 0-to-1 Product · Compliance

### Megjelenő szövegek

**Rövid leírás** (`excerpt` mező):

> Az EU-s borcímke-szabályozásnak való megfelelést támogató webalkalmazás tervezése. A kutatástól a UX- és UI-designig vettem részt a folyamatban.

**Mire kerestünk választ?**

> Hogyan lehet a szigorú EU-s jogszabályi határidő szorításában egy komplex, többnyelvű címkegenerálást gyorsan értelmezhető és hibabiztos digitális termékké alakítani?

**Fő megoldások & eredmények:**

- End-to-End terméképítés & Branding (0-ról MVP-ig): A terméknévadástól (naming) és a teljes arculattervezéstől (branding, logó) kezdve közel 10 fő funkciót terveztem meg high-fidelity drótvázakkal az első 2 hónapban.
- Figma Tokenek & Material UI kustomizáció: A gyors szállítás érdekében a Material UI designrendszert alakítottam át és szabtam egyedire Figma tokenek segítségével, megalapozva a skálázható UI-t.
- EU compliance & Nemzetközi áttörés: 24 nyelvű jogi megfelelést automatizáló rendszert építettem; a terméket ma már több kontinensen használják, és a tervek szerint Németország hivatalos QR-kódos címkegenerátora lett.

**Tanulság:**

- Teljes tervezői szabadság & Gyors iterációk: A fejlesztéssel párhuzamosan futó, feszített tempójú tervezés megtanított a nagyon gyors, mégis precíz prototípus-építésre és a felfedező kutatás (discovery) éles alkalmazására.
- Desk research & Versenytárs-elemzés: Mély versenytárselemzéssel azonosítottuk a meglévő piaci szoftverek kockázatait és hiányosságait, így pontosan azokra a területekre fókuszálhattunk, amikben a Winefo jobbá válhatott.

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A borászatok nem tudták, hogy a címkéik megfelelnek-e az EU-szabályozásnak. A manuális ellenőrzés lassú és hibalehetőségekkel teli volt.
- **Mit csináltam?** Wine database struktúra, termékkatalógus, címke-ellenőrző és vásárlói információs felület tervezése. Reszponzív weboldal az EU-s követelmények betartásához.
- **Mi lett az eredmény?** Digitális wine label compliance eszköz, QR-kódos fogyasztói tájékoztató felület.
- **Extra:** Danubius IT Solutions projekt. EU 2021/2117-es QR-kódos jelölési előírás.

---

## 10. Esemény fényshow platform  `[chantblaster]`

- **Időszak:** 2024. május – június
- **Domain:** Event Tech / Szórakoztatás
- **Címkék:** UX/UI

### Megjelenő szövegek

**Rövid leírás** (`excerpt` mező):

> Rendezvények interaktív fényshow-jának vezérlésére szolgáló alkalmazás tervezése.

**Mire kerestünk választ?**

> Hogyan lehet külön eszköz nélkül közös, látványos élményt teremteni nagy létszámú közönség számára?

**Fő megoldások & eredmények:**

- A desktop admin és a rajongói mobil élmény UX/UI redesignjén, a brand kialakításán és a teljes UI kit felépítésén dolgoztam. Az éles megoldást több nemzetközi sport- és koncerteseményen is használták.

_Az adatban szerepel, de az oldalon **nem jelenik meg**:_

- `scope`: Mobil | admin felület
- `focus`: Mobil élmény · Admin felület · Branding · UI kit · Event UX

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** Az eseményszervezők nem tudtak interaktív fényshow-t csinálni a közönség telefonjaival.
- **Mit csináltam?** Desktop admin felület és mobil nézői platform tervezése, ahol a ritmussal szinkronban jelennek meg a fényeffektek. UI kit és illusztrációk.
- **Mi lett az eredmény?** Valós idejű fényshow-szinkron a közönség eszközein. Az éles megoldást több nemzetközi sport- és koncerteseményen használták.

---

## 11. Forráskód letéti SaaS  `[cec]`

- **Időszak:** 2025. augusztus
- **Domain:** SaaS / Jogi tech
- **Címkék:** SaaS

### Megjelenő szövegek

**Rövid leírás** (`excerpt` mező):

> Forráskódletéti folyamatokat támogató B2B SaaS termék tervezése.

**Mire kerestünk választ?**

> Hogyan lehet egy technikailag és jogilag összetett szolgáltatást érthetőbbé és bizalomkeltőbbé tenni?

**Fő megoldások & eredmények:**

- Meglévő UX alapokra építve teljes UI designt és UI kit-et alakítottam ki, egységesebb brand megjelenéssel.

_Az adatban szerepel, de az oldalon **nem jelenik meg**:_

- `scope`: UX/UI | branding
- `focus`: UI design · UI kit · Branding · SaaS · Trust-building interface

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A szoftver-forráskód letéti szolgáltatásnak nem volt modern felhasználói felülete.
- **Mit csináltam?** UX/UI design és brand elemek kialakítása a meglévő szoftvervázra.
- **Mi lett az eredmény?** Professzionális megjelenés, modern UX.

---

## 12. HR hangulat-mérő platform  `[moodmeup]`

- **Időszak:** 2024. július
- **Domain:** HR Tech / SaaS
- **Címkék:** UX/UI

### Megjelenő szövegek

**Rövid leírás** (`excerpt` mező):

> Munkavállalói hangulat mérésére készült digitális alkalmazás tervezése.

**Mire kerestünk választ?**

> Hogyan lehet láthatóvá tenni olyan csapaton belüli jelzéseket, amelyek a mindennapi működésben gyakran rejtve maradnak?

**Fő megoldások & eredmények:**

- Dashboard UX/UI tervezéssel támogattam egy adatvezérelt HR visszajelző koncepció kialakítását. A projekt koncepcionális szinten maradt.

_Az adatban szerepel, de az oldalon **nem jelenik meg**:_

- `scope`: HR dashboard
- `focus`: Dashboard · HR · Data visualization · Concept design

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A cégek nem látták időben a dolgozói elégedetlenséget, ami fluktuációhoz vezetett.
- **Mit csináltam?** HR szoftver tervezése, ami méri a cégen belüli hangulatot és adatalapú visszajelzést ad a vezetőknek.
- **Mi lett az eredmény?** Adatalapú hangulatmérés, fluktuáció csökkentése. A projekt koncepcionális szinten maradt.

---

## 13. InsurTech szolgáltatás koncepció  `[di-insurtech]`

- **Domain:** InsurTech
- **Címkék:** UI Design

### Megjelenő szövegek

**Rövid leírás:** _nincs — a modalban jelenleg nem jelenik meg leírás_

_Az adatban szerepel, de az oldalon **nem jelenik meg**:_

- `summary`: Absztrakt ötlet → vizuális koncepció → döntéstámogatás
- `scope`: UI koncepció

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** A Danubius biztosítási szolgáltatásához nem volt vizuális koncepció.
- **Mit csináltam?** Üzleti terv tisztázásában vettem részt, képernyőterveket készítettem az üzleti koncepció illusztrálásához.
- **Mi lett az eredmény?** Vizuális koncepció, amely segítette az üzleti döntéshozatalt.

---

## 14. Foglalási rendszer kutatás  `[b4us]`

- **Domain:** SaaS / Foglalási rendszer
- **Címkék:** UX Research

### Megjelenő szövegek

**Rövid leírás** (`excerpt` mező):

> Foglalási rendszer feltáró kutatása, a felhasználói igények és problémák megértésére fókuszálva.

_Az adatban szerepel, de az oldalon **nem jelenik meg**:_

- `summary`: Validálatlan ötlet → kutatás → megalapozott termék
- `scope`: UX research

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** Belső ötletből induló termék, validálásra várt.
- **Mit csináltam?** A kutatási fázisban vettem részt, amely megalapozta a termékfejlesztési irányokat.
- **Mi lett az eredmény?** Validált kutatás, önálló termékké fejlődött.
- **Extra:** Danubius belső termékből indult, majd önálló projekt lett.

---

## 15. Presales UI koncepciók  `[presales]`

- **Domain:** Vegyes (Danubius presales)
- **Címkék:** Presales · UI Design

### Megjelenő szövegek

**Rövid leírás:** _nincs — a modalban jelenleg nem jelenik meg leírás_

_Az adatban szerepel, de az oldalon **nem jelenik meg**:_

- `summary`: Bizonytalan ügyféligény → gyors koncepció → sikeres meggyőzés
- `scope`: UI koncepciók rövid határidővel

### Háttér (nem jelenik meg az oldalon)

- **Mi volt a fő probléma?** Bizonytalan ügyféligény, gyors meggyőzés szükségessége.
- **Mit csináltam?** Zohi, Gilinda, AnTAres (UX auditok), GEROA, TestGroup, MixieQR (presales UI koncepciók) — fájdalompont-feltárás, priorizált javítási tervek, 1 nap alatti UI felülettervek.
- **Mi lett az eredmény?** Sikeres ügyfél-meggyőzés, priorizált fejlesztési javaslatok.
- **Extra:** 6 kisebb megbízás összevonva egy kártyába.

---

# 3. rész — Ismert hiányok

1. **DI InsurTech** és **Presales UI koncepciók**: nincs rövid leírásuk, a modaljuk szinte üres. Háttér a 2. részben van hozzájuk — ezekre is kérek 1–2 mondatos leírást.
2. Az oldal kétnyelvű (HU/EN). Az angol jelenleg szinkronban van a fenti magyar szövegekkel, de a magyar véglegesítése után újra kell fordítani — ezért elég, ha most csak a magyarra adsz javaslatot.
