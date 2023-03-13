import request from "supertest";
import { Connection } from "typeorm";

import { hash } from "bcryptjs";
import { v4 as uuidV4 } from "uuid";

import { app } from "../../../../app";
import createConnection from "../../../../database";

let connection: Connection;

describe("Authenticate user controller", () => {
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

  it("Should be able to authenticate a user", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "admin",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("Should not be able to authenticate with wrong password", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "admin@finapi.com.br",
      password: "wrong-password",
    });

    expect(res.status).toBe(401);
  });

  it("Should not be able to authenticate with wrong email", async () => {
    const res = await request(app).post("/api/v1/sessions").send({
      email: "wrong-email@finapi.com.br",
      password: "admin",
    });

    expect(res.status).toBe(401);
  });
});
