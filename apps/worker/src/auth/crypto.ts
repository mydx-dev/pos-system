const textEncoder = new TextEncoder();

const bytesToBase64 = (bytes: Uint8Array) => {
    let binary = '';
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
};

const toBase64Url = (base64: string) =>
    base64.replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');

export const randomId = () => crypto.randomUUID();

export const randomToken = (byteLength = 32) => {
    const bytes = new Uint8Array(byteLength);
    crypto.getRandomValues(bytes);
    return toBase64Url(bytesToBase64(bytes));
};

export const sha256Base64 = async (value: string) => {
    const digest = await crypto.subtle.digest('SHA-256', textEncoder.encode(value));
    return bytesToBase64(new Uint8Array(digest));
};

export const hashPassword = async (
    password: string,
    userId: string,
    pepper: string
) => sha256Base64(`${password}${userId}${pepper}`);

export const hashToken = (token: string) => sha256Base64(token);
