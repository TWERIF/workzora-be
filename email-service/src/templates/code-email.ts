import type { CodeEmailKind, EmailLocale } from '../types';

interface CodeEmailText {
    subject: string;
    label: string;
    title: string;
    intro: string;
    codeCaption: string;
    validity: string;
    button?: string;
    securityTitle: string;
    securityText: string;
    ignoreTitle: string;
    ignoreText: string;
    helpTitle: string;
    helpText: string;
    helpLink: string;
    rights: string;
    slogan: string;
}

const COMMON: Record<EmailLocale, Pick<CodeEmailText, 'securityTitle' | 'helpTitle' | 'helpText' | 'helpLink' | 'slogan'>> = {
    en: {
        securityTitle: 'For your security',
        helpTitle: 'Need help?',
        helpText: 'If you have any questions,',
        helpLink: 'contact our support team.',
        slogan: 'Build a better way of working.',
    },
    uk: {
        securityTitle: 'Для вашої безпеки',
        helpTitle: 'Потрібна допомога?',
        helpText: 'Якщо у вас є питання,',
        helpLink: 'напишіть нашій підтримці.',
        slogan: 'Будуємо кращий спосіб працювати.',
    },
};

const TEXTS: Record<CodeEmailKind, Record<EmailLocale, Omit<CodeEmailText, keyof (typeof COMMON)['en'] | 'rights'>>> = {
    'password-reset': {
        en: {
            subject: 'WorkZora password reset',
            label: 'Password recovery',
            title: 'Reset your password',
            intro: 'We received a request to reset the password for your WorkZora account.',
            codeCaption: 'Enter this verification code on the password recovery page:',
            validity: 'This code is valid for 15 minutes.',
            button: 'Continue reset',
            securityText: 'Never share this code with anyone. WorkZora support will never ask you for your password or verification code.',
            ignoreTitle: 'Didn\'t request a password reset?',
            ignoreText: 'If you did not request this, you can safely ignore this email. Your password will not be changed.',
        },
        uk: {
            subject: 'Відновлення пароля WorkZora',
            label: 'Відновлення пароля',
            title: 'Змініть пароль',
            intro: 'Ми отримали запит на відновлення пароля до вашого акаунта WorkZora.',
            codeCaption: 'Введіть цей код на сторінці відновлення пароля:',
            validity: 'Код дійсний 15 хвилин.',
            button: 'Продовжити відновлення',
            securityText: 'Нікому не повідомляйте цей код. Підтримка WorkZora ніколи не просить ваш пароль чи код підтвердження.',
            ignoreTitle: 'Не запитували відновлення?',
            ignoreText: 'Якщо це були не ви, просто проігноруйте лист. Пароль не зміниться.',
        },
    },
    'email-confirm': {
        en: {
            subject: 'Confirm your WorkZora email',
            label: 'Email confirmation',
            title: 'Confirm your email',
            intro: 'Thanks for joining WorkZora. Confirm your email address to finish creating your account.',
            codeCaption: 'Enter this verification code in the registration form:',
            validity: 'This code is valid for 2 minutes.',
            securityText: 'Never share this code with anyone. WorkZora support will never ask you for your verification code.',
            ignoreTitle: 'Didn\'t sign up?',
            ignoreText: 'If you did not create a WorkZora account, you can safely ignore this email.',
        },
        uk: {
            subject: 'Підтвердіть email у WorkZora',
            label: 'Підтвердження email',
            title: 'Підтвердіть email',
            intro: 'Дякуємо, що приєдналися до WorkZora. Підтвердіть адресу, щоб завершити реєстрацію.',
            codeCaption: 'Введіть цей код у формі реєстрації:',
            validity: 'Код дійсний 2 хвилини.',
            securityText: 'Нікому не повідомляйте цей код. Підтримка WorkZora ніколи не просить код підтвердження.',
            ignoreTitle: 'Не реєструвалися?',
            ignoreText: 'Якщо ви не створювали акаунт WorkZora, просто проігноруйте лист.',
        },
    },
};

const FONT = "Poppins, 'Segoe UI', Arial, sans-serif";

const siteUrl = () => (process.env.FRONTEND_URL || 'https://workzora.com').replace(/\/+$/, '');

const assetsUrl = () => (process.env.EMAIL_ASSETS_URL || siteUrl()).replace(/\/+$/, '');

const codeCells = (code: string) =>
    code
        .split('')
        .map(
            (digit) =>
                `<td class="wz-gap" style="padding:0 4px"><div class="wz-cell" style="width:52px;height:60px;line-height:60px;border:1px solid #d8e3b9;border-radius:12px;background:#f8faf2;text-align:center;font-size:30px;color:#7ea310;font-family:${FONT}">${digit}</div></td>`,
        )
        .join('');

export const renderCodeEmail = (kind: CodeEmailKind, locale: EmailLocale, code: string, email: string) => {
    const site = siteUrl();
    const year = new Date().getFullYear();
    const text = { ...COMMON[locale], ...TEXTS[kind][locale] };
    const rights = locale === 'uk' ? `© ${year} WorkZora. Усі права захищені.` : `© ${year} WorkZora. All rights reserved.`;
    const buttonHref = `${site}/${locale}/forgot-password?email=${encodeURIComponent(email)}`;

    const button = text.button
        ? `<tr><td style="padding-top:12px"><a href="${buttonHref}" style="display:block;padding:13px 0;border-radius:100px;background:#216b52;background-image:linear-gradient(90deg,#216b52,#7ea310);color:#ffffff;text-align:center;font-size:15px;text-decoration:none;font-family:${FONT}">${text.button}</a></td></tr>`
        : '';

    const html = `<!doctype html>
<html lang="${locale}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${text.subject}</title><style>@media (max-width:480px){.wz-art{display:none!important}.wz-pad{padding:16px!important}.wz-gap{padding:0 2px!important}.wz-cell{width:36px!important;height:46px!important;line-height:46px!important;font-size:22px!important}.wz-title{font-size:26px!important}}</style></head>
<body style="margin:0;padding:0;background:#f5f5f5">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;font-family:${FONT};color:#333333">
<tr><td align="center" style="padding:24px 12px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:528px">
<tr><td align="center" style="padding-bottom:24px"><a href="${site}"><img src="${assetsUrl()}/images/email/logo.png" width="110" height="68" alt="WorkZora" style="display:block;border:0"></a></td></tr>
<tr><td class="wz-pad" style="background:#ffffff;border-radius:24px;padding:24px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td valign="middle" style="padding-right:12px">
<p style="margin:0 0 12px;font-size:11px;text-transform:uppercase;color:#7ea310">${text.label}</p>
<h1 class="wz-title" style="margin:0 0 12px;font-size:32px;line-height:1.3;font-weight:700;color:#333333">${text.title}</h1>
<p style="margin:0;font-size:13px;line-height:1.5;color:#333333">${text.intro}</p>
</td>
<td class="wz-art" width="170" valign="middle" align="right"><img src="${assetsUrl()}/images/email/envelope.png" width="170" alt="" style="display:block;border:0;max-width:170px;height:auto"></td>
</tr></table>
</td></tr>
<tr><td style="padding-top:12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;border-radius:24px"><tr><td class="wz-pad" style="padding:24px">
<p style="margin:0 0 20px;font-size:16px;font-weight:600;line-height:1.5">${text.codeCaption}</p>
<table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr>${codeCells(code)}</tr></table>
<p style="margin:20px 0 0;font-size:14px;text-align:center">${text.validity}</p>
</td></tr></table>
</td></tr>
${button}
<tr><td style="padding-top:12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f6e7;border:1px solid #d8e3b9;border-radius:22px"><tr><td style="padding:24px">
<p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#7ea310">${text.securityTitle}</p>
<p style="margin:0;font-size:14px;line-height:1.6;color:#999999">${text.securityText}</p>
</td></tr></table>
</td></tr>
<tr><td style="padding:24px 0 16px;border-bottom:1px solid #e5e5e5">
<p style="margin:0 0 8px;font-size:16px;font-weight:600">${text.ignoreTitle}</p>
<p style="margin:0;font-size:12px;line-height:1.6">${text.ignoreText}</p>
</td></tr>
<tr><td style="padding-top:16px">
<p style="margin:0 0 8px;font-size:16px;font-weight:600">${text.helpTitle}</p>
<p style="margin:0;font-size:12px;line-height:1.6">${text.helpText} <a href="${site}/${locale}/contacts" style="color:#7ea310;text-decoration:none">${text.helpLink}</a></p>
</td></tr>
<tr><td align="center" style="padding-top:24px;font-size:11px;line-height:1.8;color:#999999">${rights}<br>${text.slogan}</td></tr>
</table>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

    return { subject: text.subject, html };
};
