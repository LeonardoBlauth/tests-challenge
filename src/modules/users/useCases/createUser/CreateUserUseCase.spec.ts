import "reflect-metadata"

import { CreateUserUseCase } from "./CreateUserUseCase";
import { InMemoryUsersRepository } from './../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserError } from "./CreateUserError";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create a user", async () => {
    const user = await createUserUseCase.execute({
      name: "Test",
      email: "test@test.com",
      password: "1234"
    });

    expect(user).toHaveProperty("id");
  })

  it("Should not be able to create a user with an existing email", async () => {
    await createUserUseCase.execute({
      name: "Test",
      email: "test@test.com",
      password: "1234"
    });

    await expect(
      createUserUseCase.execute({
        name: "Test 2",
        email: "test@test.com",
        password: "4321"
      })
    ).rejects.toEqual(new CreateUserError());
  })
});
