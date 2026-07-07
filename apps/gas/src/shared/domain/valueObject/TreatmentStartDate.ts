import { InvalidArgumentError } from '@mydx-dev/gas-boost-runtime/core';

const timeUnitMinutes = 15;

export class TreatmentStartDate {
    public readonly value: Date;

    constructor(value: string) {
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            throw new InvalidArgumentError('Invalid start date time');
        }

        if (
            date.getMinutes() % timeUnitMinutes !== 0 ||
            date.getSeconds() !== 0 ||
            date.getMilliseconds() !== 0
        ) {
            throw new InvalidArgumentError(
                'Start time must be in 15-minute units'
            );
        }

        this.value = date;
    }
}
