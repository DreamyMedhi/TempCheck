import { todayStr } from "./clinical";

export const STAFFING_TODAY = {
  date: todayStr(),
  roster: [
    {
      id: "N01",
      name: "Priya Sharma",
      role: "nurse",
      shift: "Day",
      start: "07:00",
      end: "15:00",
      status: "on_shift",
    },
    {
      id: "N02",
      name: "Rohan Desai",
      role: "nurse",
      shift: "Day",
      start: "07:00",
      end: "15:00",
      status: "on_shift",
    },
    {
      id: "N03",
      name: "Anita Krishnan",
      role: "nurse",
      shift: "Day",
      start: "07:00",
      end: "15:00",
      status: "on_shift",
    },
    {
      id: "N04",
      name: "Vikas Menon",
      role: "nurse",
      shift: "Evening",
      start: "15:00",
      end: "23:00",
      status: "on_shift",
    },
    {
      id: "N05",
      name: "Suman Rao",
      role: "nurse",
      shift: "Evening",
      start: "15:00",
      end: "23:00",
      status: "on_shift",
    },
    {
      id: "N06",
      name: "Kavita Patel",
      role: "nurse",
      shift: "Night",
      start: "23:00",
      end: "07:00",
      status: "on_shift",
    },

    // Nurses not available today
    {
      id: "N07",
      name: "Deepa Iyer",
      role: "nurse",
      shift: "—",
      start: null,
      end: null,
      status: "on_leave",
      reason: "Approved annual leave (returns Apr 28)",
    },
    {
      id: "N08",
      name: "Manish Joshi",
      role: "nurse",
      shift: "—",
      start: null,
      end: null,
      status: "off_today",
      reason: "Scheduled rest day",
    },

    // Doctors on shift
    {
      id: "D01",
      name: "Dr. Rajesh Mehta",
      role: "doctor",
      shift: "Day",
      start: "08:00",
      end: "16:00",
      status: "on_shift",
    },
    {
      id: "D02",
      name: "Dr. Anil Kapoor",
      role: "doctor",
      shift: "Day",
      start: "08:00",
      end: "16:00",
      status: "on_shift",
    },
    {
      id: "D03",
      name: "Dr. Neha Bansal",
      role: "doctor",
      shift: "Evening",
      start: "16:00",
      end: "00:00",
      status: "on_shift",
    },

    // Doctor off today (creating a coverage gap)
    {
      id: "D04",
      name: "Dr. Sameer Khan",
      role: "doctor",
      shift: "—",
      start: null,
      end: null,
      status: "off_today",
      reason: "Scheduled rest day",
    },
    {
      id: "D05",
      name: "Dr. Pooja Verma",
      role: "doctor",
      shift: "—",
      start: null,
      end: null,
      status: "on_leave",
      reason: "Sick leave (returns Apr 26)",
    },
  ],
};

export const STAFFING_BENCHMARKS = {
  patientsPerNurse: 6,
  patientsPerDoctor: 25,
};
