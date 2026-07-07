import { InvalidArgumentError } from '@mydx-dev/gas-boost-runtime/core';

const timeUnitMinutes = 15;

export class TreatmentDuration {
    public readonly value: number;

    constructor(value: number) {
        if (value < 0) {
            throw new InvalidArgumentError(
                'Treatment duration must not be less than 0'
            );
        }

        if (value % timeUnitMinutes !== 0) {
            throw new InvalidArgumentError(
                'Treatment duration must be in 15-minute units'
            );
        }

        this.value = value;
    }
}
