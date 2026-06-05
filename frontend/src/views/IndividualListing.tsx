import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Attribute, Listing, ListingAttributeData, ListingImage } from "../types";
import { ListingHeaderCard } from "./components/ListingHeaderCard";
import { ListingAttributesCard } from "./components/ListingAttributesCard";



function IndividualListing() {
  const { id } = useParams();
  console.log(id)
  const [listingData, setListingData] = useState<Listing>();
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [listingAttributeData, setListingAttributeData] = useState<ListingAttributeData[]>([])
  const [images, setImages] = useState<ListingImage[]>([])


  const loadListing = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/listing_by_id?id=${id}`);
    const data = await res.json();
    setListingData(data.listing);
    setAttributes(data.attributes);
    setListingAttributeData(data.listing_attribute_data);   
    setImages(data.images)
  };

  useEffect(() => {
    loadListing();
  }, []);
  const price = listingAttributeData.find((lad) => {lad.attribute_id==1})?.value
  console.log(listingData, attributes, listingAttributeData, images)
  return (
    
    
    id ? <> 
    <ListingHeaderCard id={id} title={listingData?.name || ''} price={price} images={images}></ListingHeaderCard>
    <ListingAttributesCard attributes={attributes} attributesData={listingAttributeData}></ListingAttributesCard>
    </> : null
    
  );
}

export default IndividualListing;