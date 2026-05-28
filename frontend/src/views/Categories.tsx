import { faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

type Category = {
  id: number;
  name: string;
  parent_id: number | null;
};

function Categories({isListingsPage = false}: {isListingsPage?: boolean}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const loadCategories = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/categories`);
    const data = await res.json();
    setCategories(data);
  };

  const toggle = (id: number) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const renderTree = (parentId: number | null, rank: number) => {
    const children = categories.filter((c) => c.parent_id === parentId);
    if (children.length === 0) return null;

    return (
      <div className={parentId === null ? isListingsPage ? "grid grid-cols-1 gap-1.5": "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" : "mt-3 space-y-2"}>
        {children.map((category) => {
          const hasChildren = categories.some((c) => c.parent_id === category.id);
          const isOpen = isListingsPage ? expanded.has(category.id) : (expanded.has(category.id) && rank!==0) || (!expanded.has(category.id) && rank===0);

          if (parentId === null) {
            return (
              <div
                key={category.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <button
  
                  
                  className="flex w-full items-center justify-between text-left"
                >
                  <div className="flex items-center gap-3">
                    
                    <div>
                      <a href={`/listings?category_id=${category.id}`} className="text-lg font-semibold text-slate-900">{category.name}</a>
                      {!isListingsPage ? <p className="text-sm text-slate-500">
                        {hasChildren ? "Browse subcategories" : "No subcategories"}
                      </p> : null}
                    </div>
                  </div>

                  {hasChildren && (
                    <button onClick={() => hasChildren && toggle(category.id)} className="flex flex-1 justify-end text-slate-900">
                      <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
                    </button>
                  )}
                </button>

                {hasChildren && isOpen && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-3">
                    {renderTree(category.id, rank + 1)}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={category.id} className="rounded-xl border border-slate-200 bg-white">
              <button
            
                
                className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition hover:bg-slate-50"
              >
                <a href={`/listings?category_id=${category.id}`} className="flex items-center gap-3">
                  
                  <span className="font-medium text-slate-800">{category.name}</span>
                </a>

                {hasChildren && (
                  <button onClick={() => hasChildren && toggle(category.id)} className="flex flex-1 justify-end text-slate-900">
                    <FontAwesomeIcon icon={isOpen ? faChevronDown : faChevronRight} />
                  </button>
                )}
              </button>

              {hasChildren && isOpen && (
                <div className="border-t border-slate-100 px-3 pb-3 pt-2">
                  <div className="ml-3 border-l-2 border-slate-200 pl-3">
                    {renderTree(category.id, rank + 1)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-slate-100 ${!isListingsPage ?"px-6 py-8":"mr-12"} `}>
      {!isListingsPage ? <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
        <p className="mt-2 text-sm text-slate-600">
          Explore all marketplace categories and subcategories.
        </p>
      </div>: null}

      {categories.length > 0 ? (
        renderTree(null, 0)
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500 shadow-sm">
          Loading categories...
        </div>
      )}
    </div>
  );
}

export default Categories;