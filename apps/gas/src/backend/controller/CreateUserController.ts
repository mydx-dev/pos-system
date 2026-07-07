import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import {
    CreateUserInput,
    createUserInputSchema,
    CreateUserOutput,
} from '../../shared/api/user';
import { CreateUserUseCase } from '../application/usecase/CreateUserUseCase';

export class CreateUserController {
    constructor(private readonly createUserUseCase: CreateUserUseCase) {}
    execute({
        name,
        email,
        password,
    }: CreateUserInput): AppsScriptServerResponse<CreateUserOutput> {
        const input = createUserInputSchema.parse({ name, email, password });
        const result = this.createUserUseCase.execute(input);
        return new AppsScriptServerResponse(result);
    }
}
