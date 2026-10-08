import { EN } from './en';
import { UK } from './uk';

export const HELP_SEED = [...EN.map((item) => ({ ...item, locale: 'en' })), ...UK.map((item) => ({ ...item, locale: 'uk' }))];
