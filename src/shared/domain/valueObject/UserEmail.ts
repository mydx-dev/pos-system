export class UserEmail {
    public readonly value: string;
    constructor(value: string) {
        const regex =
            /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!regex.test(value)) {
            throw new Error('Invalid email format');
        }
        this.value = value;
    }
}
