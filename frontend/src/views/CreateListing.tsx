import { useEffect, useState } from "react";
import type { Attribute, AttributeData, Category } from "../types";
import { Outlet } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { CreateListingAttribute } from "./components/CreateListingAttributes";


type DecodedToken = {
  sub?: string;
  jti?: string;
};

type CreateListingDataPayload = {
  listing_id: number;
  attribute_id: number;
  value: string;
};

const TOKEN_KEY = "token";

function CreateListing() {
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [attributeData, setAttributeData] = useState<AttributeData[]>([]);
  const [listingValues, setListingValues] = useState<Record<number, string[]>>(
    {},
  );
  const [error, setError] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const initialToken = localStorage.getItem(TOKEN_KEY) || "";
  const initialDecoded: DecodedToken = initialToken
    ? jwtDecode(initialToken)
    : {};
  const userId = initialDecoded.jti || "";

  const fetchCategories = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/categories?omit_null=true`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data: Category[] = await response.json();
      setCategories(data);
      setCategoryId(`${data[0].id}`);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryAttributes = async () => {
    try {
      const effectiveCategoryId = categoryId || "1";

      const fetchUrl = new URL(
        `${import.meta.env.VITE_API_URL}/attributes_for_create_listing`,
      );
      fetchUrl.searchParams.append("category_id", effectiveCategoryId);

      const response = await fetch(fetchUrl.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }

      const data: [Attribute[], AttributeData[]] = await response.json();
      setAttributes(data[0]);
      setAttributeData(data[1]);
      setListingValues({});
    } catch (error) {
      console.error("Error fetching attributes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Create Listing";
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCategoryAttributes();
  }, [categoryId]);

  const createListing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const url = new URL(`${import.meta.env.VITE_API_URL}/create_listing`);
    url.searchParams.append("name", name);
    url.searchParams.append("category_id", categoryId);
    url.searchParams.append("user_id", userId);
    url.searchParams.append("description", description);

    try {
      const response = await fetch(url.toString(), {
        method: "POST",
      });

      if (!response.ok) {
        const err = await response.json();
        console.log(err);
        throw new Error(err.detail || "Failed to add listing");
      }

      const createdListing = await response.json();
      for (const imageFile of imageFiles) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imageUploadResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/upload`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!imageUploadResponse.ok) {
          const err = await imageUploadResponse.json();
          console.log(err);
          throw new Error(err.detail || "Failed to upload image");
        }

        const uploadedImage = await imageUploadResponse.json();

        const listingImageUrl = new URL(
          `${import.meta.env.VITE_API_URL}/create_listing_images`,
        );
        listingImageUrl.searchParams.append(
          "listing_id",
          String(createdListing.id),
        );
        listingImageUrl.searchParams.append("image_url", uploadedImage.url);
        console.log(uploadedImage.url)

        const listingImageResponse = await fetch(listingImageUrl.toString(), {
          method: "POST",
        });

        if (!listingImageResponse.ok) {
          const err = await listingImageResponse.json();
          console.log(err);
          throw new Error(err.detail || "Failed to save listing image");
        }
      }

      const listingDataPayloads: CreateListingDataPayload[] = [];

      for (const [attributeId, values] of Object.entries(listingValues)) {
        for (const value of values) {
          if (!value.trim()) continue;

          listingDataPayloads.push({
            listing_id: createdListing.id,
            attribute_id: Number(attributeId),
            value,
          });
        }
      }

      for (const payload of listingDataPayloads) {
        const listingDataUrl = new URL(
          `${import.meta.env.VITE_API_URL}/create_listings_data`,
        );

        listingDataUrl.searchParams.append(
          "listing_id",
          String(payload.listing_id),
        );
        listingDataUrl.searchParams.append(
          "attribute_id",
          String(payload.attribute_id),
        );
        listingDataUrl.searchParams.append("value", payload.value);

        const listingDataResponse = await fetch(listingDataUrl.toString(), {
          method: "POST",
        });

        if (!listingDataResponse.ok) {
          const err = await listingDataResponse.json();
          console.log(err);
          throw new Error(
            err.detail || "Failed to add listing attribute value",
          );
        }
      }

      setName("");
      setCategoryId("");
      setDescription("");
      setAttributes([]);
      setAttributeData([]);
      setListingValues({});
      setImageFiles([]);

      fetchCategories();
    } catch (error) {
      console.error("Error adding listing:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Listing</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add a new marketplace listing and fill in its category-specific
            details.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={createListing} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Listing name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={submitting}
                  placeholder="Enter listing name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="categoryId"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Category
                </label>
                <select
                  id="categoryId"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loading || submitting}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-slate-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                name="description"
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                disabled={submitting}
                placeholder="Describe your item..."
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="images"
                className="block text-sm font-semibold text-slate-700"
              >
                Listing images
              </label>
              <input
                id="images"
                type="file"
                accept="image/*"
                multiple
                disabled={submitting}
                onChange={(e) =>
                  setImageFiles(Array.from(e.target.files || []))
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900"
              />
              {imageFiles.length > 0 && (
                <p className="text-sm text-slate-500">
                  {imageFiles.length} image(s) selected
                </p>
              )}
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                Choose a category first to load the correct attribute fields.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
              >
                {submitting ? "Creating..." : "Add Listing"}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Listing Attributes
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Complete the required details for the selected category.
            </p>
          </div>

          <CreateListingAttribute
            attributes={attributes}
            attributeData={attributeData}
            listingValues={listingValues}
            setListingValues={setListingValues}
          />
          
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default CreateListing;
