# 🌿 MeditActive Backend

Backend REST API del progetto **MeditActive**, sviluppato con **Node.js, Express e MySQL**.

MeditActive è un'applicazione pensata per gestire utenti, obiettivi personali e percorsi temporali, con un sistema di ricompense tramite **coins**.

## 🚀 Tecnologie utilizzate

- Node.js
- Express
- MySQL
- mysql2
- dotenv
- CORS
- Jest
- Sinon
- Supertest
- Nodemon

## 📁 Struttura del progetto

```text
backend/
│
├── src/
│   ├── routes/
│   │   ├── users.routes.js
│   │   ├── goals.routes.js
│   │   └── intervals.routes.js
│   │
│   ├── app.js
│   ├── db.js
│   └── server.js
│
├── tests/
│   ├── users.sinon.test.js
│   ├── goals.sinon.test.js
│   └── intervals.sinon.test.js
│
├── .env.example
├── .gitignore
├── migrations.sql
├── package.json
└── README.md
```

## ⚙️ Installazione

Clona il repository e installa le dipendenze:

```bash
npm install
```

Crea un file `.env` partendo da `.env.example`:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=meditactive
PORT=3000
```


## 🗄️ Database

Il progetto utilizza **MySQL**.

Per creare il database e le relative tabelle è disponibile il file:

```text
migrations.sql
```

Il database contiene le tabelle:

- `users`
- `goals`
- `goal_intervals`
- `interval_goals`

## ▶️ Avvio del server

Modalità sviluppo:

```bash
npm run dev
```

Modalità normale:

```bash
npm start
```

Il server sarà disponibile su:

```text
http://localhost:3000
```

## 🔌 API principali

### Users

```text
GET    /api/users
GET    /api/users/:id
POST   /api/users
PUT    /api/users/:id
DELETE /api/users/:id
```

### Goals

```text
GET    /api/goals
POST   /api/goals
PUT    /api/goals/:id
DELETE /api/goals/:id
```

### Intervals

```text
GET    /api/intervals
GET    /api/intervals/:id
POST   /api/intervals
PUT    /api/intervals/:id
DELETE /api/intervals/:id
```

È inoltre possibile associare obiettivi agli intervalli e segnare un obiettivo come completato.

Il completamento di un obiettivo assegna automaticamente all'utente le **coins** previste dalla ricompensa.

## 🧪 Test

I test sono realizzati con:

- Jest
- Sinon
- Supertest

Per eseguirli:

```bash
npm test
```

Stato attuale:

```text
Test Suites: 3 passed
Tests:       37 passed
```

✅ Tutti i test sono superati.

## 🔐 Sicurezza

Il file `.env` contenente la configurazione locale del database è escluso dal repository tramite `.gitignore`.

Nel repository viene invece fornito `.env.example` come modello di configurazione.

## 👨‍💻 Autore

**Simone Giannecchini**

Progetto sviluppato come parte del percorso di formazione Full Stack Development.