import Mustache from 'mustache';
import { ReceiptData } from '../../../shared/domain/valueObject/Receipt';
import { Printable } from '../../lib/printer/core/Printer';

const money = (value: number) =>
    new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        maximumFractionDigits: 0,
    }).format(value);

const dateTime = (iso: string) =>
    new Intl.DateTimeFormat('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
        .format(new Date(iso))
        .replace(
            /^(\d{4})\/(\d{2})\/(\d{2})\((.)\) (.*)$/,
            '$1年$2月$3日 ($4) $5'
        );

const changeAmount = (paidAmount: number, total: number) =>
    Math.max(0, paidAmount - total);

export class Receipt implements Printable {
    public readonly contents: string;

    constructor(data: ReceiptData) {
        const template = `^^^{{store.name}}

|〒 {{store.postalCode}}
|{{store.address1}}
|{{store.address2}}
|TEL : {{store.phoneNumber}}



領収書
-

|{{customerName}} 様

|伝票No. {{receiptNo}}
|{{{formattedIssuedAt}}}
|レジNo. {{registerTerminalId}}  レジ担当 : {{staffName}}

{{#items}}
|{{name}} |{{formattedSubtotal}}|
{{/items}}

|ご利用額 |{{formattedSubtotal}}|
|(内消費税相当額 |{{formattedTaxAmount}})|
|^合計 |^{{formattedTotal}}|
|お預かり |{{formattedPaidAmount}}|
|お釣り |{{formattedChangeAmount}}|

-

|{{store.message}}
`;
        this.contents = Mustache.render(template, {
            ...data,
            store: {
                ...data.store,
                message: data.store.message ?? 'ありがとうございました',
            },
            formattedIssuedAt: dateTime(data.issuedAt),
            formattedPaidAt: dateTime(data.paidAt),
            formattedSubtotal: money(data.subtotal),
            formattedDiscountTotal: money(data.discountTotal),
            formattedTotal: money(data.total),
            formattedPaidAmount: money(data.paidAmount),
            formattedChangeAmount: money(
                changeAmount(data.paidAmount, data.total)
            ),
            items: data.items.map((item) => ({
                ...item,
                hasDiscount: item.discountAmount > 0,
                formattedRegularPrice: money(item.regularPrice),
                formattedDiscountAmount: money(item.discountAmount),
                formattedSubtotal: money(item.subtotal),
            })),
            formattedTaxAmount: money(data.subtotal - data.subtotal / 1.1),
        });
    }
}
