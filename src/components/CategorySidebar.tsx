// components/CategorySidebar.tsx

"use client";

import React, { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface Props {
  categories: Category[];
  loading: boolean;
  selectedCategory: string | null; // null means "All"
  onSelectCategory: (id: string | null) => void;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (category: Category) => void;  // new prop for deleting
}

export default function CategorySidebar({
  categories,
  loading,
  selectedCategory,
  onSelectCategory,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState<Category | null>(null);

  const selectedCategoryObj = categories.find(cat => cat.id === selectedCategory);

  return (
    <aside className="w-64 border-r p-4 flex flex-col">
      <label htmlFor="category-select" className="mb-2 font-semibold">
        Select Category
      </label>
      {loading ? (
        <p>Loading categories...</p>
      ) : (
        <>
          <select
            id="category-select"
            className="select select-bordered w-full mb-4"
            value={selectedCategory ?? ""}
            onChange={(e) =>
              onSelectCategory(e.target.value === "" ? null : e.target.value)
            }
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <button
            className={`btn btn-outline mb-2 ${!selectedCategoryObj ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!selectedCategoryObj}
            onClick={() => selectedCategoryObj && onEditCategory(selectedCategoryObj)}
          >
            Edit Selected Category
          </button>

          <button
            className={`btn btn-error btn-outline ${!selectedCategoryObj ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!selectedCategoryObj}
            onClick={() => selectedCategoryObj && setConfirmingDelete(selectedCategoryObj)}
          >
            Delete Selected Category
          </button>

          {confirmingDelete && (
            <div className="mt-4 p-3 border rounded bg-red-100">
              <p>Are you sure you want to delete <b>{confirmingDelete.name}</b>?</p>
              <div className="flex gap-2 mt-2">
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => {
                    onDeleteCategory(confirmingDelete);
                    setConfirmingDelete(null);
                  }}
                >
                  Yes, Delete
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => setConfirmingDelete(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <button className="btn btn-primary mt-auto" onClick={onAddCategory}>
        + Add Category
      </button>
    </aside>
  );
}
