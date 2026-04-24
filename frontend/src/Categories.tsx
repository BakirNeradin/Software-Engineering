import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
};

function Categories() {
  const API_URL = "http://localhost:8000";
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const loadCategories = async () => {
    const res = await fetch(`${API_URL}/categories`);
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const toggle = (id: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  const renderTree = (parentId: number | null) => {
    const children = categories.filter((c) => c.parent_id === parentId);
    if (children.length === 0) return null;

    return (
      <ul>
        {children.map((category) => {
          const hasChildren = categories.some(
            (c) => c.parent_id === category.id,
          );
          const isOpen = expanded.has(category.id);

          return (
            <li key={category.id}>
              <span
                onClick={() => toggle(category.id)}
                style={{ cursor: hasChildren ? "pointer" : "default" }}
              >
                {hasChildren && (isOpen ? "▼ " : "▶ ")}
                {category.name}
              </span>

              {hasChildren && isOpen && renderTree(category.id)}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Categories</h1>
      {renderTree(null)}
    </div>
  );
}

export default Categories;
