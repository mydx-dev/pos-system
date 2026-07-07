import { z } from 'zod';
import { userSchema } from '../schemas/database';

export const createUserInputSchema = z.object({
    name: z.string(),
    email: z.string().email(),
    password: z.string(),
});
export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const createUserOutputSchema = z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
});
export type CreateUserOutput = z.infer<typeof createUserOutputSchema>;

export const loginUserInputSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
export type LoginUserInput = z.infer<typeof loginUserInputSchema>;

export const loginUserOutputSchema = z.object({
    sessionToken: z.string(),
    userId: z.string(),
});
export type LoginUserOutput = z.infer<typeof loginUserOutputSchema>;

export const logoutUserInputSchema = z.string();
export type LogoutUserInput = z.infer<typeof logoutUserInputSchema>;

export const logoutUserOutputSchema = z.object({
    ok: z.boolean(),
});
export type LogoutUserOutput = z.infer<typeof logoutUserOutputSchema>;

export const approveUserInputSchema = z.object({
    sessionToken: z.string(),
    user: userSchema.pick({ ID: true, バージョン: true }),
});
export type ApproveUserInput = z.infer<typeof approveUserInputSchema>;

export const approveUserOutputSchema = z.object({
    user: userSchema,
});
export type ApproveUserOutput = z.infer<typeof approveUserOutputSchema>;

export const unapproveUserInputSchema = z.object({
    sessionToken: z.string(),
    user: userSchema.pick({ ID: true, バージョン: true }),
});
export type UnapproveUserInput = z.infer<typeof unapproveUserInputSchema>;

export const unapproveUserOutputSchema = z.object({
    user: userSchema,
});
export type UnapproveUserOutput = z.infer<typeof unapproveUserOutputSchema>;

export const deleteUserInputSchema = z.object({
    sessionToken: z.string(),
    id: z.string(),
});
export type DeleteUserInput = z.infer<typeof deleteUserInputSchema>;

export const deleteUserOutputSchema = z.object({
    ok: z.boolean(),
});
export type DeleteUserOutput = z.infer<typeof deleteUserOutputSchema>;

export const updateUserInputSchema = z.object({
    sessionToken: z.string(),
    user: userSchema.pick({
        ID: true,
        氏名: true,
        メールアドレス: true,
        バージョン: true,
    }),
});
export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const updateUserOutputSchema = z.object({
    user: userSchema,
});
export type UpdateUserOutput = z.infer<typeof updateUserOutputSchema>;

export const forgotPasswordInputSchema = z.object({
    email: z.string().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordInputSchema>;

export const forgotPasswordOutputSchema = z.object({
    ok: z.boolean(),
});
export type ForgotPasswordOutput = z.infer<typeof forgotPasswordOutputSchema>;

export const resetPasswordInputSchema = z.object({
    token: z.string(),
    newPassword: z.string(),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordInputSchema>;

export const resetPasswordOutputSchema = z.object({
    ok: z.boolean(),
});
export type ResetPasswordOutput = z.infer<typeof resetPasswordOutputSchema>;
