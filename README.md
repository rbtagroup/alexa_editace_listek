# ALEXA Nápojový Lístek

Statická editovatelná verze nápojového lístku pro QR kód.

## Úprava položek

Nejjednodušší cesta je otevřít:

```text
napojovy-listek/editor.html
```

V editoru lze:

- upravovat názvy, objemy a ceny,
- přidávat a mazat položky,
- přidávat a mazat sekce,
- přidávat hlavní záložky,
- zapínat a vypínat zveřejnění hlavních záložek,
- upravit kontakt, měnu a datum aktualizace,
- kontrolovat změny v živém náhledu přímo na stránce editoru.

Editor změny průběžně ukládá do prohlížeče a dole zobrazuje pracovní náhled. Pokud se po otevření nezobrazí žádné položky, klikněte na `Načíst aktuální menu`; tím se zahodí špatná pracovní kopie v prohlížeči a znovu se načte `menu-data.js`. Po dokončení klikněte na `Stáhnout menu-data.js` a staženým souborem nahraďte původní `napojovy-listek/menu-data.js`.

Pozor: běžný GitHub Pages web neumí přímo zapisovat změny z prohlížeče do repozitáře. Dokud stažený `menu-data.js` nenahrajete zpět na GitHub, veřejný QR lístek se nezmění. Pracovní náhled v editoru slouží jen ke kontrole před nasazením.

Alternativně lze všechny názvy, objemy a ceny upravit ručně přímo v souboru `menu-data.js`.

Po změně stačí soubory nahrát na GitHub. Stránka nepotřebuje build krok ani instalaci závislostí.

## URL pro QR

Při GitHub Pages nasazení z kořene repozitáře může QR mířit na:

```text
https://<uzivatel>.github.io/<repo>/napojovy-listek/
```

Při vlastním doménovém nasazení typicky:

```text
https://clubalexa.cz/napojovy-listek/
```

## Poznámka k přepisu

Původní ZIP obsahoval SVG stránky s textem převedeným do křivek, takže položky nejsou strojově editovatelné přímo v SVG. Tato webová verze převádí obsah do skutečného HTML textu a datového souboru.
