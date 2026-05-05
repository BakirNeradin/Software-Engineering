import type { ListingImage } from "../../types";
import { ListingImageCarousel } from "./ListingImageCarousel.tsx";

type Props = {
  title: string;
  price: number;
  images: ListingImage[];
};

export const ListingHeaderCard = ({ title, price, images }: Props) => {
  
 

  return (
    <div className="mx-auto max-w-4xl bg-white p-6 shadow-lg">
  <h1 className="mb-2 text-3xl font-bold text-gray-900">
    {title}
  </h1>

  <h4 className="mb-4 text-2xl font-semibold text-orange-400">
    €{price}
  </h4>

  <div className="mt-4">
    <ListingImageCarousel images={images} />
  </div>
</div>

      
  );
};