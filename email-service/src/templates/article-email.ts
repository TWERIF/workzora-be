import type { EmailLocale } from '../types';

const FONT = "Poppins, 'Segoe UI', Arial, sans-serif";

const TEXTS: Record<EmailLocale, { label: string; button: string; footer: string; unsubscribe: string; rights: string }> = {
    en: {
        label: 'New on the WorkZora blog',
        button: 'Read the article',
        footer: 'You receive this email because you subscribed to new articles on WorkZora.',
        unsubscribe: 'Unsubscribe',
        rights: 'All rights reserved.',
    },
    uk: {
        label: 'Нове в блозі WorkZora',
        button: 'Читати статтю',
        footer: 'Ви отримали цей лист, бо підписалися на нові статті WorkZora.',
        unsubscribe: 'Відписатися',
        rights: 'Усі права захищені.',
    },
};

const escapeHtml = (value: string) =>
    value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const plainText = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

export const siteUrl = () => (process.env.FRONTEND_URL || 'https://workzora.com').replace(/\/+$/, '');

export const renderArticleEmail = (locale: EmailLocale, post: { title: string; slug: string; teaser: string; imageUrl?: string }, token: string) => {
    const site = siteUrl();
    const text = TEXTS[locale];
    const link = `${site}/${locale}/news/${encodeURIComponent(post.slug)}`;
    const unsubscribe = `${site}/${locale}/newsletter/unsubscribe?token=${token}`;
    const title = escapeHtml(post.title);
    const image = post.imageUrl
        ? `<tr><td style="padding-bottom:20px"><a href="${link}"><img src="${escapeHtml(post.imageUrl)}" width="480" alt="" style="display:block;width:100%;max-width:480px;height:auto;border:0;border-radius:18px"></a></td></tr>`
        : '';

    const html = `<!doctype html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f5f5f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;font-family:${FONT};color:#333333">
<tr><td align="center" style="padding:24px 12px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:528px">
<tr><td align="center" style="padding-bottom:24px"><a href="${site}"><img src="${site}/images/email/logo.png" width="110" height="68" alt="WorkZora" style="display:block;border:0"></a></td></tr>
<tr><td style="background:#ffffff;border-radius:24px;padding:24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:12px;font-size:11px;text-transform:uppercase;color:#7ea310">${text.label}</td></tr>
${image}
<tr><td style="padding-bottom:12px"><h1 style="margin:0;font-size:26px;line-height:1.3;font-weight:700;color:#333333">${title}</h1></td></tr>
<tr><td style="padding-bottom:20px;font-size:14px;line-height:1.6">${escapeHtml(plainText(post.teaser))}</td></tr>
<tr><td><a href="${link}" style="display:block;padding:13px 0;border-radius:100px;background:#216b52;background-image:linear-gradient(90deg,#216b52,#7ea310);color:#ffffff;text-align:center;font-size:15px;text-decoration:none">${text.button}</a></td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding-top:20px;font-size:11px;line-height:1.8;color:#999999">${text.footer}<br><a href="${unsubscribe}" style="color:#7ea310">${text.unsubscribe}</a><br>© ${new Date().getFullYear()} WorkZora. ${text.rights}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    return { subject: post.title, html };
};
