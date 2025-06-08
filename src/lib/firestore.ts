// lib/firestore.ts

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  deleteDoc,
  doc,
  Timestamp,
  updateDoc,
  DocumentSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase"; // your initialized Firestore instance

// Fetch categories for a user, ordered by creation date
export async function getCategories(userId: string) {
  const q = query(
    collection(db, "categories"),
    where("userId", "==", userId),
    //orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Add a new category for a user
export async function addCategory(name: string, userId: string) {
  const docRef = await addDoc(collection(db, "categories"), {
    name,
    userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// Fetch links for a user, optionally filtered by category, with pagination support
export async function getLinks(
  userId: string,
  categoryId?: string,
  pageSize = 10,
  startAfterDoc?: DocumentSnapshot | null
) {
  let q = query(
    collection(db, "links"),
    where("userId", "==", userId),
    //orderBy("createdAt", "desc")
  );

  if (categoryId) {
    q = query(
      collection(db, "links"),
      where("userId", "==", userId),
      where("categoryId", "==", categoryId),
      //orderBy("createdAt", "desc")
    );
  }

  q = query(q, limit(pageSize));

  if (startAfterDoc) {
    q = query(q, startAfter(startAfterDoc));
  }

  const snapshot = await getDocs(q);
  return {
    links: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
    lastDoc: snapshot.docs[snapshot.docs.length - 1] || null,
  };
}

// Add a new link for a user
export async function addLink(
  url: string,
  title: string,
  categoryId: string | null,
  userId: string
) {
  const docRef = await addDoc(collection(db, "links"), {
    url,
    title,
    categoryId,
    userId,
    createdAt: Timestamp.now(),
  });
  return docRef.id;
}

// Delete a link by id
export async function deleteLink(linkId: string) {
  await deleteDoc(doc(db, "links", linkId));
}

export async function updateCategory(id: string, data: { name: string }) {
  const categoryRef = doc(db, "categories", id);
  await updateDoc(categoryRef, data);
}

// When deleting a category, reassign all its links to 'all' (null categoryId)
export async function deleteCategory(categoryId: string) {
  const batch = writeBatch(db);

  // 1. Delete the category document
  const categoryRef = doc(db, "categories", categoryId);
  batch.delete(categoryRef);

  // 2. Find all links with this categoryId and update their categoryId to null (all)
  const linksQuery = query(
    collection(db, "links"),
    where("categoryId", "==", categoryId)
  );
  const linksSnapshot = await getDocs(linksQuery);

  linksSnapshot.docs.forEach(linkDoc => {
    batch.update(linkDoc.ref, { categoryId: null });
  });

  // Commit batch
  await batch.commit();
}

// Update a link by id with partial update support
export async function updateLink(
  id: string,
  data: { url?: string; title?: string; categoryId?: string | null }
) {
  const linkRef = doc(db, "links", id);
  await updateDoc(linkRef, data);
}
