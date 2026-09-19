const request = require("supertest");
const sinon = require("sinon");

const app = require("../src/app");
const db = require("../src/db");

describe("Intervals API con Sinon", () => {
  afterEach(() => {
    sinon.restore();
  });

  test("GET /api/intervals deve restituire gli intervalli mockati", async () => {
    const fakeIntervals = [
      {
        id: 1,
        user_id: 1,
        start_date: "2026-09-01",
        end_date: "2026-09-30",
        first_name: "Mario",
        last_name: "Rossi",
        email: "mario@test.it"
      }
    ];

    const executeStub = sinon.stub(db, "execute");

    executeStub.onFirstCall().resolves([fakeIntervals]);
    executeStub.onSecondCall().resolves([[]]);

    const response = await request(app).get("/api/intervals");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      {
        ...fakeIntervals[0],
        goals: []
      }
    ]);

    expect(executeStub.calledTwice).toBe(true);
  });

  test("GET /api/intervals/:id deve restituire un intervallo con i suoi obiettivi", async () => {
    const fakeInterval = {
      id: 1,
      user_id: 1,
      start_date: "2026-09-01",
      end_date: "2026-09-30",
      email: "mario@test.it",
      first_name: "Mario",
      last_name: "Rossi"
    };

    const fakeGoals = [
      {
        id: 2,
        title: "Meditare",
        description: "Meditare ogni giorno",
        coins_reward: 5,
        completed: 0,
        completed_at: null
      }
    ];

    const executeStub = sinon.stub(db, "execute");

    executeStub.onFirstCall().resolves([[fakeInterval]]);
    executeStub.onSecondCall().resolves([fakeGoals]);

    const response = await request(app).get("/api/intervals/1");

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(1);
    expect(response.body.goals).toEqual(fakeGoals);
    expect(executeStub.calledTwice).toBe(true);
  });

  test("GET /api/intervals/:id deve restituire 404 se l'intervallo non esiste", async () => {
    sinon.stub(db, "execute").resolves([[]]);

    const response = await request(app).get("/api/intervals/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Intervallo non trovato"
    });
  });

  test("POST /api/intervals deve restituire 400 con dati mancanti", async () => {
    const executeStub = sinon.stub(db, "execute");

    const response = await request(app)
      .post("/api/intervals")
      .send({});

    expect(response.status).toBe(400);
    expect(executeStub.called).toBe(false);
  });

  test("POST /api/intervals deve restituire 400 se la data di fine precede quella di inizio", async () => {
    const executeStub = sinon.stub(db, "execute");

    const response = await request(app)
      .post("/api/intervals")
      .send({
        user_id: 1,
        start_date: "2026-09-30",
        end_date: "2026-09-01"
      });

    expect(response.status).toBe(400);
    expect(executeStub.called).toBe(false);
  });

  test("POST /api/intervals deve creare un intervallo", async () => {
    const executeStub = sinon.stub(db, "execute");

    executeStub.onFirstCall().resolves([[{ id: 1 }]]);
    executeStub.onSecondCall().resolves([
      {
        insertId: 10,
        affectedRows: 1
      }
    ]);

    const response = await request(app)
      .post("/api/intervals")
      .send({
        user_id: 1,
        start_date: "2026-09-01",
        end_date: "2026-09-30"
      });

    expect(response.status).toBe(201);

    expect(response.body).toEqual({
      id: 10,
      user_id: 1,
      start_date: "2026-09-01",
      end_date: "2026-09-30"
    });

    expect(executeStub.calledTwice).toBe(true);

    expect(executeStub.secondCall.args[1]).toEqual([
      1,
      "2026-09-01",
      "2026-09-30"
    ]);
  });

  test("POST /api/intervals deve restituire 404 se l'utente non esiste", async () => {
    sinon.stub(db, "execute").resolves([[]]);

    const response = await request(app)
      .post("/api/intervals")
      .send({
        user_id: 999,
        start_date: "2026-09-01",
        end_date: "2026-09-30"
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Utente non trovato"
    });
  });

  test("PUT /api/intervals/:id deve modificare un intervallo", async () => {
    const executeStub = sinon.stub(db, "execute");

    executeStub.onFirstCall().resolves([[{ id: 1 }]]);
    executeStub.onSecondCall().resolves([
      {
        affectedRows: 1
      }
    ]);

    const response = await request(app)
      .put("/api/intervals/1")
      .send({
        user_id: 1,
        start_date: "2026-10-01",
        end_date: "2026-10-31"
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      message: "Intervallo aggiornato"
    });

    expect(executeStub.calledTwice).toBe(true);

    expect(executeStub.secondCall.args[1]).toEqual([
      1,
      "2026-10-01",
      "2026-10-31",
      "1"
    ]);
  });

  test("PUT /api/intervals/:id deve restituire 404 se l'utente non esiste", async () => {
    sinon.stub(db, "execute").resolves([[]]);

    const response = await request(app)
      .put("/api/intervals/1")
      .send({
        user_id: 999,
        start_date: "2026-10-01",
        end_date: "2026-10-31"
      });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Utente non trovato"
    });
  });

  test("DELETE /api/intervals/:id deve eliminare un intervallo", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        affectedRows: 1
      }
    ]);

    const response = await request(app)
      .delete("/api/intervals/1");

    expect(response.status).toBe(204);
    expect(executeStub.calledOnce).toBe(true);
    expect(executeStub.firstCall.args[1]).toEqual(["1"]);
  });

  test("DELETE /api/intervals/:id deve restituire 404 se l'intervallo non esiste", async () => {
    sinon.stub(db, "execute").resolves([
      {
        affectedRows: 0
      }
    ]);

    const response = await request(app)
      .delete("/api/intervals/999");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: "Intervallo non trovato"
    });
  });

  test("GET /api/intervals deve filtrare per goalId", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([[]]);

    const response = await request(app)
      .get("/api/intervals")
      .query({
        goalId: 2
      });

    expect(response.status).toBe(200);
    expect(executeStub.calledOnce).toBe(true);

    const [sql, params] = executeStub.firstCall.args;

    expect(sql).toContain("ig.goal_id = ?");
    expect(params).toContain("2");
  });

  test("GET /api/intervals deve filtrare per data di inizio", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([[]]);

    const response = await request(app)
      .get("/api/intervals")
      .query({
        startDate: "2026-09-01"
      });

    expect(response.status).toBe(200);
    expect(executeStub.calledOnce).toBe(true);

    const [sql, params] = executeStub.firstCall.args;

    expect(sql).toContain("gi.start_date >= ?");
    expect(params).toContain("2026-09-01");
  });

  test("GET /api/intervals deve filtrare per data di fine", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([[]]);

    const response = await request(app)
      .get("/api/intervals")
      .query({
        endDate: "2026-09-30"
      });

    expect(response.status).toBe(200);
    expect(executeStub.calledOnce).toBe(true);

    const [sql, params] = executeStub.firstCall.args;

    expect(sql).toContain("gi.end_date <= ?");
    expect(params).toContain("2026-09-30");
  });

  test("POST /api/intervals/:id/goals deve associare un obiettivo a un intervallo", async () => {
    const executeStub = sinon.stub(db, "execute");

    executeStub.onCall(0).resolves([[{ id: 1 }]]);
    executeStub.onCall(1).resolves([[{ id: 2 }]]);
    executeStub.onCall(2).resolves([[]]);
    executeStub.onCall(3).resolves([
      {
        affectedRows: 1,
        insertId: 1
      }
    ]);

    const response = await request(app)
      .post("/api/intervals/1/goals")
      .send({
        goal_id: 2
      });

    expect(response.status).toBe(201);
    expect(executeStub.callCount).toBe(4);

    const [sql, params] = executeStub.getCall(3).args;

    expect(sql).toContain("INSERT INTO interval_goals");
    expect(params).toEqual(["1", 2]);
  });

  test("POST /api/intervals/:id/goals deve impedire una doppia associazione", async () => {
    const executeStub = sinon.stub(db, "execute");

    executeStub.onCall(0).resolves([[{ id: 1 }]]);
    executeStub.onCall(1).resolves([[{ id: 2 }]]);
    executeStub.onCall(2).resolves([
      [
        {
          interval_id: 1
        }
      ]
    ]);

    const response = await request(app)
      .post("/api/intervals/1/goals")
      .send({
        goal_id: 2
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "Obiettivo già associato all'intervallo"
    });

    expect(executeStub.callCount).toBe(3);
  });

  test("DELETE /api/intervals/:id/goals/:goalId deve eliminare l'associazione", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        affectedRows: 1
      }
    ]);

    const response = await request(app)
      .delete("/api/intervals/1/goals/2");

    expect(response.status).toBe(204);
    expect(executeStub.calledOnce).toBe(true);
    expect(executeStub.firstCall.args[1]).toEqual(["1", "2"]);
  });

  test("GET /api/intervals deve gestire un errore del database", async () => {
    sinon.stub(db, "execute").rejects(
      new Error("Errore MySQL")
    );

    const response = await request(app).get("/api/intervals");

    expect(response.status).toBe(500);
  });
});