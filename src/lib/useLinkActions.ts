// lib/useLinkActions.ts

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebase";

export default function useLinkActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateLink = async (
    id: string,
    data: { url?: string; title?: string; categoryId?: string }
  ) => {
    setLoading(true);
    setError(null);
    try {
      const linkRef = doc(db, "links", id);
      await updateDoc(linkRef, data);
    } catch (e: any) {
      setError(e.message || "Failed to update link.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const deleteLink = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const linkRef = doc(db, "links", id);
      await deleteDoc(linkRef);
    } catch (e: any) {
      setError(e.message || "Failed to delete link.");
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    updateLink,
    deleteLink,
  };
}