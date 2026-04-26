import { daysAgo, todayStr } from "./clinical";

// Seed data tuned for the demo — every role gets a realistic mix of patients
// in different clinical states so the UI exercises every flow.
export const seedPatients = [
  // ----- Active patients for the demo -----

  // Doctor's queue: ready for visit (temp done today, no visit yet, fever active so not eligible)
  {
    id: "P1041",
    name: "Aarav Sharma",
    age: 34,
    room: "12A",
    admittedOn: daysAgo(3),
    status: "admitted",
    assignedNurse: "Priya Sharma",
    assignedDoctor: "Dr. Rajesh Mehta",
    temps: [
      {
        date: daysAgo(3),
        value: 102.3,
        recordedBy: "Priya Sharma",
        time: "09:15",
      },
      {
        date: daysAgo(2),
        value: 101.8,
        recordedBy: "Priya Sharma",
        time: "08:50",
      },
      {
        date: daysAgo(1),
        value: 101.1,
        recordedBy: "Rohan Desai",
        time: "09:20",
      },
      {
        date: todayStr(),
        value: 100.6,
        recordedBy: "Priya Sharma",
        time: "09:00",
      },
    ],
    visits: [daysAgo(3), daysAgo(2), daysAgo(1)],
    notes: [
      {
        date: daysAgo(1),
        doctor: "Dr. Rajesh Mehta",
        text: "Fever slowly subsiding. Continue current treatment.",
      },
    ],
    dischargeFlagged: false,
  },

  // Nurse's queue: needs temperature today (no temp yet)
  {
    id: "P1043",
    name: "Karan Verma",
    age: 42,
    room: "18C",
    admittedOn: daysAgo(2),
    status: "admitted",
    assignedNurse: "Priya Sharma",
    assignedDoctor: "Dr. Rajesh Mehta",
    temps: [
      {
        date: daysAgo(2),
        value: 103.8,
        recordedBy: "Priya Sharma",
        time: "11:00",
      },
      {
        date: daysAgo(1),
        value: 103.2,
        recordedBy: "Rohan Desai",
        time: "09:45",
      },
    ],
    visits: [daysAgo(2), daysAgo(1)],
    notes: [
      {
        date: daysAgo(1),
        doctor: "Dr. Rajesh Mehta",
        text: "Started antivirals. High fever persisting — monitor closely.",
      },
    ],
    dischargeFlagged: false,
  },

  // Nurse's queue: fresh admission, no temp yet, no visit yet
  {
    id: "P1044",
    name: "Ananya Iyer",
    age: 31,
    room: "22A",
    admittedOn: daysAgo(1),
    status: "admitted",
    assignedNurse: "Priya Sharma",
    assignedDoctor: "Dr. Anil Kapoor",
    temps: [],
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },

  // Doctor's queue: temp done today, no visit yet, fever active (so not eligible)
  {
    id: "P1047",
    name: "Devika Menon",
    age: 47,
    room: "09B",
    admittedOn: daysAgo(2),
    status: "admitted",
    assignedNurse: "Rohan Desai",
    assignedDoctor: "Dr. Rajesh Mehta",
    temps: [
      {
        date: daysAgo(2),
        value: 102.7,
        recordedBy: "Rohan Desai",
        time: "10:30",
      },
      {
        date: daysAgo(1),
        value: 101.4,
        recordedBy: "Priya Sharma",
        time: "09:00",
      },
      {
        date: todayStr(),
        value: 100.9,
        recordedBy: "Rohan Desai",
        time: "08:45",
      },
    ],
    visits: [daysAgo(2), daysAgo(1)],
    notes: [],
    dischargeFlagged: false,
  },

  // Nurse's queue: needs temperature, fever yesterday so not yet eligible
  {
    id: "P1048",
    name: "Sanjay Gupta",
    age: 38,
    room: "15C",
    admittedOn: daysAgo(3),
    status: "admitted",
    assignedNurse: "Rohan Desai",
    assignedDoctor: "Dr. Anil Kapoor",
    temps: [
      {
        date: daysAgo(3),
        value: 102.9,
        recordedBy: "Priya Sharma",
        time: "09:30",
      },
      {
        date: daysAgo(2),
        value: 102.1,
        recordedBy: "Rohan Desai",
        time: "09:00",
      },
      {
        date: daysAgo(1),
        value: 100.8,
        recordedBy: "Priya Sharma",
        time: "08:50",
      },
    ],
    visits: [daysAgo(3), daysAgo(2), daysAgo(1)],
    notes: [],
    dischargeFlagged: false,
  },

  // Doctor's queue: visited today (so it shows in "Visited Today" section)
  {
    id: "P1049",
    name: "Reema Banerjee",
    age: 29,
    room: "11D",
    admittedOn: daysAgo(2),
    status: "admitted",
    assignedNurse: "Priya Sharma",
    assignedDoctor: "Dr. Rajesh Mehta",
    temps: [
      {
        date: daysAgo(2),
        value: 102.0,
        recordedBy: "Priya Sharma",
        time: "10:15",
      },
      {
        date: daysAgo(1),
        value: 101.2,
        recordedBy: "Rohan Desai",
        time: "09:00",
      },
      {
        date: todayStr(),
        value: 100.5,
        recordedBy: "Priya Sharma",
        time: "08:30",
      },
    ],
    visits: [daysAgo(2), daysAgo(1), todayStr()],
    notes: [
      {
        date: todayStr(),
        doctor: "Dr. Rajesh Mehta",
        text: "Improving steadily. Likely discharge candidate by end of week.",
      },
    ],
    dischargeFlagged: false,
  },

  // ----- Already in the discharge pipeline -----

  // Flagged for discharge — visible only in the Discharge Queue (Doctor / Head Doctor)
  {
    id: "P1042",
    name: "Priya Nair",
    age: 28,
    room: "05B",
    admittedOn: daysAgo(7),
    status: "admitted",
    assignedNurse: "Priya Sharma",
    assignedDoctor: "Dr. Rajesh Mehta",
    temps: [
      {
        date: daysAgo(7),
        value: 103.5,
        recordedBy: "Rohan Desai",
        time: "10:00",
      },
      {
        date: daysAgo(6),
        value: 102.9,
        recordedBy: "Priya Sharma",
        time: "09:30",
      },
      {
        date: daysAgo(5),
        value: 100.1,
        recordedBy: "Rohan Desai",
        time: "09:15",
      },
      {
        date: daysAgo(4),
        value: 99.4,
        recordedBy: "Priya Sharma",
        time: "08:55",
      },
      {
        date: daysAgo(3),
        value: 99.1,
        recordedBy: "Rohan Desai",
        time: "09:10",
      },
      {
        date: daysAgo(2),
        value: 98.9,
        recordedBy: "Priya Sharma",
        time: "09:00",
      },
      {
        date: daysAgo(1),
        value: 98.7,
        recordedBy: "Rohan Desai",
        time: "08:40",
      },
    ],
    visits: [
      daysAgo(7),
      daysAgo(6),
      daysAgo(5),
      daysAgo(4),
      daysAgo(3),
      daysAgo(2),
      daysAgo(1),
    ],
    notes: [
      {
        date: daysAgo(2),
        doctor: "Dr. Rajesh Mehta",
        text: "Fever subsiding. Likely discharge candidate by end of week.",
      },
    ],
    dischargeFlagged: true,
    dischargeFlaggedBy: "Dr. Rajesh Mehta",
    dischargeFlaggedOn: daysAgo(1),
  },

  // Eligible for discharge but not yet flagged — auto-flag will fire on next reading
  {
    id: "P1046",
    name: "Meera Joshi",
    age: 39,
    room: "14B",
    admittedOn: daysAgo(6),
    status: "admitted",
    assignedNurse: "Rohan Desai",
    assignedDoctor: "Dr. Anil Kapoor",
    temps: [
      {
        date: daysAgo(6),
        value: 102.8,
        recordedBy: "Priya Sharma",
        time: "09:20",
      },
      {
        date: daysAgo(5),
        value: 101.9,
        recordedBy: "Rohan Desai",
        time: "08:45",
      },
      {
        date: daysAgo(4),
        value: 99.6,
        recordedBy: "Priya Sharma",
        time: "09:00",
      },
      {
        date: daysAgo(3),
        value: 99.2,
        recordedBy: "Rohan Desai",
        time: "09:30",
      },
      {
        date: daysAgo(2),
        value: 98.9,
        recordedBy: "Priya Sharma",
        time: "08:50",
      },
      {
        date: daysAgo(1),
        value: 98.7,
        recordedBy: "Rohan Desai",
        time: "09:15",
      },
    ],
    visits: [
      daysAgo(6),
      daysAgo(5),
      daysAgo(4),
      daysAgo(3),
      daysAgo(2),
      daysAgo(1),
    ],
    notes: [],
    dischargeFlagged: true,
    dischargeFlaggedBy: "System (auto)",
    dischargeFlaggedOn: daysAgo(1),
  },

  // ----- Historical (closed) cases for the dashboard mortality math -----

  {
    id: "P1038",
    name: "Vikram Singh",
    age: 45,
    room: "—",
    admittedOn: daysAgo(15),
    status: "discharged",
    assignedNurse: null,
    assignedDoctor: null,
    dischargedOn: daysAgo(2),
    temps: [],
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },
  {
    id: "P1039",
    name: "Anita Krishnan",
    age: 52,
    room: "—",
    admittedOn: daysAgo(12),
    status: "discharged",
    assignedNurse: null,
    assignedDoctor: null,
    dischargedOn: daysAgo(4),
    temps: [],
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },
  {
    id: "P1040",
    name: "Rohit Khanna",
    age: 31,
    room: "—",
    admittedOn: daysAgo(10),
    status: "discharged",
    assignedNurse: null,
    assignedDoctor: null,
    dischargedOn: daysAgo(3),
    temps: [],
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },
  {
    id: "P1032",
    name: "Lakshmi Pillai",
    age: 67,
    room: "—",
    admittedOn: daysAgo(20),
    status: "deceased",
    assignedNurse: null,
    assignedDoctor: null,
    deceasedOn: daysAgo(10),
    temps: [],
    visits: [],
    notes: [],
    dischargeFlagged: false,
  },
];

export const seedUsers = [
  { id: "U1", name: "Priya Sharma", role: "nurse", avatar: "PS" },
  { id: "U2", name: "Dr. Rajesh Mehta", role: "doctor", avatar: "RM" },
  { id: "U3", name: "Sunita Rao", role: "admin", avatar: "SR" },
  { id: "U4", name: "Dr. Anil Kapoor", role: "head_doctor", avatar: "AK" },
];
