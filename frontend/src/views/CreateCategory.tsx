import { useEffect, useState } from "react";
import type { Attribute, Category } from "../types";
import AttributeForm from "./components/AttributeForm";
import { Outlet } from "react-router-dom";
import { AttributeList } from "./components/AttributeList";

function CreateCategory() {
  const API_URL = "http://localhost:8000";

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [nullAttributes, setNullAttributes] = useState<Attribute[]>([]);
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/categories`);
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

  useEffect(() => {
    fetchCategories();
  }, []);
  const fetchNullAttributes = async () => {
    try {
      const response = await fetch(`${API_URL}/attributes?null_attribute=true`);
      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }

      const data: Attribute[] = await response.json();
      setNullAttributes(data);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchNullAttributes();
  }, []);

  const addCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = new URL(`${API_URL}/category`);
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

      if (attributesWithCategoryId.length > 0) {
        const response2 = await fetch(`${API_URL}/attributes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attributesWithCategoryId),
        });

        if (!response2.ok) {
          throw new Error("Failed to add attributes");
        }

        const createdAttributes = await response2.json();
        console.log("Attributes added:", createdAttributes);
      }
      setName("");
      setParentId("");
      setAttributes([]);

      fetchCategories();
      fetchNullAttributes();
    } catch (error) {
      console.error("Error adding category:", error);
    }
    fetchCategories();
  };

  return (
    <>
      <form
        onSubmit={addCategory}
        style={{
          border: "1px solid #ccc",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <div>
          <label htmlFor="name">Category name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="parentId">Parent category:</label>
          <select
            id="parentId"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            disabled={loading}
          >
            <option value="">No parent</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Add Category</button>
      </form>
      <AttributeForm attributes={attributes} setAttributes={setAttributes} />
      <AttributeList attributes={[...nullAttributes, ...attributes]} />
      <Outlet />
    </>
  );
}

export default CreateCategory;
