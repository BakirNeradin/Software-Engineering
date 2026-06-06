import { useState } from "react";
import type { ListingImage } from "../../types";
import { ListingImageCarousel } from "./ListingImageCarousel";
import deletepic from "../../assets/deletepic.png";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthProvider";

type Props = {
  title: string;
  price?: string;
  images: ListingImage[];
  id: string;
  listingUserId: string;
};

const deleteListing = async ({ id }: { id: string }) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/delete_listing?id=${id}`, {
    method: "DELETE",
  });
  const data = await res.json();

  if (!res.ok || !data.deleted) {
    throw new Error(data.detail || "Could not delete this listing.");
  }
};

export const ListingHeaderCard = ({ title, price, images, id, listingUserId }: Props) => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleDelete = async () => {
    setIsDeleting(true);
    setDeleteError("");

    try {
      await deleteListing({ id });
      navigate(-1);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Could not delete this listing.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-row justify-between">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">{title}</h1>
        {userId === listingUserId ? (
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(true)}
            className="shrink-0"
          >
            <img className="size-8 cursor-pointer" src={deletepic} alt="Delete listing" />
          </button>
        ) : null}
      </div>
      <h4 className="mb-4 text-2xl font-semibold text-orange-400">
        {price ? `€${price}` : "Contact for price"}
      </h4>

      <div className="mt-4">
        <ListingImageCarousel images={images} />
      </div>

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-900">Delete listing?</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              This action cannot be undone. The listing will be removed from the marketplace.
            </p>

            {deleteError && (
              <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {deleteError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setDeleteError("");
                }}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-red-300 disabled:active:scale-100"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};