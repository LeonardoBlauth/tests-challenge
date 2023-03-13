import request from "supertest";
import { Connection } from "typeorm";

import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Get statement operation controller", () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash("admin", 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password, created_at, updated_at)
      values('${id}', 'admin', 'admin@finapi.com.br', '${password}', 'now()', 'now()')`
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("Should be able to list operations of a given statement", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = resToken.body;

    const statement = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    const res = await request(app)
      .get(`/api/v1/statements/${statement.body.id}`)
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(200);
  });

  it("Should not be able to list operations of a given statement of a nonexisting id", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = resToken.body;

    const res = await request(app)
      .get("/api/v1/statements/nonexisting-id")
      .send()
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(404);
  });
});
