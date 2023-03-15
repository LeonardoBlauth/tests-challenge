import { Request, Response } from "express"
import { container } from "tsyringe";

import { TransferStatementUseCase } from "./TransferStatementUseCase";

class TransferStatementController {
  async handle(req: Request, res: Response): Promise<Response> {
    const { id: sender_user_id } = req.user;
    const { user_id: target_user_id } = req.params;
    const { amount, description } = req.body;

    const transferStatementUseCase = container.resolve(TransferStatementUseCase);

    const transfer = await transferStatementUseCase.execute({sender_user_id, target_user_id, amount, description});

    return res.status(201).json(transfer);
  }
}

export { TransferStatementController }
