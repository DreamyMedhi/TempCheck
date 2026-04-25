import { createContext, useContext, useState, useCallback } from 'react';
import { seedPatients, seedUsers } from '../lib/seed';
import { todayStr } from '../lib/clinical';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [patients, setPatients] = useState(seedPatients);
  const [users] = useState(seedUsers);
  const [currentUser, setCurrentUser] = useState(null); // Set via login screen
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3200);
  }, []);

  // ---------- Nurse: record temperature ----------
  const recordTemperature = useCallback((patientId, value, overrideExisting = false) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const existing = p.temps.find((t) => t.date === todayStr());
        if (existing && !overrideExisting) return p; // guard — UI should ask first
        const newTemps = existing
          ? p.temps.map((t) =>
              t.date === todayStr()
                ? { ...t, value, recordedBy: currentUser?.name || 'Nurse', time: currentTime(), corrected: true }
                : t,
            )
          : [
              ...p.temps,
              { date: todayStr(), value, recordedBy: currentUser?.name || 'Nurse', time: currentTime() },
            ];
        return { ...p, temps: newTemps };
      }),
    );
  }, [currentUser]);

  // ---------- Doctor: mark visit complete ----------
  const markVisitComplete = useCallback((patientId) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId && !p.visits.includes(todayStr())
          ? { ...p, visits: [...p.visits, todayStr()] }
          : p,
      ),
    );
  }, []);

  // ---------- Doctor: add clinical note ----------
  const addNote = useCallback((patientId, text) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? { ...p, notes: [...p.notes, { date: todayStr(), doctor: currentUser?.name || 'Doctor', text }] }
          : p,
      ),
    );
  }, [currentUser]);

  // ---------- Doctor: flag for discharge ----------
  const flagForDischarge = useCallback((patientId) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId
          ? {
              ...p,
              dischargeFlagged: true,
              dischargeFlaggedBy: currentUser?.name || 'Doctor',
              dischargeFlaggedOn: todayStr(),
            }
          : p,
      ),
    );
  }, [currentUser]);

  // ---------- Doctor: mark deceased ----------
  const markDeceased = useCallback((patientId) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, status: 'deceased', deceasedOn: todayStr() } : p,
      ),
    );
  }, []);

  // ---------- Admin: execute discharge ----------
  const executeDischarge = useCallback((patientId) => {
    setPatients((prev) =>
      prev.map((p) =>
        p.id === patientId ? { ...p, status: 'discharged', dischargedOn: todayStr() } : p,
      ),
    );
  }, []);

  // ---------- Admin: admit new patient ----------
  const admitPatient = useCallback((data) => {
    const newId = 'P' + (1050 + patients.length);
    setPatients((prev) => [
      ...prev,
      {
        id: newId, name: data.name, age: Number(data.age), room: data.room,
        admittedOn: todayStr(), status: 'admitted',
        temps: [], visits: [], notes: [], dischargeFlagged: false,
      },
    ]);
    return newId;
  }, [patients]);

  const value = {
    patients, users, currentUser, setCurrentUser,
    toast, showToast,
    recordTemperature, markVisitComplete, addNote,
    flagForDischarge, markDeceased, executeDischarge, admitPatient,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);

function currentTime() {
  return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}
