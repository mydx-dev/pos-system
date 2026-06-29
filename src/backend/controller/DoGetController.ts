import { DoGetUseCase } from '../application/usecase/DoGetUseCase';

export class DoGetController {
    constructor(private readonly doGetUseCase: DoGetUseCase) {}
    execute() {
        return this.doGetUseCase.execute();
    }
}
