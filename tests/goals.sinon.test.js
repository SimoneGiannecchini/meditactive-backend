const request = require("supertest");
const sinon = require("sinon");

const app = require("../src/app");
const db = require("../src/db");

describe("Goals API con Sinon", () => {
  afterEach(() => {
    sinon.restore();
  });

  test("GET /api/goals deve restituire gli obiettivi mockati", async () => {
    const fakeGoals = [
      {
        id: 1,
        title: "Fare attività fisica",
        description: "Allenarsi tre volte a settimana",
        coins_reward: 10
      },
      {
        id: 2,
        title: "Meditare",
        description: "Meditare ogni giorno",
        coins_reward: 5
      }
    ];

    const executeStub = sinon.stub(db, "execute").resolves([fakeGoals]);

    const response = await request(app).get("/api/goals");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeGoals);
    expect(executeStub.calledOnce).toBe(true);
  });

  test("POST /api/goals deve restituire 400 con titolo mancante", async () => {
    const executeStub = sinon.stub(db, "execute");

    const response = await request(app)
      .post("/api/goals")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: "Titolo obbligatorio"
    });
    expect(executeStub.called).toBe(false);
  });

  test("POST /api/goals deve creare un obiettivo", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        insertId: 1,
        affectedRows: 1
      }
    ]);

    const newGoal = {
      title: "Bere acqua",
      description: "Bere almeno due litri di acqua",
      coins_reward: 5
    };

    const response = await request(app)
      .post("/api/goals")
      .send(newGoal);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1,
      title: "Bere acqua",
      description: "Bere almeno due litri di acqua",
      coins_reward: 5
    });

    expect(executeStub.calledOnce).toBe(true);

    expect(executeStub.firstCall.args[1]).toEqual([
      "Bere acqua",
      "Bere almeno due litri di acqua",
      5
    ]);
  });

  test("PUT /api/goals/:id deve modificare un obiettivo", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        affectedRows: 1
      }
    ]);

    const response = await request(app)
      .put("/api/goals/1")
      .send({
        title: "Meditare",
        description: "Meditare venti minuti",
        coins_reward: 10
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Obiettivo aggiornato"
    });

    expect(executeStub.calledOnce).toBe(true);

    expect(executeStub.firstCall.args[1]).toEqual([
      "Meditare",
      "Meditare venti minuti",
      10,
      "1"
    ]);
  });

  test("PUT /api/goals/:id deve restituire 400 con titolo mancante", async () => {
    const executeStub = sinon.stub(db, "execute");

    const response = await request(app)
      .put("/api/goals/1")
      .send({
        description: "Descrizione senza titolo",
        coins_reward: 5
      });

    expect(response.status).toBe(400);
    expect(executeStub.called).toBe(false);
  });

  test("PUT /api/goals/:id deve restituire 404 se l'obiettivo non esiste", async () => {
    sinon.stub(db, "execute").resolves([
      {
        affectedRows: 0
      }
    ]);

    const response = await request(app)
      .put("/api/goals/999")
      .send({
        title: "Obiettivo inesistente",
        description: "Test",
        coins_reward: 5
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Obiettivo non trovato"
    });
  });

  test("DELETE /api/goals/:id deve eliminare un obiettivo", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        affectedRows: 1
      }
    ]);

    const response = await request(app)
      .delete("/api/goals/1");

    expect(response.status).toBe(204);
    expect(executeStub.calledOnce).toBe(true);
    expect(executeStub.firstCall.args[1]).toEqual(["1"]);
  });

  test("DELETE /api/goals/:id deve restituire 404 se l'obiettivo non esiste", async () => {
    sinon.stub(db, "execute").resolves([
      {
        affectedRows: 0
      }
    ]);

    const response = await request(app)
      .delete("/api/goals/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Obiettivo non trovato"
    });
  });

  test("GET /api/goals deve gestire un errore del database", async () => {
    sinon.stub(db, "execute").rejects(
      new Error("Errore MySQL")
    );

    const response = await request(app).get("/api/goals");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Errore interno del server"
    });
  });
});