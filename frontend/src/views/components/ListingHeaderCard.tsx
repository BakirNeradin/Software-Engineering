import type { ListingImage } from "../../types";
import { ListingImageCarousel } from "./ListingImageCarousel";
import deletepic from "../../assets/deletepic.png"
import { useNavigate } from "react-router-dom";

type Props = {
  title: string;
  price?: string;
  images: ListingImage[];
  id: string;
};
const deleteListing = async ({id}:{id: string}) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/delete_listing?id=${id}`,{
      method:"DELETE"
    });
    await res.json();
    console.log("nesto")
    
    
  };
export const ListingHeaderCard = ({ title, price, images, id }: Props) => {
  const navigate = useNavigate();
 const handleDelete = async () => {
  deleteListing({id})
  navigate(-1)
 }

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 shadow-lg">
      <div className="flex flex-row justify-between">
  <h1 className="mb-2 text-3xl font-bold text-gray-900">
    {title}
  </h1>
    <button onClick={() => handleDelete()}>
  <img className="size-8 cursor-pointer" src={deletepic}></img>
    </button>
    </div>
  <h4 className="mb-4 text-2xl font-semibold text-orange-400">
    {price? `€${price}`:"Contact for price"}
  </h4>

  <div className="mt-4">
    <ListingImageCarousel images={images} />
  </div>
</div>

      
  );
};