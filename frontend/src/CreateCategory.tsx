import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
};

function CreateCategory() {
  const API_URL = "http://localhost:8000";

  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

    fetchCategories();
  }, []);

  const parentCategories = categories.filter(
    (category) => category.parent_id === null
  );

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

      console.log("Category added");
      setName("");
      setParentId("");
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <form onSubmit={addCategory}>
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
          {parentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <button type="submit">Add Category</button>
    </form>
  );
}

export default CreateCategory;