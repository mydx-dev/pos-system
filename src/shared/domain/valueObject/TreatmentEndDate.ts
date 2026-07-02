import { TreatmentDuration } from './TreatmentDuration';
import { TreatmentStartDate } from './TreatmentStartDate';

export class TreatmentEndDate {
    public readonly value: string;

    constructor(startDate: TreatmentStartDate, duration: TreatmentDuration) {
        this.value = new Date(
            startDate.value.getTime() + duration.value * 60 * 1000
        ).toISOString();
    }
}
