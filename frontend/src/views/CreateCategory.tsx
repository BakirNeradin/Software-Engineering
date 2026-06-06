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
  const [submitting, setSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");

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

  const addCategory = async () => {
    setSubmitting(true);
    setError("");

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
      setShowConfirm(false);

      fetchCategories();
      fetchNullAttributes();
    } catch (error) {
      console.error("Error adding category:", error);
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const openConfirmation = () => {
    setError("");

    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setShowConfirm(true);
  };

  const updateAddedAttribute = (mergedIndex: number, updatedAttribute: Attribute) => {
    const attributeIndex = mergedIndex - nullAttributes.length;

    if (attributeIndex < 0) return;

    setAttributes((currentAttributes) =>
      currentAttributes.map((attribute, index) =>
        index === attributeIndex ? updatedAttribute : attribute
      )
    );

    if (updatedAttribute.user_written) {
      setAttributeData((currentAttributeData) =>
        currentAttributeData.filter((item) => item.attribute_id !== mergedIndex)
      );
    }
  };

  const deleteAddedAttribute = (mergedIndex: number) => {
    const attributeIndex = mergedIndex - nullAttributes.length;

    if (attributeIndex < 0) return;

    setAttributes((currentAttributes) =>
      currentAttributes.filter((_, index) => index !== attributeIndex)
    );
    setAttributeData((currentAttributeData) =>
      currentAttributeData
        .filter((item) => item.attribute_id !== mergedIndex)
        .map((item) =>
          item.attribute_id > mergedIndex
            ? { ...item, attribute_id: item.attribute_id - 1 }
            : item
        )
    );
  };

  const parentCategoryName =
    categories.find((category) => String(category.id) === parentId)?.name ||
    "No parent";

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
          <div className="space-y-5">
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
                  disabled={submitting}
                  placeholder="Enter category name"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                  disabled={loading || submitting}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
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

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                Keep category names short and clear for easier navigation.
              </p>
            </div>
          </div>
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
              editableStartIndex={nullAttributes.length}
              onUpdateAttribute={updateAddedAttribute}
              onDeleteAttribute={deleteAddedAttribute}
            />
          </div>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">
            Review the category details and attributes before creating it.
          </p>

          <button
            type="button"
            onClick={openConfirmation}
            disabled={submitting}
            className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
          >
            Add Category
          </button>
        </div>

        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
              <h2 className="text-xl font-semibold text-slate-900">
                Create this category?
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                This will create a new category named "{name}" under "{parentCategoryName}"
                with {attributes.length} new attribute(s). Are you sure?
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Attributes</p>
                {attributes.length > 0 ? (
                  <ul className="mt-2 space-y-1 text-sm text-slate-600">
                    {attributes.map((attribute, index) => (
                      <li key={`${attribute.name}-${index}`}>
                        {attribute.name || "Unnamed attribute"} ({attribute.data_type})
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-sm text-slate-500">
                    No new attributes will be created.
                  </p>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={submitting}
                  className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={submitting}
                  className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
                >
                  {submitting ? "Creating..." : "Yes, Create Category"}
                </button>
              </div>
            </div>
          </div>
        )}

        <Outlet />
      </div>
    </div>
  );
}

export default CreateCategory;