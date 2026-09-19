const request = require("supertest");
const sinon = require("sinon");

const app = require("../src/app");
const db = require("../src/db");

describe("Users API con Sinon", () => {
  afterEach(() => {
    sinon.restore();
  });

  test("GET /api/users deve restituire utenti mockati", async () => {
    const fakeUsers = [
      {
        id: 1,
        email: "simone@email.it",
        first_name: "Simone",
        last_name: "Giannecchini"
      }
    ];

    const executeStub = sinon.stub(db, "execute").resolves([fakeUsers]);

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeUsers);
    expect(executeStub.calledOnce).toBe(true);
  });

  test("GET /api/users/:id deve restituire un utente", async () => {
    const fakeUser = {
      id: 1,
      email: "simone@email.it",
      first_name: "Simone",
      last_name: "Giannecchini"
    };

    const executeStub = sinon.stub(db, "execute").resolves([[fakeUser]]);

    const response = await request(app).get("/api/users/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(fakeUser);
    expect(executeStub.calledOnce).toBe(true);
    expect(executeStub.firstCall.args[1]).toEqual(["1"]);
  });

  test("GET /api/users/:id deve restituire 404 se l'utente non esiste", async () => {
    sinon.stub(db, "execute").resolves([[]]);

    const response = await request(app).get("/api/users/999");

    expect(response.status).toBe(404);
  });

  test("POST /api/users deve creare un utente", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        insertId: 1
      }
    ]);

    const response = await request(app)
      .post("/api/users")
      .send({
        email: "simone@email.it",
        first_name: "Simone",
        last_name: "Giannecchini"
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBe(1);
    expect(response.body.email).toBe("simone@email.it");
    expect(executeStub.calledOnce).toBe(true);
  });

  test("POST /api/users deve restituire 400 con dati mancanti", async () => {
    const executeStub = sinon.stub(db, "execute");

    const response = await request(app)
      .post("/api/users")
      .send({});

    expect(response.status).toBe(400);
    expect(executeStub.called).toBe(false);
  });

  test("PUT /api/users/:id deve modificare un utente", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        affectedRows: 1
      }
    ]);

    const response = await request(app)
      .put("/api/users/1")
      .send({
        email: "nuova@email.it",
        first_name: "Simone",
        last_name: "Giannecchini"
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Utente aggiornato");
    expect(executeStub.calledOnce).toBe(true);
  });

  test("PUT /api/users/:id deve restituire 404 se l'utente non esiste", async () => {
    sinon.stub(db, "execute").resolves([
      {
        affectedRows: 0
      }
    ]);

    const response = await request(app)
      .put("/api/users/999")
      .send({
        email: "test@email.it",
        first_name: "Test",
        last_name: "Utente"
      });

    expect(response.status).toBe(404);
  });

  test("DELETE /api/users/:id deve eliminare un utente", async () => {
    const executeStub = sinon.stub(db, "execute").resolves([
      {
        affectedRows: 1
      }
    ]);

    const response = await request(app).delete("/api/users/1");

    expect(response.status).toBe(204);
    expect(executeStub.calledOnce).toBe(true);
  });

  test("DELETE /api/users/:id deve restituire 404 se l'utente non esiste", async () => {
    sinon.stub(db, "execute").resolves([
      {
        affectedRows: 0
      }
    ]);

    const response = await request(app).delete("/api/users/999");

    expect(response.status).toBe(404);
  });

  test("GET /api/users deve gestire un errore del database", async () => {
    sinon.stub(db, "execute").rejects(new Error("Errore MySQL"));

    const response = await request(app).get("/api/users");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: "Errore interno del server"
    });
  });
});