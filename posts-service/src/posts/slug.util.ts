// Ukrainian official transliteration (CMU resolution No. 55, 2010) plus the extra Russian letters.
// Letters that are spelled differently at the start of a word are listed in WORD_START.
const MAP: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh', з: 'z',
    и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p',
    р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
    щ: 'shch', ю: 'iu', я: 'ia', ь: '', ъ: '', ё: 'io', ы: 'y', э: 'e',
};

const WORD_START: Record<string, string> = {
    є: 'ye', ї: 'yi', й: 'y', ю: 'yu', я: 'ya', ё: 'yo',
};

const APOSTROPHES = /['’ʼ`]/g;
const MAX_LENGTH = 80;

export function transliterate(text: string): string {
    const source = text.toLowerCase().replace(APOSTROPHES, '');
    let result = '';

    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        const prev = source[i - 1];
        const isWordStart = !prev || !/[\p{L}\p{N}]/u.test(prev);

        // "зг" is written as "zgh" to tell it apart from "ж" (zh)
        if (char === 'г' && prev === 'з') {
            result += 'gh';
            continue;
        }

        if (isWordStart && WORD_START[char]) {
            result += WORD_START[char];
        } else if (char in MAP) {
            result += MAP[char];
        } else {
            result += char;
        }
    }

    return result;
}

export function slugify(title: string): string {
    const slug = transliterate(title)
        .normalize('NFKD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    if (slug.length <= MAX_LENGTH) return slug || 'post';

    // cut on a word boundary so the slug does not end with half a word
    const cut = slug.slice(0, MAX_LENGTH);
    const lastDash = cut.lastIndexOf('-');
    return (lastDash > 20 ? cut.slice(0, lastDash) : cut).replace(/-+$/, '');
}
