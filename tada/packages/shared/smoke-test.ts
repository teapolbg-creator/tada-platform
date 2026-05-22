import {
  formatCurrency,
  pesewasToCedis,
  cedisToPesewas,
  normalizeGhanaPhone,
  detectMobileNetwork,
  formatPhoneForDisplay,
  isValidTripTransition,
  isActiveStatus,
  isTerminalStatus,
  resolveTriagePriority,
  formatDuration,
  formatETA,
  formatDistance,
  haversineDistanceMeters,
  makeGeoPoint,
  createTripSchema,
  patientProfileSchema,
  initiateMomoPaymentSchema,
  parseMomoNumber,
  PRIORITY_LABELS,
  GHANA,
} from './src/index.js';

const tests: Array<{ name: string; pass: boolean; got?: unknown; want?: unknown }> = [];

function check(name: string, got: unknown, want: unknown) {
  const pass = JSON.stringify(got) === JSON.stringify(want);
  tests.push({ name, pass, got, want });
}

// Currency
check('formatCurrency(30000)', formatCurrency(30000), 'GH₵300.00');
check('formatCurrency(15050)', formatCurrency(15050), 'GH₵150.50');
check('formatCurrency(0)', formatCurrency(0), 'GH₵0.00');
check('pesewasToCedis(30000)', pesewasToCedis(30000), 300);
check('cedisToPesewas(300)', cedisToPesewas(300), 30000);
check('cedisToPesewas(15.50)', cedisToPesewas(15.50), 1550);

// Phone
check('normalizeGhanaPhone("024 123 4567")', normalizeGhanaPhone('024 123 4567'), '+233241234567');
check('normalizeGhanaPhone("+233 24 123 4567")', normalizeGhanaPhone('+233 24 123 4567'), '+233241234567');
check('normalizeGhanaPhone("233241234567")', normalizeGhanaPhone('233241234567'), '+233241234567');
check('normalizeGhanaPhone("invalid")', normalizeGhanaPhone('invalid'), null);
check('detectMobileNetwork("+233241234567")', detectMobileNetwork('+233241234567'), 'mtn');
check('detectMobileNetwork("+233201234567")', detectMobileNetwork('+233201234567'), 'vodafone');
check('detectMobileNetwork("+233271234567")', detectMobileNetwork('+233271234567'), 'airteltigo');
check('formatPhoneForDisplay("+233241234567")', formatPhoneForDisplay('+233241234567'), '+233 24 123 4567');

// Trip transitions
check('valid: requested -> dispatching', isValidTripTransition('requested', 'dispatching'), true);
check('invalid: requested -> completed', isValidTripTransition('requested', 'completed'), false);
check('valid: arrived_at_hospital -> completed', isValidTripTransition('arrived_at_hospital', 'completed'), true);
check('isActiveStatus(en_route_to_pickup)', isActiveStatus('en_route_to_pickup'), true);
check('isTerminalStatus(completed)', isTerminalStatus('completed'), true);
check('isActiveStatus(completed)', isActiveStatus('completed'), false);

// Triage
check(
  'triage: unconscious patient',
  resolveTriagePriority({ isConscious: false }).priority,
  'critical'
);
check(
  'triage: stroke + conscious',
  resolveTriagePriority({ emergencyType: 'stroke', isConscious: true }).priority,
  'critical'
);
check(
  'triage: other + conscious',
  resolveTriagePriority({ emergencyType: 'other', isConscious: true }).priority,
  'standard'
);
check(
  'triage: other + severe bleeding',
  resolveTriagePriority({
    emergencyType: 'other',
    isConscious: true,
    bleedingSeverity: 'severe',
  }).priority,
  'urgent'
);

// Time
check('formatDuration(45)', formatDuration(45), '45 sec');
check('formatDuration(90)', formatDuration(90), '2 min');
check('formatDuration(3900)', formatDuration(3900), '1 hr 5 min');
check('formatETA(5)', formatETA(5), 'Arriving now');
check('formatETA(30)', formatETA(30), '<1 min');
check('formatETA(180)', formatETA(180), '3 min');

// Distance
check('formatDistance(50)', formatDistance(50), '50 m');
check('formatDistance(1500)', formatDistance(1500), '1.5 km');
check('formatDistance(15000)', formatDistance(15000), '15 km');

// Haversine: roughly 5km between two Tema points
const temaGeneral = makeGeoPoint(5.6667, 0.0167);
const narhBita = makeGeoPoint(5.6300, -0.0140);
const distance = haversineDistanceMeters(temaGeneral, narhBita);
tests.push({
  name: 'haversine Tema General to Narh-Bita (should be ~5km)',
  pass: distance > 4000 && distance < 6000,
  got: `${Math.round(distance)}m`,
});

// Zod: createTripSchema
const validTripInput = {
  pickupLocation: { latitude: 5.6667, longitude: 0.0167 },
  isThirdPartyRequest: false,
};
const tripParse = createTripSchema.safeParse(validTripInput);
check('createTripSchema accepts valid input', tripParse.success, true);

const invalidThirdParty = {
  pickupLocation: { latitude: 5.6667, longitude: 0.0167 },
  isThirdPartyRequest: true,
  // missing thirdPartyPhone
};
const badParse = createTripSchema.safeParse(invalidThirdParty);
check('createTripSchema rejects third-party without phone', badParse.success, false);

// Zod: patientProfileSchema
const validPatient = patientProfileSchema.safeParse({
  fullName: 'Kofi Mensah',
  emergencyContacts: [{ name: 'Ama', relationship: 'sister', phone: '0241234567' }],
});
check('patientProfileSchema normalises emergency contact phone', 
  validPatient.success && validPatient.data.emergencyContacts[0]?.phone,
  '+233241234567'
);

// Zod: payment
const paymentResult = initiateMomoPaymentSchema.safeParse({
  tripId: '00000000-0000-0000-0000-000000000000',
  momoNumber: '0241234567',
  amountPesewas: 30000,
});
check('initiateMomoPaymentSchema normalises momoNumber', 
  paymentResult.success && paymentResult.data.momoNumber,
  '+233241234567'
);

// MoMo helper
const { e164, network } = parseMomoNumber('024 123 4567');
check('parseMomoNumber e164', e164, '+233241234567');
check('parseMomoNumber network', network, 'mtn');

// Constants
check('GHANA.currencySymbol', GHANA.currencySymbol, 'GH₵');
check('PRIORITY_LABELS.critical', PRIORITY_LABELS.critical, 'Critical');

// Report
let passed = 0;
let failed = 0;
for (const t of tests) {
  if (t.pass) passed++;
  else {
    failed++;
    console.log(`FAIL  ${t.name}`);
    console.log(`      got:  ${JSON.stringify(t.got)}`);
    console.log(`      want: ${JSON.stringify(t.want)}`);
  }
}
console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
