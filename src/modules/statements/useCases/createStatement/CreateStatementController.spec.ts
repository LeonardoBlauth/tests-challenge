import request from "supertest";
import { Connection } from "typeorm";

import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Create statement controller", () => {
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

  it("Should be able to create statement of a deposit", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = resToken.body;

    const res = await request(app)
      .post("/api/v1/statements/deposit")
      .send({
        amount: 100,
        description: "deposit",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.amount).toBe(100);
  });

  it("Should be able to create statement of an withdraw", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = resToken.body;

    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.amount).toBe(0);
  });

  it("Should not be able to create statement of withdraw without funds", async () => {
    const resToken = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    const { token } = resToken.body;

    const res = await request(app)
      .post("/api/v1/statements/withdraw")
      .send({
        amount: 100,
        description: "withdraw",
      })
      .set({
        Authorization: `Bearer ${token}`,
      });

    expect(res.status).toBe(400);
  });
});
