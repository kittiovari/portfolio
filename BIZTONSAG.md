# Védett területek – működés és üzemeltetés

## Hogyan működik

- A három területi oldal (Nyelvoktatás, Antalfai művészetterápia, UX/UI design) tartalma **nincs benne a letölthető kódban**.
- A védett szövegek és képek a `protected/` mappában vannak, **AES-256-GCM-mel titkosítva**. A repóba csak ez kerül. Kulcs nélkül olvashatatlan, és ha valaki módosítja, a szerver elutasítja.
- A jelszót a szerver ellenőrzi (`netlify/functions/unlock.mjs`). A jelszavak csak **scrypt-hash**ként léteznek, a Netlify környezeti változóiban.
- Helyes jelszó után a böngésző egy aláírt, 7 napig érvényes sütit kap: `HttpOnly`, `Secure`, `SameSite=Strict`, és csak az `/api` útvonalra szól. A tartalmat (`/api/content/:terület`) és a képeket (`/api/asset/:terület/:fájl`) a szerver csak ezzel a sütivel adja ki.
- Próbálkozáskorlát: 5 rossz jelszó után 15 perc tiltás (IP-címenként és területenként). Az IP-cím csak sózott hash-ként tárolódik, Netlify Blobsban.

## Titkok (soha ne kerüljenek a repóba)

| Változó | Mire való |
|---|---|
| `SESSION_SECRET` | a sütik aláírása |
| `CONTENT_KEY` | a `protected/` fájlok titkosítása (32 bájt, base64) |
| `PASS_HASH_LANGUAGE` | Nyelvoktatás jelszó-hash |
| `PASS_HASH_ARTTHERAPY` | Antalfai művészetterápia jelszó-hash |
| `PASS_HASH_UX` | UX/UI design jelszó-hash |

- Helyben a `.env` fájlban vannak (gitignore-olt).
- Élesben: Netlify → Site configuration → Environment variables, **ugyanezekkel az értékekkel**. A „Secret” jelölőt kapcsold be.
- Ha bármelyik hiányzik, a terület zárva marad (biztonságos alapállapot).

## Teendők

**Tartalom szerkesztése**

1. A nyers forrás a `content-src/<terület>/content.json` fájlban és az `assets/` mappában van. Ez gitignore-olt, **csak a te gépeden létezik**, ezért legyen róla biztonsági mentésed.
2. Szerkesztés után futtasd: `npm run seal`. Ez újratitkosítja a fájlokat a `protected/` mappába.
3. Commit + push.

**Jelszócsere**

- `npm run jelszo -- language` (vagy `arttherapy` / `ux`): rejtetten bekéri az új jelszót, és a hash-t beírja a `.env`-be.
- Ugyanezt az értéket másold be a Netlify-on is, majd indíts egy új deployt.
- Javasolt jelszó: 4 véletlen szó + szám, legalább 12 karakter.

**Minden látogató kiléptetése**

- Cseréld le a `SESSION_SECRET`-et (helyben és a Netlify-on). Az összes korábbi süti érvénytelen lesz.

**A `CONTENT_KEY` cseréje**

- Új kulcs a `.env`-be, utána `npm run seal`, majd a Netlify-on is frissíteni kell.

## Fontos tudnivalók

- **Ami már egyszer nyilvános volt, az nyilvános marad.** A régi UX-szövegek és ügyfélképek a git-történetben és a Netlify régi deployjaiban továbbra is elérhetők. Javaslat: a régi deployok törlése, vagy a repó privátra állítása.
- **A `/cv` oldal és a CV-PDF szándékosan nyilvános.** Ezek is felsorolnak projektneveket.
- **Diákadatok csak a 2–3. fázisban, Supabase-szel kerülhetnek ide**: egyéni hozzáféréssel, álnevekkel és az iskola jóváhagyásával. A `protected/` mappába ne tegyél személyes adatot.
