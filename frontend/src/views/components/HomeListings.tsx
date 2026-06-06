import type { Listing, ListingAttributeData, ListingImage } from "../../types";
import { ListingCard } from "./ListingCard";

type HomeListingsProps = {
  listings: Listing[];
  listingsData: ListingAttributeData[];
  listingImages: ListingImage[];
};

function HomeListings({ listings, listingsData, listingImages }: HomeListingsProps) {
  return (
    <section className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-black text-slate-900">Highlighted listings</h2>
        </div>
        <a
          href="/listings"
          className="inline-flex h-11 w-fit items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
        >
          View all listings
        </a>
      </div>

      <div className="w-full">
        {listings.length > 0 && (
          <div className="grid w-full auto-rows-min grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {listings.map((listing) => (
              <ListingCard
                listingsData={listingsData}
                listingImages={listingImages}
                key={listing.id}
                listing={listing}
              />
            ))}
          </div>
        )}

        {listings.length === 0 && (
          <div className="w-full rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-base font-semibold text-slate-800">No highlighted listings yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Check back soon or browse all marketplace listings.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeListings;