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
- upravit kontakt, měnu a datum aktualizace.

Editor změny průběžně ukládá do prohlížeče. Po dokončení klikněte na `Stáhnout menu-data.js` a staženým souborem nahraďte původní `napojovy-listek/menu-data.js`.

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
