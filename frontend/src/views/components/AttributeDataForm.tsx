import { useState } from "react";
import { type AttributeData } from "../../types";

type Props = {
  attributeData: AttributeData[]
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
  attribute_id: number
};

export const AttributeDataForm = ({ attributeData, setAttributeData, attribute_id }: Props) => {
  const [name, setName] = useState("");
 
  

  const addAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const attribute_data = {
      name: name,
      attribute_id: attribute_id
      
    };
    setAttributeData([...attributeData, attribute_data]);
    setName("")
  };

  return (
    <form onSubmit={addAttribute} style={{
    border: "1px solid #af1b1b",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px"
  }}>
      <div>
        <label htmlFor="name">Attribute data name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <button type="submit">Add Attribute data</button>
    </form>
  );
};
