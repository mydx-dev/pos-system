const textEncoder = new TextEncoder();
const PASSWORD_HASH_ALGORITHM = 'pbkdf2_sha256';
const PASSWORD_HASH_ITERATIONS = 210_000;

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
) => {
    const key = await crypto.subtle.importKey(
        'raw',
        textEncoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            hash: 'SHA-256',
            salt: textEncoder.encode(`${userId}${pepper}`),
            iterations: PASSWORD_HASH_ITERATIONS,
        },
        key,
        256
    );

    return [
        PASSWORD_HASH_ALGORITHM,
        String(PASSWORD_HASH_ITERATIONS),
        bytesToBase64(new Uint8Array(derivedBits)),
    ].join('$');
};

export const hashToken = (token: string) => sha256Base64(token);
