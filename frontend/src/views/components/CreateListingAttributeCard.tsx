import { useState } from "react";
import { DataTypeEnum, type Attribute, type AttributeData } from "../../types";

type Props = {
  attributeData: AttributeData[];
  attribute: Attribute;
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
  attribute_id: number;
};

export const AttributeDataForm = ({
  attributeData,
  setAttributeData,
  attribute_id,
  attribute,
}: Props) => {
  const [name, setName] = useState("");

  const addAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const attribute_data = {
      name: name,
      attribute_id: attribute_id,
    };
    setAttributeData([...attributeData, attribute_data]);
    setName("");
  };

  return (
    <form onSubmit={addAttribute}>
      {attribute.user_written ? (
        <div className="rounded border border-gray-400 px-1 py-2 bg-white">
          <label htmlFor="name">${attribute.name}: </label>
          {attribute.data_type === DataTypeEnum.BOOLEAN ? (
            <>
              <label>
                <input
                  type="radio"
                  name={`attr_${attribute.id}`}
                  value="true"
                />
                Yes
              </label>
              <br />

              <label>
                <input
                  type="radio"
                  name={`attr_${attribute.id}`}
                  value="false"
                />
                No
              </label>
            </>
          ) : (
            <input
              id={`attr_${attribute.id}`}
              type={attribute.data_type}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
        </div>
      ) : attribute.multiple_choice ? (
        <div className="rounded border border-gray-400 px-1 py-2 bg-white">
          <label htmlFor="name">Attribute data name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      ) : (
        <div className="rounded border border-gray-400 px-1 py-2 bg-white">
          <label htmlFor="name">Attribute data name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      )}
      <button
        type="submit"
        className="rounded border border-gray-500 px-4 py-2 bg-white hover:bg-gray-200"
      >
        Add Attribute data
      </button>
    </form>
  );
};