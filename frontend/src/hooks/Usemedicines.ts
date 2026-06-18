// ─── src/hooks/Usemedicines.ts ───────────────────────────────────────────────
// Pure local state — no backend, no Firestore.
// Everything works immediately on device.

import { useState, useCallback } from "react";
import { Medicine } from "../navigation/types";

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getTodayKey = (): string =>
  new Date().toISOString().slice(0, 10);

export const getTodayIndex = (): number => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

// ── Hook return type ──────────────────────────────────────────────────────────
export interface UseMedicinesReturn {
  medicines:      Medicine[];
  loading:        boolean;
  addMedicine:    (med: Omit<Medicine, "id" | "taken" | "notifIds">) => Promise<void>;
  updateMedicine: (med: Medicine) => Promise<void>;
  deleteMedicine: (id: string | number) => Promise<void>;
  markTaken:      (id: string | number) => Promise<void>;
  toggleDay:      (id: string | number, dayIndex: number) => Promise<void>;
  refetch:        () => Promise<void>;
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useMedicines(): UseMedicinesReturn {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading]                 = useState(false);

  // ── Add ───────────────────────────────────────────────────────────────────
  const addMedicine = useCallback(
    async (med: Omit<Medicine, "id" | "taken" | "notifIds">): Promise<void> => {
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

  // ── Update ────────────────────────────────────────────────────────────────
  const updateMedicine = useCallback(
    async (updated: Medicine): Promise<void> => {
      setMedicines(prev =>
        prev.map(m => m.id.toString() === updated.id.toString() ? updated : m)
      );
    },
    []
  );

  // ── Delete ────────────────────────────────────────────────────────────────
  const deleteMedicine = useCallback(
    async (id: string | number): Promise<void> => {
      setMedicines(prev =>
        prev.filter(m => m.id.toString() !== id.toString())
      );
    },
    []
  );

  // ── Mark today as taken ───────────────────────────────────────────────────
  const markTaken = useCallback(
    async (id: string | number): Promise<void> => {
      const todayIdx = getTodayIndex();
      setMedicines(prev =>
        prev.map(m => {
          if (m.id.toString() !== id.toString()) return m;
          const taken = [...m.taken];
          taken[todayIdx] = true;
          return { ...m, taken, stock: Math.max(0, m.stock - 1) };
        })
      );
    },
    []
  );

  // ── Toggle any day ────────────────────────────────────────────────────────
  const toggleDay = useCallback(
    async (id: string | number, dayIndex: number): Promise<void> => {
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
    },
    []
  );

  // ── Refetch (no-op, local state) ──────────────────────────────────────────
  const refetch = useCallback(async (): Promise<void> => {}, []);

  return {
    medicines,
    loading,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    markTaken,
    toggleDay,
    refetch,
  };
}