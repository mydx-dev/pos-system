import { InMemoryProperties } from '@mydx-dev/gas-boost-runtime/testing';
import { describe, expect, it, vi } from 'vitest';
import {
    isSetupCompletedKey,
    isTermsAcceptedKey,
} from '../../../shared/config';
import { DoGetUseCase } from './DoGetUseCase';

function fuctory() {
    const htmlservice: Pick<
        GoogleAppsScript.HTML.HtmlService,
        'createTemplateFromFile'
    > = {
        createTemplateFromFile: vi.fn().mockReturnValue({
            evaluate: vi.fn().mockReturnValue({
                getContent: vi.fn().mockReturnValue('<html></html>'),
            }),
        }),
    };
    const scriptProperties = new InMemoryProperties();
    const scriptApp: Pick<GoogleAppsScript.Script.ScriptApp, 'getScriptId'> = {
        getScriptId: vi.fn().mockReturnValue('test-script-id'),
    };
    const usecase = new DoGetUseCase(
        htmlservice,
        scriptProperties,
        isSetupCompletedKey,
        isTermsAcceptedKey,
        scriptApp,
        'ALLOWALL' as unknown as GoogleAppsScript.HTML.XFrameOptionsMode.ALLOWALL
    );
    return usecase;
}

function getDependencies(usecase: DoGetUseCase) {
    const createTemplateFromFileSpy = vi.spyOn(
        usecase['htmlService'],
        'createTemplateFromFile'
    );
    const templateMock = {
        evaluate: vi.fn().mockReturnValue({
            addMetaTag: vi.fn().mockReturnThis(),
            setXFrameOptionsMode: vi.fn().mockReturnThis(),
            setTitle: vi.fn().mockReturnThis(),
        }),
    };

    createTemplateFromFileSpy.mockReturnValue(templateMock as any);
    return { createTemplateFromFileSpy, templateMock };
}
describe('シーケンス', () => {
    it('index.htmlをテンプレートとして返す', () => {
        const usecase = fuctory();
        const { createTemplateFromFileSpy } = getDependencies(usecase);
        usecase.execute();
        expect(createTemplateFromFileSpy).toHaveBeenCalledWith('index');
    });

    it('テンプレートに初期設定未完了フラグと利用規約同意状態のフラグとスクリプトIDを設定する', () => {
        const usecase = fuctory();
        const { templateMock } = getDependencies(usecase);
        usecase.execute();
        expect(templateMock).toMatchObject({
            ssr: JSON.stringify({
                isSetupCompleted: false,
                isTermsAccepted: false,
                scriptId: 'test-script-id',
            }),
        });
    });

    it('テンプレートを評価してHTMLを返却する', () => {
        const usecase = fuctory();
        const { templateMock } = getDependencies(usecase);
        const html = usecase.execute();
        expect(templateMock.evaluate).toHaveBeenCalled();
        expect(html).toEqual(templateMock.evaluate());
    });
});
