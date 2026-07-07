import { z } from 'zod';

export const emailSchema = z
    .string()
    .regex(
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
        '有効なメールアドレスを入力してください'
    );

export const passwordSchema = z
    .string()
    .min(8, 'パスワードは8文字以上である必要があります')
    .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&-]+$/,
        'パスワードは英語大文字、小文字、数字を含む必要があります'
    );
