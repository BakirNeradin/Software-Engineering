import { useEffect, useState } from "react";
import { ListingCard } from "./components/ListingCard";

type Listing = {
  id: number;
  name: string;
  category_id: number;
  user_id: number;
  description: string;
};

function Listings() {
  const [listings, setListings] = useState<Listing[]>([]);

  const loadListings = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/listings`);
    const data = await res.json();
    setListings(data);
  };

  useEffect(() => {
    loadListings();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Listings</h1>
        <p className="mt-2 text-sm text-slate-600">
          Browse all available listings in the marketplace.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {listings.length === 0 && (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
          No listings found.
        </div>
      )}
    </div>
  );
}

export default Listings;