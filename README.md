# Local Labour Observatory — Bergamo

Prototipo della dashboard territoriale, con serie storiche, grafici e documentazione delle fonti. Il progetto è conservato in questo repository privato.

## Esecuzioni automatiche senza API a pagamento

Il workflow `.github/workflows/nightly-agent.yml` esegue **solo controlli** programmati (test della struttura, dei collegamenti e della sintassi JavaScript). Non usa OpenAI API, non richiede chiavi, **non modifica autonomamente il codice** e non apre pull request.

Le esecuzioni avvengono alle 02:15 UTC, soggette alle regole e alle quote GitHub Actions del piano del repository. In Italia l'orario equivale alle 03:15 durante l'ora solare e alle 04:15 durante l'ora legale. GitHub non garantisce che i job programmati partano all'ora esatta.

## Sviluppo

- Applicazione: `app/index.html`
- Test: `npm test` (Node.js 20+)
- Server locale: `npm run serve`
- Obiettivi di miglioramento: `TASKS.md`
- Linee guida: `AGENTS.md`

I controlli automatici **non** sostituiscono collaudi in browser, revisioni metodologiche e verifica delle fonti statistiche.

Per sviluppo iterativo assistito dall'AI senza API a consumo, si può lavorare direttamente in ChatGPT/Codex durante sessioni attive, purché le funzionalità siano comprese nel piano disponibile. Per un agente notturno che modifichi autonomamente il prodotto è necessario predisporre un modello e un ambiente di esecuzione persistente: il presente workflow non realizza quella funzione.
