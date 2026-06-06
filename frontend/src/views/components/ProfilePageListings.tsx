import type { Listing, ListingAttributeData, ListingImage } from "../../types";
import { ListingCard } from "./ListingCard";


type ProfilePageListingsProps = {
  listings: Listing[];
  listingsData: ListingAttributeData[];
  listingImages: ListingImage[];
};

function ProfilePageListings({listings, listingsData, listingImages}: ProfilePageListingsProps) {
  return (
    <section className="flex w-full flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Listings</h2>
        <p className="mt-2 text-sm text-slate-600">
          Browse this user's marketplace listings.
        </p>
      </div>

      <div className="w-full">
        
        {listings.length > 0 && (
        <div className="grid w-full auto-rows-min grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard listingsData={listingsData} listingImages={listingImages} key={listing.id} listing={listing} />
          ))}
          
        </div>)}


        {listings.length === 0 && (
          <div className="w-full rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No listings found.
          </div>
        )}
      </div>
    </section>
  );
}

export default ProfilePageListings;