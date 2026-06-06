import { useEffect, useState } from "react";
import type { Listing, ListingAttributeData, ListingImage } from "../types";
import HomeListings from "./components/HomeListings";

function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [listingImages, setListingImages] = useState<ListingImage[]>([]);
  const [listingsData, setListingsData] = useState<ListingAttributeData[]>([]);

  const loadListing = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/highlighted_listings`);
    const data = await res.json();
    setListings(data);
  };
  const loadListingData = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/listings_attribute_data`);
    const data = await res.json();
    setListingsData(data);
  };

  const loadListingImages = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/listing_images`);
    const data = await res.json();
    setListingImages(data);
  };

  useEffect(() => {
    loadListingData();
    loadListing();
    loadListingImages();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 md:px-8">
        <HomeListings
          listings={listings || []}
          listingImages={listingImages}
          listingsData={listingsData}
        />
      </div>
    </main>
  );
}

export default Home;