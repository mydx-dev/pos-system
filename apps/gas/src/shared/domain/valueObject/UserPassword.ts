export class UserPassword {
    public readonly value: string;
    constructor(value: string) {
        if (value.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/;
        if (!regex.test(value)) {
            throw new Error('Invalid password format');
        }
        this.value = value;
    }
}
