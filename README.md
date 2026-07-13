# Malá farma u Soběslavi — web

Statický web (HTML + CSS + trocha JavaScriptu). Bez databáze, bez CMS, bez backendu.
Stačí nahrát obsah složky na hosting a web funguje.

## Struktura

```
web/
├─ index.html                 Hlavní strana (rozcestník na 6 podstránek)
├─ o-farme.html               O farmě
├─ trekking-s-alpakami.html   Trekking s alpakami
├─ jizda-na-ponikovi.html     Jízda na poníkovi
├─ navstevy-kuniterapie.html  Návštěvy a kuniterapie
├─ alpaci-vlna.html           Alpačí vlna (+ FAQ)
├─ galerie.html               Galerie s prokliknutím fotek
├─ styles.css                 Sdílený vzhled všech stránek
├─ script.js                  Mobilní menu, galerie (lightbox), odeslání formuláře
├─ robots.txt                 Pro vyhledávače
├─ sitemap.xml                Mapa webu
└─ images/                    Všechny fotografie
```

## Jak web nahrát na hosting

1. Otevřete správce souborů u svého hostingu (FTP / File Manager).
2. Nahrajte **celý obsah složky `web/`** do kořenové složky webu
   (obvykle `public_html`, `www` nebo `httpdocs`).
3. Hotovo — web běží na vaší doméně. `index.html` se načte automaticky.

> Tip: nenahrávejte složku `web` jako celek, ale její **obsah**, aby
> `index.html` ležel přímo v kořeni (jinak by web byl na adrese `.../web/`).

## Úpravy obsahu

- **Texty** upravíte přímo v příslušném `.html` souboru (běžný text mezi značkami).
- **Fotky** vyměníte nahrazením souboru ve složce `images/` (ponechte stejný název),
  nebo přidáte nový soubor a upravíte `src="images/..."` v HTML.
- **Barvy a písmo** jsou centralizované na začátku `styles.css` (sekce `:root`).
- **Telefon / e-mail** změníte hromadně hledáním `+420 723 177 902` a `info@malafarma.cz`.
- **Mapa** — v sekci Kontakt upravte adresu v `src` u `<iframe>`.

## Kontaktní formulář

Formulář nepotřebuje server — po odeslání otevře e-mailového klienta návštěvníka
s předvyplněnou zprávou na `info@malafarma.cz`. Chcete-li odesílání na server
(bez otevírání e-mailu), lze později napojit službu jako Formspree.

## SEO

- Každá stránka má vlastní `<title>`, popis, Open Graph a kanonickou adresu.
- Před spuštěním nahraďte `https://www.malafarma.cz/` svou skutečnou doménou
  v souborech `robots.txt`, `sitemap.xml` a v `<link rel="canonical">` / OG metech.

## Barevná paleta

- Zelená (primární): `#18555C`
- Tmavá zelená: `#123F45`
- Krémová (pozadí): `#FFFAE9`
- Zlatá (akcent): `#E5C96C` / `#CEBB6A`
- Text: `#626C6D`

Písmo: **Anek Bangla** (nadpisy i text), fallback Baloo 2.
