import {
    InMemoryPropertiesService,
    NodeUtilities,
} from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import { PasswordProtection } from './PasswordProtection';

function factory() {
    const scriptProperties =
        new InMemoryPropertiesService().getScriptProperties();
    return new PasswordProtection(new NodeUtilities(), scriptProperties);
}

function getDependencies(passwordProtection: PasswordProtection) {
    const getProperty = vi.spyOn(
        passwordProtection['properties'],
        'getProperty'
    );
    return { getProperty };
}

describe('実行', () => {
    describe('ペッパーをスクリプトプロパティから取得する', () => {
        it('正常', () => {
            // スクリプトプロパティからPASSWORD_PEPPERを取得する
            const passwordProtection = factory();
            const { getProperty } = getDependencies(passwordProtection);
            passwordProtection['properties'].setProperty(
                'PASSWORD_PEPPER',
                '780c4cdb-52cf-4b2f-9d35-c20166ed9df2'
            );

            passwordProtection.execute('plaintextPassword', 'salt');

            expect(getProperty).toHaveBeenCalledWith('PASSWORD_PEPPER');
            expect(getProperty).toHaveReturnedWith(
                '780c4cdb-52cf-4b2f-9d35-c20166ed9df2'
            );
        });

        it('失敗', () => {
            const propertiesService = new InMemoryPropertiesService();
            const scriptProperties = propertiesService.getScriptProperties();

            const utilities = new NodeUtilities();
            const passwordProtection = new PasswordProtection(
                utilities,
                scriptProperties
            );

            expect(() =>
                passwordProtection.execute('plaintextPassword', 'salt')
            ).toThrow('PASSWORD_PEPPER is not set in script properties');
        });

        it('形式がUUID v4である', () => {
            const propertiesService = new InMemoryPropertiesService();
            const scriptProperties = propertiesService.getScriptProperties();
            scriptProperties.setProperty(
                'PASSWORD_PEPPER',
                '780c4cdb-52cf-4b2f-9d35-c20166ed9df2'
            );

            const utilities = new NodeUtilities();
            const passwordProtection = new PasswordProtection(
                utilities,
                scriptProperties
            );

            passwordProtection.execute('plaintextPassword', 'salt');

            const pepper = scriptProperties.getProperty('PASSWORD_PEPPER');
            const uuidV4Regex =
                /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            expect(pepper).toMatch(uuidV4Regex);
        });

        it('形式がUUID v4でない場合、エラーをスローする', () => {
            const propertiesService = new InMemoryPropertiesService();
            const scriptProperties = propertiesService.getScriptProperties();
            scriptProperties.setProperty('PASSWORD_PEPPER', 'invalid-pepper');

            const utilities = new NodeUtilities();
            const passwordProtection = new PasswordProtection(
                utilities,
                scriptProperties
            );

            expect(() =>
                passwordProtection.execute('plaintextPassword', 'salt')
            ).toThrow('PASSWORD_PEPPER is invalid format');
        });
    });

    it('パスワードをハッシュ化すると34XCSTEmNU+1Gu1V1uFIQKD72uKxmVobldXjqoEf/rg=になる', () => {
        const propertiesService = new InMemoryPropertiesService();
        const scriptProperties = propertiesService.getScriptProperties();
        scriptProperties.setProperty(
            'PASSWORD_PEPPER',
            '780c4cdb-52cf-4b2f-9d35-c20166ed9df2'
        );

        const utilities = new NodeUtilities();
        const passwordProtection = new PasswordProtection(
            utilities,
            scriptProperties
        );

        const hashedPassword = passwordProtection.execute(
            'test-password',
            '7c2c905e-f3ed-42ae-b6fb-050705bfde2c'
        );

        expect(hashedPassword).toBe(
            '34XCSTEmNU+1Gu1V1uFIQKD72uKxmVobldXjqoEf/rg='
        );
    });
});
