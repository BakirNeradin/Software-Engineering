import { useState } from "react";
import type { ListingImage } from "../../types";

type Props = {
  images: ListingImage[];
};

export const ListingImageCarousel = ({ images }: Props) => {
  const [slideIndex, setSlideIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500 shadow-sm">
        No images available
      </div>
    );
  }

  const plusSlides = (n: number) => {
    setSlideIndex((prev) => {
      const nextIndex = prev + n;
      if (nextIndex >= images.length) return 0;
      if (nextIndex < 0) return images.length - 1;
      return nextIndex;
    });
  };

  const currentSlide = (index: number) => {
    setSlideIndex(index);
  };

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
        <div className="absolute left-3 top-3 z-10 rounded-md bg-black/60 px-3 py-1 text-sm text-white">
          {slideIndex + 1} / {images.length}
        </div>

        <img
          src={images[slideIndex].image_url}
          
          className="h-105 w-full object-cover"
        />

        {images.length > 1 ?<><button
          type="button"
          onClick={() => plusSlides(-1)}
          className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-2xl text-white transition hover:bg-black/80"
        >
          &#10094;
        </button>

        <button
          type="button"
          onClick={() => plusSlides(1)}
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 px-4 py-3 text-2xl text-white transition hover:bg-black/80"
        >
          &#10095;
        </button>
        </>
        : null}
      </div>

      

      <div className="mt-4 flex flex-wrap gap-3">
        {images.map((image, index) => (
          <button
            key={image.id ?? index}
            type="button"
            onClick={() => currentSlide(index)}
            className={`overflow-hidden rounded-xl border-2 transition ${
              slideIndex === index
                ? "border-blue-500 opacity-100"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            <img
              src={image.image_url}
              className="h-20 w-24 object-cover sm:h-24 sm:w-32"
            />
          </button>
        ))}
      </div>
    </div>
  );
};