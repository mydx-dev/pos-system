import { AppsScriptServerResponse } from '@mydx-dev/gas-boost-runtime/core';
import {
    LoginUserInput,
    loginUserInputSchema,
    LoginUserOutput,
} from '../../shared/api/user';
import { LoginUserUseCase } from '../application/usecase/LoginUserUseCase';

export class LoginUserController {
    constructor(private loginUserUseCase: LoginUserUseCase) {}
    execute(input: LoginUserInput): AppsScriptServerResponse<LoginUserOutput> {
        const { email, password } = loginUserInputSchema.parse(input);
        const {
            sessionToken,
            user: { id },
        } = this.loginUserUseCase.execute({ email, password });
        return new AppsScriptServerResponse({
            sessionToken,
            userId: id,
        });
    }
}
