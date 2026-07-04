export class RegisterTerminalPlaneToken {
    public readonly value: string;

    constructor() {
        const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const chunks = Array.from({ length: 3 }, () =>
            Array.from(
                { length: 4 },
                () => alphabet[Math.floor(Math.random() * alphabet.length)]
            ).join('')
        );
        const value = `RGT-${chunks.join('-')}`;
        this.value = value.trim().toUpperCase();
    }
}
