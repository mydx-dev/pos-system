import {
    SheetEntity,
    SheetRelation,
    SheetTable,
} from '@mydx-dev/gas-boost-runtime/core';
import { describe, expect, test } from 'vitest';
type TableMetaData<TSchema extends TableSchema> = {
    テーブル名: string;
    主キー: ColumnName<TSchema>;
    自動採番: 'autoIncrement' | 'uuid' | false;
    楽観的更新?: ColumnName<TSchema>;
};
type TableSchema = Record<string, TableColumn>;

type ColumnName<T extends TableSchema> = Extract<keyof T, string>;

type TableColumn = {
    データ型: 'string' | 'number' | 'boolean' | 'enum' | 'date' | 'datetime';
    必須: boolean;
    バリデーション?: {
        [validationName: string]: {
            評価: boolean;
            値: any;
        };
    };
    ユニーク: boolean;
};

type TableMapping = {
    エンティティ: SheetEntity;
    レコード: Record<string, any>;
};

type TableRelation<TTargetSchema extends TableSchema> = {
    参照先テーブル: SheetTable<any, any, any>;
    参照先カラム: ColumnName<TTargetSchema>;
    削除: 'cascade' | 'restrict' | 'set null';
};

export class TableSpec<TSchema extends TableSchema> {
    private readonly metaData: TableMetaData<TSchema>;
    private readonly schema: TSchema;
    private readonly mapping: TableMapping;
    private readonly relations: Partial<{
        [K in keyof TSchema]: TableRelation<any>;
    }>;

    constructor({
        メタデータ,
        スキーマ,
        マッピング,
        リレーション,
    }: {
        メタデータ: TableMetaData<TSchema>;
        スキーマ: TSchema;
        マッピング: TableMapping;
        リレーション?: Partial<{
            [K in keyof TSchema]: TableRelation<any>;
        }>;
    }) {
        this.metaData = メタデータ;
        this.schema = スキーマ;
        this.mapping = マッピング;
        this.relations = リレーション ?? {};
    }

    toEqual(actualTable: SheetTable<any, any, any>) {
        describe(`${this.metaData.テーブル名}テーブル`, () => {
            describe('スキーマ', () => {
                const columns = actualTable.schema.def.shape;
                const uniqueColumns = actualTable.getUniqueColumns();

                Object.keys(this.schema).forEach((columnName) => {
                    const column = columns[columnName];
                    const columnSchema = this.schema[columnName];

                    test(`カラム名は'${columnName}'`, () => {
                        expect(columns).toHaveProperty(columnName);
                    });

                    let current = column;

                    while (
                        current.def.type === 'optional' ||
                        current.def.type === 'nullable' ||
                        current.def.type === 'default'
                    ) {
                        current = current.def.innerType;
                    }

                    test(`型は${columnSchema.データ型}`, () => {
                        expect(current.def.type).toBe(columnSchema.データ型);
                    });

                    if (columnSchema.必須) {
                        test('必須カラム', () => {
                            expect(() => column.parse(null)).toThrow();
                        });
                    } else {
                        test('必須でないカラム', () => {
                            expect(() => column.parse(null)).not.toThrow();
                        });
                    }

                    const validations = columnSchema.バリデーション;

                    if (validations) {
                        describe('バリデーション', () => {
                            Object.keys(validations).forEach(
                                (validationName) => {
                                    const validation =
                                        validations[validationName];
                                    test(`${validationName}のバリデーション`, () => {
                                        if (validation.評価) {
                                            expect(() =>
                                                column.parse(validation.値)
                                            ).not.toThrow();
                                        } else {
                                            expect(() =>
                                                column.parse(validation.値)
                                            ).toThrow();
                                        }
                                    });
                                }
                            );
                        });
                    }

                    if (columnSchema.ユニーク) {
                        test('ユニークなカラム', () => {
                            expect(uniqueColumns).toContain(columnName);
                        });
                    } else {
                        test('ユニークなカラムでない', () => {
                            expect(uniqueColumns).not.toContain(columnName);
                        });
                    }
                });
            });

            describe('メタデータ', () => {
                test(`テーブル名は'${this.metaData.テーブル名}'`, () => {
                    expect(actualTable.name).toBe(this.metaData.テーブル名);
                });
                test(`主キーは${this.metaData.主キー}`, () => {
                    expect(actualTable.primaryKey).toBe(this.metaData.主キー);
                });
                if (this.metaData.自動採番 === false) {
                    test('自動採番しない', () => {
                        expect(actualTable.autoIncrement).toBe(false);
                    });
                } else if (this.metaData.自動採番 === 'autoIncrement') {
                    test(`自動採番をする`, () => {
                        expect(actualTable.autoIncrement).toBe(true);
                    });
                } else if (this.metaData.自動採番 === 'uuid') {
                    test(`自動採番はUUIDv4形式`, () => {
                        expect(actualTable.autoIncrement).toBe('uuid');
                    });
                }

                const optimisticUpdateColumn = this.metaData.楽観的更新;
                if (optimisticUpdateColumn) {
                    test(`楽観的更新カラムは'${optimisticUpdateColumn}'`, () => {
                        expect(actualTable.versionColumn).toBe(
                            optimisticUpdateColumn
                        );
                    });
                }
            });

            test('レコードからエンティティを正しく生成できる', () => {
                const entity = actualTable.deserialize(this.mapping.レコード);
                expect(entity).toEqual(this.mapping.エンティティ);
            });
            test('エンティティからレコードを正しく生成できる', () => {
                const record = actualTable.serialize(this.mapping.エンティティ);
                expect(record).toEqual(this.mapping.レコード);
            });
            if (this.relations && Object.keys(this.relations).length > 0) {
                describe('リレーション', () => {
                    Object.keys(this.relations).forEach((columnName) => {
                        const relation = this.relations[columnName]!;
                        test(`${actualTable.name}テーブルの${columnName}は${relation.参照先テーブル.name}テーブルの${relation.参照先カラム}を${relation.削除}で参照する`, () => {
                            const sheetRelation = new SheetRelation(
                                relation.参照先カラム,
                                actualTable,
                                columnName,
                                relation.削除
                            );

                            expect(
                                relation.参照先テーブル['relations']
                            ).toContainEqual(sheetRelation);
                        });
                    });
                });
            }
        });
    }
}
