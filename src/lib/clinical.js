import { FEVER_THRESHOLD, FEVER_FREE_DAYS_REQUIRED } from './constants';

export const todayStr = () => new Date().toISOString().split('T')[0];

export const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
};

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const daysBetween = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
};

// Has the patient had their temperature recorded today?
export const hasTempToday = (patient) =>
  patient.temps.some((t) => t.date === todayStr());

// Has the doctor visited today?
export const hasVisitToday = (patient) =>
  patient.visits.includes(todayStr());

// Get the patient's temperature for a given date (or null)
export const getTempForDate = (patient, date) => {
  const t = patient.temps.find((x) => x.date === date);
  return t ? t.value : null;
};

// Count consecutive fever-free days working backwards from the most recent
// recorded temperature. Used to check discharge eligibility.
export const consecutiveFeverFreeDays = (patient) => {
  if (patient.temps.length === 0) return 0;
  const sorted = [...patient.temps].sort((a, b) => b.date.localeCompare(a.date));
  let count = 0;
  for (const t of sorted) {
    if (t.value < FEVER_THRESHOLD) count++;
    else break;
  }
  return count;
};

// Is the patient eligible for discharge?
export const isDischargeEligible = (patient) =>
  consecutiveFeverFreeDays(patient) >= FEVER_FREE_DAYS_REQUIRED &&
  patient.status === 'admitted';

// How many days until eligible? (for doctor UI)
export const daysUntilEligible = (patient) => {
  const streak = consecutiveFeverFreeDays(patient);
  return Math.max(0, FEVER_FREE_DAYS_REQUIRED - streak);
};

export const isFever = (temp) => temp >= FEVER_THRESHOLD;
