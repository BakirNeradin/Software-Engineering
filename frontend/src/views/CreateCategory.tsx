import { useEffect, useState } from "react";
import type { Attribute, AttributeData, Category } from "../types";
import AttributeForm from "./components/AttributeForm";
import { Outlet } from "react-router-dom";
import { AttributeList } from "./components/AttributeList";

function CreateCategory() {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [nullAttributes, setNullAttributes] = useState<Attribute[]>([]);
  const [attributeData, setAttributeData] = useState<AttributeData[]>([]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data: Category[] = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNullAttributes = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/attributes?null_attribute=true`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }
      
      const data: Attribute[] = await response.json();
      const filteredData = data.filter((d)=>d.id !== 2)
      setNullAttributes(filteredData);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Create Category";
    fetchCategories();
    fetchNullAttributes();
  }, []);

  const addCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL(`${import.meta.env.VITE_API_URL}/category`);
    url.searchParams.append("name", name);

    if (parentId !== "") {
      url.searchParams.append("parent_id", parentId);
    }

    try {
      const response = await fetch(url.toString(), {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      const createdCategory: Category = await response.json();
      console.log("Category added:", createdCategory);

      const attributesWithCategoryId = attributes.map((attribute) => ({
        ...attribute,
        category_id: createdCategory.id,
      }));

      const attributeIDs: number[] = [];

      nullAttributes.forEach((attribute) => {
        if (attribute.id) attributeIDs.push(attribute.id);
      });

      if (attributesWithCategoryId.length > 0) {
        const response2 = await fetch(`${import.meta.env.VITE_API_URL}/attributes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attributesWithCategoryId),
        });

        if (!response2.ok) {
          throw new Error("Failed to add attributes");
        }

        const createdAttributes: AttributeData[] = await response2.json();
        console.log("Attributes added:", createdAttributes);

        createdAttributes.forEach((attribute) => {
          if (attribute.id) attributeIDs.push(attribute.id);
        });
      }

      const attributeDataWithAttributeID = attributeData.map((item) => ({
        ...item,
        attribute_id: attributeIDs[item.attribute_id],
      }));

      console.log(attributeDataWithAttributeID, "pravi", attributeIDs, attributeData);

      if (attributeDataWithAttributeID.length > 0) {
        const response3 = await fetch(`${import.meta.env.VITE_API_URL}/attribute_datas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attributeDataWithAttributeID),
        });

        if (!response3.ok) {
          throw new Error("Failed to add attribute data");
        }

        const createdAttributeData = await response3.json();
        console.log("Attribute data added:", createdAttributeData);
      }

      setName("");
      setParentId("");
      setAttributes([]);
      setAttributeData([]);

      fetchCategories();
      fetchNullAttributes();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Create Category</h1>
          <p className="mt-2 text-sm text-slate-600">
            Add a new category and attach attributes for your marketplace structure.
          </p>
        </div>

        {/* Main form card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={addCategory} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Category name */}
              <div className="space-y-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Category name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Enter category name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              {/* Parent category */}
              <div className="space-y-2">
                <label
                  htmlFor="parentId"
                  className="block text-sm font-semibold text-slate-700"
                >
                  Parent category
                </label>
                <select
                  id="parentId"
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-100"
                >
                  <option value="">No parent</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit area */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                Keep category names short and clear for easier navigation.
              </p>

              <button
                type="submit"
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98]"
              >
                Add Category
              </button>
            </div>
          </form>
        </div>

        {/* Attributes section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900">Attributes</h2>
            <p className="mt-1 text-sm text-slate-600">
              Define reusable fields and values for this category.
            </p>
          </div>

          <div className="space-y-6">
            <AttributeForm attributes={attributes} setAttributes={setAttributes} />
            <AttributeList
              attributes={[...nullAttributes, ...attributes]}
              attributeData={attributeData}
              setAttributeData={setAttributeData}
            />
          </div>
        </div>

        <Outlet />
      </div>
    </div>
  );
}

export default CreateCategory;