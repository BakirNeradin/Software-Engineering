import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useParams } from "react-router-dom";
import type { Attribute, Listing, ListingAttributeData, ListingImage, User } from "../types";
import { ListingHeaderCard } from "./components/ListingHeaderCard";
import { ListingAttributesCard } from "./components/ListingAttributesCard";
import ProfilePageInfo from "./components/ProfilePageInfo";
import { useAuth } from "../contexts/AuthProvider";



function IndividualListing() {
  const { id } = useParams();
  const { userId } = useAuth();
  const [listingData, setListingData] = useState<Listing>();
  const [user, setUser] = useState<User>();
  const [currentUser, setCurrentUser] = useState<User>();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [listingAttributeData, setListingAttributeData] = useState<ListingAttributeData[]>([])
  const [images, setImages] = useState<ListingImage[]>([])
  const [isHighlightModalOpen, setIsHighlightModalOpen] = useState(false);
  const [highlightPoints, setHighlightPoints] = useState(1);
  const [highlightError, setHighlightError] = useState("");
  const [isHighlighting, setIsHighlighting] = useState(false);


  const loadListing = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/listing_by_id?id=${id}`);
    const data = await res.json();
    setListingData(data.listing);
    setAttributes(data.attributes);
    setListingAttributeData(data.listing_attribute_data);   
    setImages(data.images)
  };

  const loadUserData = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/get_user_by_id?user_id=${listingData?.user_id}`);
    const data = await res.json();
    setUser(data);
    
  };

  const loadCurrentUserData = async () => {
    if (!userId) {
      setCurrentUser(undefined);
      return;
    }

    const res = await fetch(`${import.meta.env.VITE_API_URL}/get_user_by_id?user_id=${userId}`);
    const data = await res.json();
    setCurrentUser(data);
  };

  const highlightListing = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || !userId || !currentUser) return;

    if (highlightPoints < 1) {
      setHighlightError("Choose at least 1 point.");
      return;
    }

    if (highlightPoints > currentUser.points) {
      setHighlightError("You do not have enough points.");
      return;
    }

    setIsHighlighting(true);
    setHighlightError("");

    const params = new URLSearchParams({
      listing_id: id,
      user_id: userId,
      points: String(highlightPoints),
    });

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/highlight_listing?${params}`,
      { method: "PUT" },
    );

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setHighlightError(data.detail || "Could not highlight this listing.");
      setIsHighlighting(false);
      return;
    }

    const updatedListing = await res.json();
    setListingData(updatedListing);
    setCurrentUser({
      ...currentUser,
      points: currentUser.points - highlightPoints,
    });
    setUser((previousUser) =>
      previousUser
        ? { ...previousUser, points: previousUser.points - highlightPoints }
        : previousUser,
    );
    setHighlightPoints(1);
    setIsHighlightModalOpen(false);
    setIsHighlighting(false);
  };

  useEffect(() => {
    loadListing();
  }, [id]);
  useEffect(() => {
    listingData &&
    loadUserData();
  }, [listingData]);
  useEffect(() => {
    loadCurrentUserData();
  }, [userId]);

  const price = listingAttributeData.find((lad) => lad.attribute_id === 1)?.value;
  const availablePoints = currentUser?.points || 0;
  const highlightedUntilDate = listingData?.highlighted_until
    ? new Date(listingData.highlighted_until)
    : null;
  const highlightedUntil =
    highlightedUntilDate && highlightedUntilDate > new Date()
      ? highlightedUntilDate.toLocaleString()
      : null;
  const isListingOwner = Boolean(userId && listingData?.user_id === userId);

  return (
    id ? (
      <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row lg:items-start">
          {user && listingData?.user_id ? (
            <div className="shrink-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:w-72">
              <ProfilePageInfo
                userData={user}
                profileUserId={String(listingData.user_id)}
              ></ProfilePageInfo>
            </div>
          ) : null}

          <div className="flex min-w-0 flex-1 flex-col gap-6">
            {isListingOwner && (
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Highlight this listing
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {highlightedUntil
                      ? `Highlighted until ${highlightedUntil}`
                      : "Spend points to keep this listing visible for longer."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setHighlightError("");
                    setHighlightPoints(availablePoints > 0 ? 1 : 0);
                    setIsHighlightModalOpen(true);
                  }}
                  disabled={!userId || availablePoints <= 0}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
                >
                  Highlight
                </button>
              </div>
            )}

            <ListingHeaderCard
              id={id}
              title={listingData?.name || ""}
              price={price}
              images={images}
              listingUserId={listingData?.user_id || ""}
            ></ListingHeaderCard>
            <ListingAttributesCard
              attributes={attributes}
              attributesData={listingAttributeData}
            ></ListingAttributesCard>
          </div>
        </div>

        {isHighlightModalOpen && currentUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Highlight listing
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Choose how many points to spend. Each point adds one second
                    to the highlight time.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsHighlightModalOpen(false)}
                  className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                >
                  X
                </button>
              </div>

              <form onSubmit={highlightListing} className="mt-6 flex flex-col gap-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-400">
                    Available points
                  </p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {currentUser.points}
                  </p>
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-slate-800">
                    Points to spend
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={currentUser.points}
                    value={highlightPoints}
                    onChange={(e) => {
                      setHighlightError("");
                      setHighlightPoints(Number(e.target.value));
                    }}
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                  />
                </label>

                <div className="grid grid-cols-3 gap-3">
                  {[10, 60, 300].map((points) => (
                    <button
                      key={points}
                      type="button"
                      disabled={points > currentUser.points}
                      onClick={() => {
                        setHighlightError("");
                        setHighlightPoints(points);
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {points}
                    </button>
                  ))}
                </div>

                {highlightError && (
                  <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                    {highlightError}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsHighlightModalOpen(false)}
                    className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      isHighlighting ||
                      highlightPoints < 1 ||
                      highlightPoints > currentUser.points
                    }
                    className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
                  >
                    {isHighlighting ? "Highlighting..." : "Highlight"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    ) : null
  );
}

export default IndividualListing;