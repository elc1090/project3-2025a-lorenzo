// components/CategoryModal.tsx

"use client";

import { useState, useEffect } from "react";
import { addCategory, updateCategory, deleteCategory } from "@/lib/firestore";

interface Props {
  onClose: () => void;
  userId: string;
  itemToEdit?: { id: string; name: string };
  onSuccess?: () => void;
  onDeleteSuccess?: () => void;
}

export default function CategoryModal({
  onClose,
  userId,
  itemToEdit,
  onSuccess,
  onDeleteSuccess,
}: Props) {
  const [name, setName] = useState(itemToEdit?.name ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(itemToEdit?.name ?? "");
  }, [itemToEdit]);

  const isEditMode = Boolean(itemToEdit);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name cannot be empty.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (isEditMode && itemToEdit) {
        await updateCategory(itemToEdit.id, { name: name.trim() });
      } else {
        await addCategory(name.trim(), userId);
      }
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save category.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToEdit) return;
    if (!confirm("Are you sure you want to delete this category?")) return;

    setLoading(true);
    setError(null);
    try {
      await deleteCategory(itemToEdit.id);
      onDeleteSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          {isEditMode ? "Edit Category" : "Add New Category"}
        </h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input input-bordered w-full mb-2"
            disabled={loading}
          />
          {error && <p className="text-red-500 mb-2">{error}</p>}
          <div className="modal-action flex justify-between">
            <button
              type="button"
              className="btn btn-error btn-outline"
              onClick={handleDelete}
              disabled={loading || !isEditMode}
              title={isEditMode ? "Delete Category" : "Delete unavailable"}
            >
              Delete
            </button>
            <div className="flex space-x-2">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`btn btn-primary ${loading ? "loading" : ""}`}
              >
                {isEditMode ? "Save" : "Add"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
