// ─── src/context/MedicineContext.tsx ─────────────────────────────────────────

import React, { createContext, useContext, useState, useCallback } from "react";
import { Medicine } from "../navigation/types";
import { getAuth } from "@react-native-firebase/auth";
import {
  getMyMedicines,
  createMedicine,
  updateMedicineById,
  deleteMedicineById,
} from "../services/api";

const getTodayIndex = (): number => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

interface MedicineContextType {
  medicines:      Medicine[];
  loading:        boolean;
  addMedicine:    (med: Omit<Medicine, "id" | "taken" | "notifIds">) => Promise<void>;
  updateMedicine: (med: Medicine) => Promise<void>;
  deleteMedicine: (id: string | number) => Promise<void>;
  markTaken:      (id: string | number) => Promise<void>;
  toggleDay:      (id: string | number, dayIndex: number) => Promise<void>;
  refetch:        () => Promise<void>;
}

const MedicineContext = createContext<MedicineContextType | null>(null);

export const MedicineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async (): Promise<void> => {
    const user = getAuth().currentUser;
    if (!user) {
      setMedicines([]);
      return;
    }
    setLoading(true);
    try {
      const list = await getMyMedicines();
      setMedicines(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Fetch medicines failed:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMedicine = useCallback(
    async (med: Omit<Medicine, "id" | "taken" | "notifIds">): Promise<void> => {
      try {
        const response = await createMedicine({
          ...med,
          taken: Array(7).fill(false),
        });
        const created = response?.medicine;
        if (created) setMedicines((prev) => [created, ...prev]);
        else await refetch();
      } catch (error) {
        console.error("Create medicine failed:", error);
      }
    },
    [refetch]
  );

  const updateMedicine = useCallback(async (updated: Medicine): Promise<void> => {
    try {
      const response = await updateMedicineById(updated.id, updated);
      const saved = response?.medicine || updated;
      setMedicines((prev) =>
        prev.map((m) => (m.id.toString() === saved.id.toString() ? saved : m)),
      );
    } catch (error) {
      console.error("Update medicine failed:", error);
    }
  }, []);

  const deleteMedicine = useCallback(async (id: string | number): Promise<void> => {
    try {
      await deleteMedicineById(id);
      setMedicines((prev) => prev.filter((m) => m.id.toString() !== id.toString()));
    } catch (error) {
      console.error("Delete medicine failed:", error);
    }
  }, []);

  const markTaken = useCallback(async (id: string | number): Promise<void> => {
    const todayIdx = getTodayIndex();
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id.toString() !== id.toString()) return m;
        const taken = [...m.taken];
        taken[todayIdx] = true;
        const updated = { ...m, taken, stock: Math.max(0, m.stock - 1) };
        updateMedicineById(updated.id, updated).catch((error) =>
          console.error("Mark taken sync failed:", error),
        );
        return updated;
      }),
    );
  }, []);

  const toggleDay = useCallback(async (id: string | number, dayIndex: number): Promise<void> => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id.toString() !== id.toString()) return m;
        const taken    = [...m.taken];
        const wasTaken = taken[dayIndex];
        taken[dayIndex] = !wasTaken;
        const updated = {
          ...m,
          taken,
          stock: wasTaken ? m.stock + 1 : Math.max(0, m.stock - 1),
        };
        updateMedicineById(updated.id, updated).catch((error) =>
          console.error("Toggle day sync failed:", error),
        );
        return updated;
      }),
    );
  }, []);

  return (
    <MedicineContext.Provider value={{
      medicines,
      loading,
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