import "reflect-metadata"

import { CreateUserUseCase } from '../../../users/useCases/createUser/CreateUserUseCase';
import { OperationType } from '../../entities/Statement';
import { CreateStatementUseCase } from '../createStatement/CreateStatementUseCase';
import { InMemoryUsersRepository } from './../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from './../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';
import { GetStatementOperationError } from './GetStatementOperationError';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let createStatementUseCase: CreateStatementUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("List statement operations", () => {
  beforeEach(() => {
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("Should be able to list operations of a given statement", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    if (user.id) {
      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit"
      });

      if (statement.id) {
        const statementOperation = await getStatementOperationUseCase.execute({
          user_id: user.id,
          statement_id: statement.id
        });

        expect(statementOperation).toHaveProperty("id");
      }
    }
  });

  it("Should not be able to list operations of a nonexisting user", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    if (user.id) {
      const statement = await createStatementUseCase.execute({
        user_id: user.id,
        type: OperationType.DEPOSIT,
        amount: 100,
        description: "deposit"
      });

      if (statement.id) {
        await expect(
          getStatementOperationUseCase.execute({
            user_id: "nonexisting-user",
            statement_id: statement.id
          })
        ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
      }
    }
  });

  it("Should not be able to list operations of a nonexisting statement", async () => {
    const user = await createUserUseCase.execute({
      name: "test",
      email: "test@test.com",
      password: "123123"
    });

    if (user.id) {
      await expect(
        getStatementOperationUseCase.execute({
          user_id: user.id,
          statement_id: "nonexisting-statement"
        })
      ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
    }
  });
});
