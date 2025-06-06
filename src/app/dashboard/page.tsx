// app/dashboard/page.tsx

"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import useCategories from "@/lib/useCategories";
import useLinks from "@/lib/useLinks";
import CategorySidebar from "@/components/CategorySidebar";
import LinksSection from "@/components/LinksSection";
import CategoryModal from "@/components/CategoryModal";
import LinkModal from "@/components/LinkModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Link } from "@/lib/types"; // Adjust the import based on your project structure

export default function Dashboard() {
  const [categoryToEdit, setCategoryToEdit] = useState<{ id: string; name: string } | null>(null);
  const [linkToEdit, setLinkToEdit] = useState<Link | null>(null);
  const { authUser } = useAuth();
  const userId = authUser?.uid ?? "";
  const { categories, loading: loadingCats } = useCategories(userId);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null); // null means "All"
  const {
    links,
    loading: loadingLinks,
    hasMore,
    fetchMore,
  } = useLinks(userId, selectedCategory ?? undefined);

  // Modals open/close state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  // Handlers to open modals in "edit" mode:
  const handleEditCategory = (category: { id: string; name: string }) => {
    setCategoryToEdit(category);
    setShowCategoryModal(true);
  };

  const handleEditLink = (link: Link) => {
    setLinkToEdit(link);
    setShowLinkModal(true);
  };

  // Handlers to open modals in "add" mode:
  const handleAddCategory = () => {
    setCategoryToEdit(null);
    setShowCategoryModal(true);
  };

  const handleAddLink = () => {
    setLinkToEdit(null);
    setShowLinkModal(true);
  };

  return (
    <ProtectedRoute>
      {!userId ? (
        <p>Loading user info...</p>
      ) : (
        <div className="flex h-screen max-w-7xl mx-auto p-4 gap-6">
          <CategorySidebar
            categories={categories}
            loading={loadingCats}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onAddCategory={handleAddCategory}
            onEditCategory={handleEditCategory}
          />

          <LinksSection
            links={links}
            loading={loadingLinks}
            hasMore={hasMore}
            fetchMore={fetchMore}
            onAddLink={handleAddLink}
            onEditLink={handleEditLink}
          />

          {showCategoryModal && (
            <CategoryModal
              onClose={() => {
                setShowCategoryModal(false);
                setCategoryToEdit(null);
              }}
              userId={userId}
              itemToEdit={categoryToEdit ?? undefined}
              onSuccess={() => {
                setShowCategoryModal(false);
                setCategoryToEdit(null);
                // Optionally refresh categories here if needed
              }}
            />
          )}

          {showLinkModal && (
            <LinkModal
              onClose={() => {
                setShowLinkModal(false);
                setLinkToEdit(null);
              }}
              categories={categories}
              userId={userId}
              itemToEdit={linkToEdit ?? undefined}
              onSuccess={() => {
                setShowLinkModal(false);
                setLinkToEdit(null);
                // Optionally refresh links here if needed
              }}
            />
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}
