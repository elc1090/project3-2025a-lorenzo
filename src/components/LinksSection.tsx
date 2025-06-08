// components/LinksSection.tsx

"use client";

import React, { useRef, useCallback, useState } from "react";
import { Link } from "@/lib/types"; // Adjust this import to your project structure

interface Props {
  links: Link[];
  loading: boolean;
  hasMore: boolean;
  fetchMore: () => void;
  onAddLink: () => void;
  onEditLink: (link: Link) => void;
  onDeleteLink: (link: Link) => void; // new prop for deleting
}

export default function LinksSection({ links, loading, hasMore, fetchMore, onAddLink, onEditLink, onDeleteLink }: Props) {
  const observer = useRef<IntersectionObserver | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState<Link | null>(null);

  const lastLinkRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      if (node) {
        observer.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore) {
            fetchMore();
          }
        });
        observer.current.observe(node);
      }
    },
    [loading, hasMore, fetchMore]
  );

  return (
    <section className="flex-1 overflow-auto flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Links</h2>
        <button className="btn btn-primary" onClick={onAddLink}>
          + Add Link
        </button>
      </div>

      {links.length === 0 && !loading && <p>No links found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
        {links.map((link, i) => {
          const isLast = i === links.length - 1;
          const linkProps = {
            key: link.id,
            link,
            onEditLink,
            onDeleteLink: () => setConfirmingDelete(link),
            ref: isLast ? lastLinkRef : undefined,
          };
          return <LinkCard {...linkProps} />;
        })}
      </div>

      {loading && <p className="mt-4">Loading...</p>}

      {confirmingDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <p className="mb-4">Are you sure you want to delete <b>{confirmingDelete.title || confirmingDelete.url}</b>?</p>
            <div className="flex justify-end gap-4">
              <button
                className="btn btn-error"
                onClick={() => {
                  onDeleteLink(confirmingDelete);
                  setConfirmingDelete(null);
                }}
              >
                Yes, Delete
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setConfirmingDelete(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const LinkCard = React.forwardRef<HTMLDivElement, { link: Link; onEditLink: (link: Link) => void; onDeleteLink: () => void }>(
  ({ link, onEditLink, onDeleteLink }, ref) => {
    return (
      <div ref={ref} className="card card-bordered p-4 flex flex-col justify-between">
        <div>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blue-600 underline break-all"
          >
            {link.title || link.url}
          </a>
          <p className="text-sm text-gray-500 break-all">{link.url}</p>
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => onEditLink(link)}
            aria-label={`Edit link ${link.title || link.url}`}
          >
            ✏️
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={onDeleteLink}
            aria-label={`Delete link ${link.title || link.url}`}
          >
            🗑️
          </button>
        </div>
      </div>
    );
  }
);

LinkCard.displayName = "LinkCard";
