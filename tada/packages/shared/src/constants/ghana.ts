/**
 * Ghana-specific constants. The single source of truth for things like
 * mobile network prefixes, region names, supported languages.
 */

export const GHANA = {
  /** ISO 3166-1 alpha-2 */
  countryCode: 'GH',
  /** ISO 4217 */
  currencyCode: 'GHS',
  currencySymbol: 'GH₵',
  /** E.164 country calling code, without the + */
  callingCode: '233',
  /** IANA timezone */
  timezone: 'Africa/Accra',
  /** Default locale for number/date formatting */
  defaultLocale: 'en-GH',
} as const;

/**
 * Ghanaian mobile network prefixes (after the country code).
 * Source of truth for detecting which MoMo provider to charge.
 *
 * Format: prefix without leading 0 (so "024" becomes "24").
 *
 * Updated periodically as networks change. Verify against NCA before launch.
 */
export const MOBILE_NETWORKS = {
  mtn: {
    name: 'MTN',
    code: 'mtn',
    momoMethod: 'mtn_momo' as const,
    prefixes: ['24', '54', '55', '59', '53'],
    color: '#FFCC00',
  },
  vodafone: {
    name: 'Telecel (formerly Vodafone)',
    code: 'vodafone',
    momoMethod: 'vodafone_cash' as const,
    prefixes: ['20', '50'],
    color: '#E60000',
  },
  airteltigo: {
    name: 'AirtelTigo',
    code: 'airteltigo',
    momoMethod: 'airteltigo_money' as const,
    prefixes: ['27', '57', '26', '56'],
    color: '#ED1C24',
  },
} as const;

export type MobileNetworkCode = keyof typeof MOBILE_NETWORKS;

/**
 * Ghana's 16 administrative regions. Used in address forms and analytics.
 * The pilot operates in Greater Accra.
 */
export const GHANA_REGIONS = [
  'Greater Accra',
  'Ashanti',
  'Western',
  'Western North',
  'Central',
  'Eastern',
  'Volta',
  'Oti',
  'Northern',
  'Savannah',
  'North East',
  'Upper East',
  'Upper West',
  'Bono',
  'Bono East',
  'Ahafo',
] as const;

export type GhanaRegion = (typeof GHANA_REGIONS)[number];

/**
 * Languages supported by the apps. en is mandatory; tw/ga/ee/ha are pilot
 * targets. Reflected in the database (patients.preferred_language).
 */
export const SUPPORTED_LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  tw: { code: 'tw', name: 'Twi', nativeName: 'Twi' },
  ga: { code: 'ga', name: 'Ga', nativeName: 'Gã' },
  ee: { code: 'ee', name: 'Ewe', nativeName: 'Eʋegbe' },
  ha: { code: 'ha', name: 'Hausa', nativeName: 'هَوُسَ' },
} as const;

export type LanguageCode = keyof typeof SUPPORTED_LANGUAGES;
