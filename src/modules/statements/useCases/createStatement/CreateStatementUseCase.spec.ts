import { CreateStatementError } from './CreateStatementError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { OperationType } from "../../entities/Statement";
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';

let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create statement", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it("Should be able to create an statement", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    if (user.id) {
      const deposit = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit"
      });

      expect(deposit).toHaveProperty("id");
      expect(deposit).toHaveProperty("type", "deposit");

      const withdraw = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.WITHDRAW,
        amount: 100,
        description: "withdraw"
      });
      expect(withdraw).toHaveProperty("id");
      expect(withdraw).toHaveProperty("type", "withdraw");
    }
  });

  it("Should not be able to create an statement of a nonexisting user", async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: "nonexisting-user",
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "withdraw"
      })
    ).rejects.toEqual(new CreateStatementError.UserNotFound());
  });

  it("Should not be able to create an statement of an withdraw if insufficient founds", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    if (user.id) {
      await expect(
        createStatementUseCase.execute({
          user_id: user.id,
          type: OperationType.WITHDRAW,
          amount: 100,
          description: "withdraw"
        })
      ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
    }
  });
})
