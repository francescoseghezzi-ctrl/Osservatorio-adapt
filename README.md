# Local Labour Observatory — Bergamo

Prototipo della dashboard territoriale, con serie storiche, grafici e documentazione delle fonti. Il progetto è conservato in questo repository privato.

## Esecuzioni automatiche senza API a pagamento

Il workflow `.github/workflows/nightly-agent.yml` esegue **solo controlli** programmati (test della struttura, dei collegamenti e della sintassi JavaScript). Non usa OpenAI API, non richiede chiavi, **non modifica autonomamente il codice** e non apre pull request.

Le esecuzioni avvengono alle 02:15 UTC, soggette alle regole e alle quote GitHub Actions del piano del repository. In Italia l'orario equivale alle 03:15 durante l'ora solare e alle 04:15 durante l'ora legale. GitHub non garantisce che i job programmati partano all'ora esatta.

## Dati e provenienza

Le serie annuali di Bergamo sono conservate in `data/bergamo-annual.json`; definizioni, unità di misura, classi di età, frequenza e stato di verifica delle fonti sono in `data/catalog.json`. **I dati sono stati trasferiti dalla versione precedente e non sono ancora stati verificati individualmente contro le pubblicazioni primarie.** Il catalogo li contrassegna `source_pending`; non considerarli validati soltanto perché superano i test tecnici.

`app/data/bergamo-series.js` è generato dai due file sorgenti e letto da entrambe le visualizzazioni della dashboard. Modificare solo i file in `data/`, poi eseguire `npm run build:data` e `npm test`. `npm run check:data` verifica che il file generato non sia rimasto indietro. **Non inserire serie nuove senza fonte, definizione e periodo verificabili.**

## Flussi e previsioni: due basi distinte

- `data/cob-annual.json`: 2019–2024, assunzioni, cessazioni, saldi amministrativi nel lavoro dipendente privato extra-agricolo in provincia di Bergamo. Fonte: [Provincia di Bergamo, Rapporto annuale 2024, p. 12](https://www.provincia.bergamo.it/cnvpbgrm/po/attachment_news.php?id=2647). Non sono stock ISTAT.
- `data/excelsior-monthly.json`: 42 osservazioni mensili gennaio 2022–giugno 2025, entrate previste dalle imprese e quota di difficile reperimento. Fonte: [Provincia di Bergamo, Rapporto I trimestre 2025, p. 37](https://www.provincia.bergamo.it/po/attachment_news.php?id=2785). **Entrate previste, non assunzioni effettive**. Ci fermiamo a giugno 2025 per evitare un confronto diretto con i mesi da luglio, quando Excelsior ha ampliato il campo di osservazione al settore primario.
- `app/data/flows-series.js` è generato automaticamente dai due archivi, per la sezione `#flows`. Non modificarlo a mano.

## Demografia 2019–2025

- `data/demography-annual.json`: popolazione residente all'1 gennaio per le classi 0–14, 15–64 e 65+, totale, età media, indice di vecchiaia, indice di dipendenza strutturale e indice di ricambio della popolazione attiva. Fonte: [ISTAT tramite Tuttitalia, serie storiche e indici demografici della provincia di Bergamo](https://www.tuttitalia.it/lombardia/provincia-di-bergamo/statistiche/indici-demografici-struttura-popolazione/). I dati non descrivono gli occupati né i pensionamenti effettivi.
- `app/data/demography-series.js`: esportazione generata automaticamente dal file sorgente, utilizzata nella dashboard per il selettore di serie demografiche.

## Ricambio generazionale · analisi descrittiva

La sezione `#renewal` accosta, per anno 2019–2025, alcune serie di popolazione residente al 1° gennaio (da `data/demography-annual.json`) e i tassi annuali del mercato del lavoro (da `data/bergamo-annual.json`). Consente la scelta di due indicatori e del periodo, visualizza **due assi/grafici separati con unità proprie**, calcola differenze assolute e punti percentuali ed esporta una tabella CSV con note sulle fonti. **Non** stima pensionamenti, domanda futura di sostituzione né causalità fra andamenti. La fonte e la revisione delle serie del lavoro restano `source_pending` nel catalogo.

## Composizione per età degli occupati: Censimento 2018 e 2023

- `data/employed-age-census.json`: occupati residenti per età 15–24, 25–49, 50–64 e 65+ nel 2018 e nel 2023. Fonte: [Provincia di Bergamo, *Scenari demografici e mercato del lavoro*, allegato al Rapporto II trimestre 2025, p. 9](https://www.provincia.bergamo.it/cnvpbgrm/po/attachment_news.php?id=2960), su Censimento permanente ISTAT.
- **Due osservazioni, non sette**: non interpolare gli anni mancanti. I totali 2018 differiscono di una unità dalla somma delle classi pubblicate; si conserva il totale originale.
- `app/data/employed-age-census.js` è generato da `npm run build:data`; `app/workforce-age.js` visualizza il confronto nel modulo `#renewal`.
- Le età degli occupati residenti non sono utilizzabili da sole per stimare pensionamenti o fabbisogni professionali; mancano serie per settore e professione sullo stesso perimetro.

## Lavoratori INPS per eta e settore (due universi separati)

- `data/inps-age-monthly-mean.json`: lavoratori dipendenti privati extra-agricoli per classe di eta, media annua dei lavoratori nel mese, **2018 e 2023**, per luogo di lavoro nella provincia di Bergamo. Fonte: [Provincia di Bergamo, rapporto II trimestre 2025, tabelle INPS](https://www.provincia.bergamo.it/cnvpbgrm/po/attachment_news.php?id=2958).
- `data/inps-sector-annual.json`: selezione di dieci sezioni ATECO con lavoratori dipendenti **nell'anno**, **2019 e 2023**. Fonte: [Provincia di Bergamo, tavole allegate al rapporto annuale 2024](https://www.provincia.bergamo.it/po/attachment_news.php?id=2648). La selezione non equivale al totale.
- Le due distribuzioni **non** sono una matrice eta per settore, non coincidono per perimetro temporale/indicatore e non sono confrontabili con il Censimento degli occupati residenti. Nessuna stima di pensionamenti o di fabbisogni settoriali e derivabile da questi dati aggregati.
- `data/inps-sector-qualifications.json`: sezione ATECO × qualifica contrattuale (**operai, impiegati, quadri**) per 2019 e 2023, tratto dalle tavole INPS del rapporto provinciale. Le qualifiche non sono classificazioni di professioni e non esauriscono i lavoratori dei rispettivi settori.
- `app/data/inps-distributions.js` viene generato tramite `npm run build:data`; i grafici e le tabelle nel modulo ricambio sono realizzati da `app/inps-explorer.js`.

## Confronto tra le province lombarde · 2025

La sezione `#lombardy` confronta **tutte le 12 province lombarde** su dieci indicatori ISTAT omogenei per anno: tassi di occupazione totale, femminile e maschile (15–64), disoccupazione (15–74), attività e inattività (15–64), occupati (15–89), disoccupati e forze di lavoro (15+), inattivi (15–64). Gli ultimi quattro indicatori sono stock espressi in migliaia di persone; **non sono graduatorie di performance**.

Il dato canonico e in `data/lombardy-provinces-2025.json` e il payload del browser in `app/data/lombardy-2025.js`, generato mediante `npm run build:data`. L'interfaccia `app/lombardy.js` include ordinamento, evidenziazione di una provincia, benchmark regionale, tabella e CSV. Le fonti del dataset sono [Provincia di Brescia, Rapporto 2025, pp. 48–53](https://lavoro.provincia.brescia.it/export/sites/default/.galleries/documenti/osservatorio/Report-2025.pdf) e [Camera di commercio di Varese / OsserVa, occupazione per genere, pubblicato 13 marzo 2026](https://www.osserva-varese.it/istat-occupazione/), basate sulla Rilevazione ISTAT sulle forze di lavoro. Le consistenze in migliaia e i tassi hanno arrotondamenti differenti.

**Limitazione:** il confronto è un quadro trasversale 2025, non una serie storica comparativa; non include ancora retribuzioni, competenze, flussi COB comparabili o demografia per tutte le province. La copertura e la qualità delle fonti vanno riesaminate a ogni aggiornamento.

## Mappa provinciale interattiva della Lombardia

La vista `#lombardy` include una coropleta SVG delle **12 province lombarde**, con confini territoriali reali derivati dal dataset geografico [guglielmo/geojson-italy, limiti delle province](https://github.com/guglielmo/geojson-italy/blob/main/topojson/limits_IT_provinces.topo.json) (redistribuzione di confini ISTAT). I poligoni sono incorporati in `app/data/lombardy-boundaries.js`, senza servizi esterni, API a pagamento o richieste di rete da browser.

`app/lombardy-map.js` gestisce colore per indicatore, tooltip con nome, valore, posizione e scarto regionale, selezione al click o da tastiera, dettaglio provinciale e sincronizzazione con ordinamento e tabella. La mappa usa lo stesso dataset 2025 della tabella (`data/lombardy-provinces-2025.json`): nessun nuovo valore statistico è interpolato. Per i valori assoluti l'ordinamento per dimensione **non** va interpretato come graduatoria di qualità del mercato del lavoro.

Nota geografica: la data di versione esatta della geometria upstream non è attestata nel file estratto; verificare l'eventuale aggiornamento prima della pubblicazione definitiva.

## Sviluppo

- Applicazione: `app/index.html`
- Test: `npm test` (Node.js 20+)
- Server locale: `npm run serve`
- Obiettivi di miglioramento: `TASKS.md`
- Linee guida: `AGENTS.md`

I controlli automatici **non** sostituiscono collaudi in browser, revisioni metodologiche e verifica delle fonti statistiche.

Per sviluppo iterativo assistito dall'AI senza API a consumo, si può lavorare direttamente in ChatGPT/Codex durante sessioni attive, purché le funzionalità siano comprese nel piano disponibile. Per un agente notturno che modifichi autonomamente il prodotto è necessario predisporre un modello e un ambiente di esecuzione persistente: il presente workflow non realizza quella funzione.
