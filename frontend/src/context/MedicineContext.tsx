// ─── src/context/MedicineContext.tsx ─────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback } from "react";
import { Medicine } from "../navigation/types";

const getTodayIndex = (): number => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

interface MedicineContextType {
  medicines:      Medicine[];
  loading:        boolean;
  addMedicine:    (med: Omit<Medicine, "id" | "taken" | "notifIds">) => void;
  updateMedicine: (med: Medicine) => void;
  deleteMedicine: (id: string | number) => void;
  markTaken:      (id: string | number) => void;
  toggleDay:      (id: string | number, dayIndex: number) => void;
  refetch:        () => void;
}

const MedicineContext = createContext<MedicineContextType | null>(null);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const addMedicine = useCallback(
    (med: Omit<Medicine, "id" | "taken" | "notifIds">): void => {
      const newMed: Medicine = {
        ...med,
        id:       Date.now().toString(),
        taken:    Array(7).fill(false) as boolean[],
        notifIds: [],
      };
      setMedicines(prev => [...prev, newMed]);
    },
    []
  );

  const updateMedicine = useCallback((updated: Medicine): void => {
    setMedicines(prev =>
      prev.map(m => m.id.toString() === updated.id.toString() ? updated : m)
    );
  }, []);

  const deleteMedicine = useCallback((id: string | number): void => {
    setMedicines(prev => prev.filter(m => m.id.toString() !== id.toString()));
  }, []);

  const markTaken = useCallback((id: string | number): void => {
    const todayIdx = getTodayIndex();
    setMedicines(prev =>
      prev.map(m => {
        if (m.id.toString() !== id.toString()) return m;
        const taken = [...m.taken];
        taken[todayIdx] = true;
        return { ...m, taken, stock: Math.max(0, m.stock - 1) };
      })
    );
  }, []);

  const toggleDay = useCallback((id: string | number, dayIndex: number): void => {
    setMedicines(prev =>
      prev.map(m => {
        if (m.id.toString() !== id.toString()) return m;
        const taken    = [...m.taken];
        const wasTaken = taken[dayIndex];
        taken[dayIndex] = !wasTaken;
        return {
          ...m,
          taken,
          stock: wasTaken ? m.stock + 1 : Math.max(0, m.stock - 1),
        };
      })
    );
  }, []);

  const refetch = useCallback((): void => {}, []);

  return (
    <MedicineContext.Provider value={{
      medicines,
      loading: false,
      addMedicine,
      updateMedicine,
      deleteMedicine,
      markTaken,
      toggleDay,
      refetch,
    }}>
      {children}
    </MedicineContext.Provider>
  );
};

export const useMedicines = (): MedicineContextType => {
  const ctx = useContext(MedicineContext);
  if (!ctx) throw new Error("useMedicines must be used inside <MedicineProvider>");
  return ctx;
};