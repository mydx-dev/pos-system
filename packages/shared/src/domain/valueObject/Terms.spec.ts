import { describe, expect, it } from 'vitest';
import { Terms } from './Terms';

describe('利用規約', () => {
    const terms = new Terms();
    it('利用規約の概要について', () => {
        const title = '利用規約';
        const article = terms.articles[0];
        expect(article.title).toBe(title);
        expect(article.body).toBe(
            `本利用規約（以下「本規約」）は、大島大河（以下「当方」）が提供する
ソフトウェアおよび関連サービス（以下「本サービス」）の利用条件を定めるものです。
本サービスを利用することにより、利用者は本規約に同意したものとみなされます。`
        );
    });

    it('第一条', () => {
        const article = terms.articles[1];
        expect(article.title).toBe('第1条（適用）');
        expect(article.body).toBe(
            '本規約は、本サービスの利用に関する当方と利用者との間の一切の関係に適用されます。'
        );
    });

    it('第二条', () => {
        const article = terms.articles[2];
        expect(article.title).toBe('第2条（利用許諾）');
        expect(article.body).toBe(
            '当方は、利用者に対し、本規約および当方が別途定めるライセンス条件に従うことを条件として、本サービスを利用する非独占的かつ譲渡不能な権利を付与します。'
        );
    });

    it('第三条', () => {
        const article = terms.articles[3];
        expect(article.title).toBe('第3条（禁止事項）');
        expect(article.body).toBe(
            '利用者は、以下の行為を行ってはなりません。\n\n1. 本サービスまたは配布物の全部または一部を改変、翻案、解析、逆コンパイル、逆アセンブル、またはリバースエンジニアリングする行為  \n2. 本サービスの再配布、転載、販売、貸与、譲渡、サブライセンスその他これに準ずる行為  \n3. 認証機構、トークン検証、利用制限、課金判定等を回避、無効化、または妨害する行為  \n4. 不正な手段によるトークン取得、または正当な権限を有しない状態での利用  \n5. 本サービスの運営を妨害する行為、または当方に不利益・損害を与える行為  \n6. 法令または公序良俗に違反する行為'
        );
    });

    it('第四条', () => {
        const article = terms.articles[4];
        expect(article.title).toBe('第4条（認証およびトークン）');
        expect(article.body).toBe(
            '本サービスの利用には、当方が管理する認証機構を通過することが必須です。\n\n利用者は、発行されたトークンが当方の定める条件を満たす場合にのみ、\n本サービスを利用できるものとします。\n\n当方は、利用者の契約状況、利用状況、または本規約違反の疑いがある場合、\n事前の通知なくトークンを失効または利用制限することができます。'
        );
    });

    it('第五条', () => {
        const article = terms.articles[5];
        expect(article.title).toBe('第5条（利用停止・失効）');
        expect(article.body).toBe(
            '当方は、利用者が本規約に違反した場合、またはそのおそれがあると判断した場合、\n事前の通知なく本サービスの全部または一部の利用を停止または終了できるものとします。'
        );
    });

    it('第六条', () => {
        const article = terms.articles[6];
        expect(article.title).toBe('第6条（規約の変更）');
        expect(article.body).toBe(
            '当方は、必要と判断した場合、本規約を変更することができます。  \n変更後の規約は、本サービス上での表示または当方が定める方法により通知された時点で\n効力を生じるものとします。\n\n規約変更後に本サービスを利用した場合、利用者は変更後の規約に同意したものとみなされます。'
        );
    });

    it('第七条', () => {
        const article = terms.articles[7];
        expect(article.title).toBe('第7条（保証の否認）');
        expect(article.body).toBe(
            '本サービスは「現状有姿」で提供され、\n当方は、本サービスに関して、正確性、完全性、有用性、\n特定目的への適合性について、いかなる保証も行いません。'
        );
    });

    it('第八条', () => {
        const article = terms.articles[8];
        expect(article.title).toBe('第8条（免責）');
        expect(article.body).toBe(
            '当方は、本サービスの利用または利用不能により生じたいかなる損害についても、\n一切の責任を負わないものとします。'
        );
    });

    it('第九条', () => {
        const article = terms.articles[9];
        expect(article.title).toBe('第9条（準拠法および管轄）');
        expect(article.body).toBe(
            '本規約は日本法を準拠法とします。  \n本サービスに関して当方と利用者との間で生じた紛争については、\n当方の所在地を管轄する裁判所を専属的合意管轄とします。'
        );
    });
});
