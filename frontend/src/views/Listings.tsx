import { useEffect, useState } from "react";

type Listing = {
  id: number;
  name: string;
  category_id: number;
  user_id: number;
  description: string
};

function Listings() {
  
  const [listings, setListings] = useState<Listing[]>([]);
  

  const loadListings = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/listings`);
    const data = await res.json();
    console.log(data)
    setListings(data);
  };

  

  

  useEffect(() => {
    loadListings();
  }, []);

  console.log(listings, "test")

  return (
    <>
    {listings.map((listing) =>{
    return <div key={listing.id} > 
      {listing.name}
    </div>

    })}
    </>
  );
}

export default Listings