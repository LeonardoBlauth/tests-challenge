import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Authenticate user", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    authenticateUserUseCase = new AuthenticateUserUseCase(inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to authenticate user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    const authUser = await authenticateUserUseCase.execute({
      email: "test@test.com",
      password: "123123"
    });

    expect(authUser).toHaveProperty("token");
  });

  it("Should not be able to authenticate user with incorrect email", async () => {
    await inMemoryUsersRepository.create({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    await expect(
      authenticateUserUseCase.execute({
        email: "test@test.com.br",
        password: "123123"
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });

  it("Should not be able to authenticate user with incorrect paassword", async () => {
    const user = await inMemoryUsersRepository.create({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    await expect(
      authenticateUserUseCase.execute({
        email: user.email,
        password: "321321"
      })
    ).rejects.toEqual(new IncorrectEmailOrPasswordError());
  });
});
