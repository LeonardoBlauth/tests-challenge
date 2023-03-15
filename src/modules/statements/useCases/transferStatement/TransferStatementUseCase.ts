import { inject, injectable } from "tsyringe";

import { AppError } from '../../../../shared/errors/AppError';

import { OperationType } from './../../entities/Statement';
import { IStatementsRepository } from './../../repositories/IStatementsRepository';
import { IUsersRepository } from '../../../users/repositories/IUsersRepository';
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";

interface IRequest {
  sender_user_id: string;
  target_user_id: string;
  amount: number;
  description: string;
}

@injectable()
class TransferStatementUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,

    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({ sender_user_id, target_user_id, amount, description }: IRequest): Promise<ICreateStatementDTO> {
    if (amount < 1) {
      throw new AppError("Minimum amount to make a transfer is 1!");
    }

    const { balance } = await this.statementsRepository.getUserBalance({ user_id: sender_user_id });

    if (balance < amount) {
      throw new AppError("Insufficient amount!");
    }

    const targetUser = await this.usersRepository.findById(target_user_id);

    if (!targetUser) {
      throw new AppError("Target user does not exists!");
    }

    const transfer = this.statementsRepository.create({
      amount: amount * -1,
      description,
      type: OperationType.TRANSFER,
      user_id: sender_user_id
    });

    this.statementsRepository.create({
      amount,
      description,
      type: OperationType.TRANSFER,
      user_id: target_user_id
    });

    return transfer;
  }
}

export { TransferStatementUseCase }
