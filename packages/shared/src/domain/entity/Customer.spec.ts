import { describe, expect, it } from 'vitest';
import { Customer } from './Customer';
import { Employee } from './Employee';
import { Treatment } from './Treatment';

describe('Customer', () => {
    it('顧客情報を取得できる', () => {
        const customer = new Customer(
            '123e4567-e89b-42d3-a456-426614174000',
            '山田 太郎',
            '223e4567-e89b-42d3-a456-426614174000',
            true,
            'customer@example.com',
            '09012345678',
            '1990-01-01',
            '1000001',
            '東京都千代田区',
            '備考',
            1
        );

        expect(customer.pkValue).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(customer.id).toBe('123e4567-e89b-42d3-a456-426614174000');
        expect(customer.name).toBe('山田 太郎');
        expect(customer.primaryStaffId).toBe(
            '223e4567-e89b-42d3-a456-426614174000'
        );
        expect(customer.isStaffFixed).toBe(true);
        expect(customer.email).toBe('customer@example.com');
        expect(customer.phoneNumber).toBe('09012345678');
        expect(customer.birthDate).toBe('1990-01-01');
        expect(customer.postalCode).toBe('1000001');
        expect(customer.address).toBe('東京都千代田区');
        expect(customer.note).toBe('備考');
        expect(customer.version).toBe(1);
    });

    it('主担当スタッフを取得できる', () => {
        const customer = new Customer(
            '123e4567-e89b-42d3-a456-426614174000',
            '山田 太郎',
            '223e4567-e89b-42d3-a456-426614174000',
            false,
            null,
            null,
            null,
            null,
            null,
            null,
            1
        );
        const employee = new Employee('223e4567-e89b-42d3-a456-426614174000');

        customer.addRelation(Employee, employee);

        expect(customer.primaryStaff).toBe(employee);
    });

    it('精算済みの施術から最終来店日を取得できる', () => {
        const customer = new Customer(
            '123e4567-e89b-42d3-a456-426614174000',
            '山田 太郎',
            null,
            false,
            null,
            null,
            null,
            null,
            null,
            null,
            1
        );
        const latestDoneTreatment = new Treatment(
            '323e4567-e89b-42d3-a456-426614174000',
            customer.id,
            '223e4567-e89b-42d3-a456-426614174000',
            '精算済み',
            '2024-03-01T10:00:00.000Z',
            60,
            null,
            1
        );

        customer.addRelation(
            Treatment,
            new Treatment(
                '423e4567-e89b-42d3-a456-426614174000',
                customer.id,
                '223e4567-e89b-42d3-a456-426614174000',
                '予約済み',
                '2024-04-01T10:00:00.000Z',
                60,
                null,
                1
            )
        );
        customer.addRelation(Treatment, latestDoneTreatment);
        customer.addRelation(
            Treatment,
            new Treatment(
                '523e4567-e89b-42d3-a456-426614174000',
                customer.id,
                '223e4567-e89b-42d3-a456-426614174000',
                '精算済み',
                '2024-01-01T10:00:00.000Z',
                60,
                null,
                1
            )
        );

        expect(customer.lastVisitDate).toBe(latestDoneTreatment.startAt);
    });

    it('精算済みの施術がない場合は最終来店日を取得しない', () => {
        const customer = new Customer(
            '123e4567-e89b-42d3-a456-426614174000',
            '山田 太郎',
            null,
            false,
            null,
            null,
            null,
            null,
            null,
            null,
            1
        );

        customer.addRelation(
            Treatment,
            new Treatment(
                '323e4567-e89b-42d3-a456-426614174000',
                customer.id,
                '223e4567-e89b-42d3-a456-426614174000',
                '来店済み',
                '2024-03-01T10:00:00.000Z',
                60,
                null,
                1
            )
        );

        expect(customer.lastVisitDate).toBeNull();
    });
});
