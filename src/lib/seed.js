import { daysAgo, todayStr } from './clinical';

// Seed patients demonstrate every clinical state the UI must handle:
// - Fresh admission, no temp yet today
// - Fever, still being treated
// - Near discharge (streak of 2 fever-free days)
// - Eligible for discharge (streak of 3+)
// - Already flagged by doctor, waiting for admin
// - Discharged (history)
export const seedPatients = [
  {
    id: 'P1041', name: 'Aarav Sharma', age: 34, room: '12A',
    admittedOn: daysAgo(5), status: 'admitted',
    temps: [
      { date: daysAgo(5), value: 102.3, recordedBy: 'N. Priya', time: '09:15' },
      { date: daysAgo(4), value: 101.1, recordedBy: 'N. Priya', time: '08:50' },
      { date: daysAgo(3), value: 99.8, recordedBy: 'N. Rohan', time: '09:20' },
      { date: daysAgo(2), value: 99.2, recordedBy: 'N. Priya', time: '09:05' },
      { date: daysAgo(1), value: 98.8, recordedBy: 'N. Rohan', time: '08:45' },
    ],
    visits: [daysAgo(5), daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1)],
    notes: [{ date: daysAgo(1), doctor: 'Dr. Mehta', text: 'Recovering well. Monitor one more day.' }],
    dischargeFlagged: false,
  },
  {
    id: 'P1042', name: 'Priya Nair', age: 28, room: '05B',
    admittedOn: daysAgo(8), status: 'admitted',
    temps: [
      { date: daysAgo(8), value: 103.5, recordedBy: 'N. Rohan', time: '10:00' },
      { date: daysAgo(7), value: 102.9, recordedBy: 'N. Priya', time: '09:30' },
      { date: daysAgo(6), value: 100.1, recordedBy: 'N. Rohan', time: '09:15' },
      { date: daysAgo(5), value: 99.4, recordedBy: 'N. Priya', time: '08:55' },
      { date: daysAgo(4), value: 99.1, recordedBy: 'N. Rohan', time: '09:10' },
      { date: daysAgo(3), value: 98.9, recordedBy: 'N. Priya', time: '09:00' },
      { date: daysAgo(2), value: 98.7, recordedBy: 'N. Rohan', time: '08:40' },
      { date: daysAgo(1), value: 98.6, recordedBy: 'N. Priya', time: '09:25' },
    ],
    visits: [daysAgo(8), daysAgo(7), daysAgo(6), daysAgo(5), daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1)],
    notes: [
      { date: daysAgo(3), doctor: 'Dr. Mehta', text: 'Fever subsiding. Likely discharge candidate by end of week.' },
    ],
    dischargeFlagged: true, // Flagged, waiting for admin
    dischargeFlaggedBy: 'Dr. Mehta',
    dischargeFlaggedOn: daysAgo(1),
  },
  {
    id: 'P1043', name: 'Karan Verma', age: 42, room: '18C',
    admittedOn: daysAgo(2), status: 'admitted',
    temps: [
      { date: daysAgo(2), value: 103.8, recordedBy: 'N. Priya', time: '11:00' },
      { date: daysAgo(1), value: 103.2, recordedBy: 'N. Rohan', time: '09:45' },
    ],
    visits: [daysAgo(2), daysAgo(1)],
    notes: [{ date: daysAgo(1), doctor: 'Dr. Kapoor', text: 'Started antivirals. High fever persisting.' }],
    dischargeFlagged: false,
  },
  {
    id: 'P1044', name: 'Ananya Iyer', age: 31, room: '22A',
    admittedOn: daysAgo(1), status: 'admitted',
    temps: [], // No temp recorded yet today — shows up in nurse's queue
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },
  {
    id: 'P1045', name: 'Rohit Gupta', age: 56, room: '08D',
    admittedOn: daysAgo(4), status: 'admitted',
    temps: [
      { date: daysAgo(4), value: 102.1, recordedBy: 'N. Rohan', time: '10:15' },
      { date: daysAgo(3), value: 101.5, recordedBy: 'N. Priya', time: '09:00' },
      { date: daysAgo(2), value: 99.9, recordedBy: 'N. Rohan', time: '08:30' },
      { date: daysAgo(1), value: 99.3, recordedBy: 'N. Priya', time: '09:10' },
      { date: todayStr(), value: 99.1, recordedBy: 'N. Priya', time: '09:05' },
    ],
    visits: [daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1)], // Temp done today, doctor visit pending
    notes: [],
    dischargeFlagged: false,
  },
  {
    id: 'P1046', name: 'Meera Joshi', age: 39, room: '14B',
    admittedOn: daysAgo(6), status: 'admitted',
    temps: [
      { date: daysAgo(6), value: 102.8, recordedBy: 'N. Priya', time: '09:20' },
      { date: daysAgo(5), value: 101.9, recordedBy: 'N. Rohan', time: '08:45' },
      { date: daysAgo(4), value: 99.6, recordedBy: 'N. Priya', time: '09:00' },
      { date: daysAgo(3), value: 99.2, recordedBy: 'N. Rohan', time: '09:30' },
      { date: daysAgo(2), value: 98.9, recordedBy: 'N. Priya', time: '08:50' },
      { date: daysAgo(1), value: 98.7, recordedBy: 'N. Rohan', time: '09:15' },
    ],
    visits: [daysAgo(6), daysAgo(5), daysAgo(4), daysAgo(3), daysAgo(2), daysAgo(1)],
    notes: [],
    dischargeFlagged: false, // 3-day streak complete — should be flagged
  },
  // Historical: a discharged patient (for mortality/success tracking)
  {
    id: 'P1038', name: 'Vikram Singh', age: 45, room: '—',
    admittedOn: daysAgo(15), status: 'discharged',
    dischargedOn: daysAgo(2),
    temps: [],
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },
  // Historical: a deceased patient
  {
    id: 'P1032', name: 'Lakshmi Pillai', age: 67, room: '—',
    admittedOn: daysAgo(20), status: 'deceased',
    deceasedOn: daysAgo(10),
    temps: [],
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },
];

export const seedUsers = [
  { id: 'U1', name: 'Priya Sharma', role: 'nurse', avatar: 'PS' },
  { id: 'U2', name: 'Rajesh Mehta', role: 'doctor', avatar: 'RM' },
  { id: 'U3', name: 'Sunita Rao', role: 'admin', avatar: 'SR' },
  { id: 'U4', name: 'Dr. Anil Kapoor', role: 'head_doctor', avatar: 'AK' },
];
