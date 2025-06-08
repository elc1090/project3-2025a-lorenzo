// lib/useCategories.ts

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase"; // Your Firestore instance

export default function useCategories(userId: string) {
  const [categories, setCategories] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setCategories([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "categories"),
      where("userId", "==", userId),
      //orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(cats);
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to fetch categories");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  return { categories, loading, error };
}
