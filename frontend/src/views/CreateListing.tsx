import { useEffect, useState, type Attributes } from "react";
import type { Attribute, AttributeData, Category } from "../types";
import AttributeForm from "./components/AttributeForm";
import { Outlet } from "react-router-dom";
import { AttributeList } from "./components/AttributeList";

function CreateCategory() {
  

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState("");
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategeoryAttributes = async () => {
    try {
      const fetchUrl = new URL(`${import.meta.env.VITE_API_URL}/attributes_for_create_listing`) 
      fetchUrl.searchParams.append("category_id", categoryId)
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error("Failed to fetch attributes");
      }

      const data: [Attribute[], AttributeData[]] = await response.json();
      setAttributes(data[0]);
      setAttributeData(data[1]);
    } catch (error) {
      console.error("Error fetching attributes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategeoryAttributes();
  }, [categoryId]);

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
      let attributeIDs: number[] = []
      nullAttributes.map((attribute)=> {
        attribute.id && attributeIDs.push(attribute.id)
      }

      )
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
        createdAttributes.map((attribute) =>{
          attribute.id && attributeIDs.push(attribute.id)
        }

        )
        
      }
      
      const attributeDataWithAttributeID = attributeData.map((attributeData) => ({
        ...attributeData,

        attribute_id: attributeIDs[attributeData.attribute_id]
      }));
      console.log(attributeDataWithAttributeID, "pravi", attributeIDs, attributeData)
      if (attributeDataWithAttributeID.length > 0) {
        const response3 = await fetch(`${import.meta.env.VITE_API_URL}/attribute_datas`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attributeDataWithAttributeID),
        });

        if (!response3.ok) {
          throw new Error("Failed to add attributes");
        }

        const createdAttributeData = await response3.json();
        console.log("Attributes added:", createdAttributeData);
        
      }

      setName("");
      setCategoryId("");
      setDescription("");
      setAttributes([]);

      fetchCategories();
      fetchNullAttributes();
    } catch (error) {
      console.error("Error adding category:", error);
    }
  };

  return (
    <>
      <head>
        <title>Create Listing</title>
      </head>
      <form
        onSubmit={addCategory}
        className="px-18"
      >
        <div className="rounded border border-gray-400 px-3 py-2 bg-white">
          <label htmlFor="name" className="font-medium pr-2">Listing name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="border-2"
            placeholder="Type here"
          />
        </div>

        <div className="rounded border border-gray-400 px-3 py-2 bg-white">
          <label htmlFor="categoryId" className="font-medium pr-2">Category:</label>
          <select
            id="categoryId"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={loading}
            className="border-2"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
           <label htmlFor="description" className="font-medium pr-2">Category:</label>
           <textarea id="description" value={description} name="description" onChange={(e) => setDescription(e.target.value)}> </textarea>
        </div>
        <button type="submit" className="rounded border border-gray-500 px-4 py-2 bg-white hover:bg-gray-200">Add Listing</button>
      </form>

      
      <AttributeList attributes={[...nullAttributes, ...attributes]} attributeData={attributeData} setAttributeData={setAttributeData} />
      <Outlet />
    </>
  );
}

export default CreateCategory;