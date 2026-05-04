type Listing = {
  id: number;
  name: string;
  category_id: number;
  user_id: number;
  description: string;
};

export const ListingCard = ({ listing }: { listing: Listing }) => {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      
      {/* Title */}
      <h2 className="text-lg font-semibold text-slate-900 group-hover:text-orange-500 transition">
        {listing.name}
      </h2>

      {/* Description */}
      <p className="mt-2 text-sm text-slate-600 line-clamp-3">
        {listing.description || "No description provided."}
      </p>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xs text-slate-400">
          Category ID: {listing.category_id}
        </span>

        <button className="text-sm font-medium text-orange-500 hover:underline">
          View
        </button>
      </div>
    </div>
  );
};