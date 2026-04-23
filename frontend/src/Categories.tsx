import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
};

function Categories() {
  const API_URL = "http://localhost:8000";
  const [categories, setCategories] = useState<Category[]>([]);

  const loadCategories = async () => {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const parentCategories = categories.filter((c) => c.parent_id === null);

  return (
    <div style={{ padding: 20 }}>
      <h1>Categories</h1>
      <ul>
        {parentCategories.map((parent) => {
          const children = categories.filter(
            (c) => c.parent_id === parent.id
          );

          return (
            <li key={parent.id} style={{ marginBottom: "12px" }}>
              <strong>{parent.name}</strong>

              {children.length > 0 && (
                <ul style={{ marginTop: "6px" }}>
                  {children.map((child) => (
                    <li key={child.id}>{child.name}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default Categories;