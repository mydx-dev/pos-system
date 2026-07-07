const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&-]+$/;

export const validatePassword = (password: string) => {
    if (password.length < 8) {
        return 'Password must be at least 8 characters long.';
    }

    if (!passwordPattern.test(password)) {
        return 'Password must contain uppercase letters, lowercase letters, and numbers.';
    }

    return null;
};
