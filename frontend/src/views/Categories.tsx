import { useEffect, useState } from "react";
import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

  

  const toggle = (id: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };
  useEffect(() => {
    loadCategories();
  }, []);

  const renderTree = (parentId: number | null, rank: number) => {
    const children = categories.filter((c) => c.parent_id === parentId);
    if (children.length === 0) return null;

    return (
      <div className={!parentId ? "grid grid-cols-4 gap-4" : ""}>
        {children.map((category) => {
          const hasChildren = categories.some(
            (c) => c.parent_id === category.id,
          );
          const isOpen = (expanded.has(category.id) && rank!==0) || (!expanded.has(category.id) && rank===0);

          return (
            <div className={!category.parent_id? "border border-b-olive-500 rounded-md bg-white" : ""} style={{paddingLeft: rank*10}} key={category.id} >
              <span
              className="flex flex-row gap-1 items-center"
                onClick={() => toggle(category.id)}
                style={{ cursor: hasChildren ? "pointer" : "default" }}
              >
                {hasChildren && (isOpen ? "▼ " : "▶ ")}
                {category.name}
                {hasChildren && (isOpen ? <FontAwesomeIcon icon={faChevronDown}/>: <FontAwesomeIcon icon={faChevronRight}/>)}
                <div className="p-1">{category.name}</div>
              </span>

              
            {hasChildren && isOpen && renderTree(category.id, rank+1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="px-18 bg-gray-100 ">
      
      {renderTree(null, 0)}
    </div>
  );
}

export default Categories;
