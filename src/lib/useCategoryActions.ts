// lib/useCategoryActions.ts

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function useCategoryActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCategory = async (id: string, data: { name: string }) => {
    setLoading(true);
    setError(null);
    try {
      const categoryRef = doc(db, "categories", id);
      await updateDoc(categoryRef, data);
    } catch (e: any) {
      setError(e.message || "Failed to update category.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const categoryRef = doc(db, "categories", id);
      await deleteDoc(categoryRef);
    } catch (e: any) {
      setError(e.message || "Failed to delete category.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateCategory,
    deleteCategory,
  };
}