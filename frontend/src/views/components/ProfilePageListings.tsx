import type { Listing, ListingAttributeData, ListingImage } from "../../types";
import { ListingCard } from "./ListingCard";


type ProfilePageListingsProps = {
  listings: Listing[];
  listingsData: ListingAttributeData[];
  listingImages: ListingImage[];
};

function ProfilePageListings({listings, listingsData, listingImages}: ProfilePageListingsProps) {
  return (
    <div className="mx-auto justify-center flex flex-col w-full min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      
      <div className="justify-center w-full flex flex-row">
        
        {listings.length > 0 && (
        <div className="items-start w-full auto-rows-min grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard listingsData={listingsData} listingImages={listingImages} key={listing.id} listing={listing} />
          ))}
          
        </div>)}


        {listings.length === 0 && (
          <div className="w-full mt-10 max-w-6xl rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
            No listings found.
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfilePageListings;