import { useEffect, useState } from "react";
import type { Listing, ListingAttributeData, ListingImage, User } from "../types";
import { useParams } from "react-router-dom";
import ProfilePageListings from "./components/ProfilePageListings";
import ProfilePageInfo from "./components/ProfilePageInfo";
import { BuyPoints } from "./components/BuyPoints";



function ProfilePage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [user, setUser] = useState<User>();
  const [listingImages, setListingImages] = useState<ListingImage[]>([]);
  const [listingsData, setListingsData] = useState<ListingAttributeData[]>([]);
  
   const { userId } = useParams();
  
  

  const loadListingData = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/listing_by_user_id?user_id=${userId}`);
    const data = await res.json();
    setListings(data.listings);
    setListingsData(data.listing_attribute_data);   
    setListingImages(data.images)
  };
  const loadUserData = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/get_user_by_id?user_id=${userId}`);
    const data = await res.json();
    setUser(data);
    console.log("ova data", data)
  };
 
  

  

  useEffect(() => {
    loadListingData();
    loadUserData();
    
  }, []);
  console.log(listings)
  return (
    user && userId ? 
    <div>
      <div className="flex sm:flex-row flex-col items-center">
    <ProfilePageInfo userId={userId} userData={user}></ProfilePageInfo>
    <BuyPoints userId={userId}></BuyPoints>
      </div>
    <ProfilePageListings listings={listings} listingImages={listingImages} listingsData={listingsData}></ProfilePageListings>
    </div>
    : null
  );
}

export default ProfilePage;