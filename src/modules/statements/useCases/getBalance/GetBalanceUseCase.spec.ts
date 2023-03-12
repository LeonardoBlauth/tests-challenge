import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceUseCase } from "./GetBalanceUseCase";
import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { GetBalanceError } from './GetBalanceError';

let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase;
let createUserUseCase: CreateUserUseCase;

describe("Get Balance", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it ("Should be able to list all operations and the balance of an authenticated user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    if (user.id) {
      const res = await getBalanceUseCase.execute({
        user_id: user.id
      });

      expect(res).toHaveProperty("balance");
      expect(res).toHaveProperty("statement");
    }
  });

  it ("Should not be able to list all operations and the balance of a nonexisting user", async () => {
      await expect(
        getBalanceUseCase.execute({
          user_id: "nonexisting-user"
        })
      ).rejects.toEqual(new GetBalanceError());
  });
});
