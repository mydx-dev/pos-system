import {
    InMemoryDataStore,
    InMemoryGateway,
    SheetDB,
} from '@mydx-dev/gas-boost-runtime/core';
import {
    InMemoryCacheService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { ALL_TABLES } from '../../infrastructure/database/tables';
import { PullDataBaseUseCase } from './PullDataBaseUseCase';

function factory() {
    const dataStore = new InMemoryDataStore();
    dataStore.set(':ユーザー', [
        ['ID', '氏名', 'メールアドレス', 'パスワード'],
        ['1', 'Test User', 'test@example.com', 'password'],
        ['2', 'Another User', 'another@example.com', 'password2'],
        ['3', 'Third User', 'third@example.com', 'password3'],
        ['4', 'Fourth User', 'fourth@example.com', 'password4'],
        ['5', 'Fifth User', 'fifth@example.com', 'password5'],
    ]);

    dataStore.set(':ロール', [
        ['ユーザーID', '名称'],
        ['1', 'システム管理者'],
        ['2', 'ユーザー'],
        ['3', 'ユーザー'],
        ['4', 'ユーザー'],
        ['5', 'ユーザー'],
    ]);

    const gateway = new InMemoryGateway(dataStore);
    const db = new SheetDB(
        ALL_TABLES,
        gateway,
        new InMemoryCacheService(),
        new NodeUtilities()
    );

    const usecase = new PullDataBaseUseCase(db);
    return { usecase, dataStore };
}

describe('SyncDataBaseUseCase', () => {
    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));
    it('自分のメールアドレスと一致するユーザーがない場合はエラー', () => {
        const { usecase } = factory();
        expect(() => usecase.execute('non-existent-id')).toThrow(
            'User not found'
        );
    });

    describe('パスワードは全て出力しない', () => {
        describe('非管理者ユーザー', () => {
            const { usecase } = factory();

            const result = usecase.execute('2');

            it('ユーザーテーブルは自分のみ取得できる', () => {
                expect(result[0].records).toEqual([
                    {
                        ID: '2',
                        氏名: 'Another User',
                        メールアドレス: 'another@example.com',
                        パスワード: '',
                    },
                ]);
            });

            it('権限テーブルは自分のみ取得できる', () => {
                expect(result[1].records).toEqual([
                    {
                        ユーザーID: '2',
                        名称: 'ユーザー',
                    },
                ]);
            });
        });

        describe('管理者ユーザーあるいは開発者ユーザー', () => {
            describe('管理者ユーザーは全てのユーザーの情報を取得できる', () => {
                const { usecase } = factory();

                const result = usecase.execute('1');
                it('ユーザーテーブルは全てのユーザーを取得できる', () => {
                    expect(result[0].records).toEqual([
                        {
                            ID: '1',
                            氏名: 'Test User',
                            メールアドレス: 'test@example.com',
                            パスワード: '',
                        },
                        {
                            ID: '2',
                            氏名: 'Another User',
                            メールアドレス: 'another@example.com',
                            パスワード: '',
                        },
                        {
                            ID: '3',
                            氏名: 'Third User',
                            メールアドレス: 'third@example.com',
                            パスワード: '',
                        },
                        {
                            ID: '4',
                            氏名: 'Fourth User',
                            メールアドレス: 'fourth@example.com',
                            パスワード: '',
                        },
                        {
                            ID: '5',
                            氏名: 'Fifth User',
                            メールアドレス: 'fifth@example.com',
                            パスワード: '',
                        },
                    ]);
                });

                it('権限テーブルは全てのユーザーの権限を取得できる', () => {
                    expect(result[1].records).toEqual([
                        {
                            ユーザーID: '1',
                            名称: 'システム管理者',
                        },
                        {
                            ユーザーID: '2',
                            名称: 'ユーザー',
                        },
                        {
                            ユーザーID: '3',
                            名称: 'ユーザー',
                        },
                        {
                            ユーザーID: '4',
                            名称: 'ユーザー',
                        },
                        {
                            ユーザーID: '5',
                            名称: 'ユーザー',
                        },
                    ]);
                });
            });
        });
    });
});
