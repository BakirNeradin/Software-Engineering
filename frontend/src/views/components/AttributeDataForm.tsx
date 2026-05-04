import { useState } from "react";
import { type AttributeData } from "../../types";

type Props = {
  attributeData: AttributeData[];
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
  attribute_id: number;
};

export const AttributeDataForm = ({
  attributeData,
  setAttributeData,
  attribute_id,
}: Props) => {
  const [name, setName] = useState("");

  const addAttribute = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const attribute_data = {
      name,
      attribute_id,
    };
    setAttributeData([...attributeData, attribute_data]);
    setName("");
  };

  return (
    <form onSubmit={addAttribute} className="space-y-3">
      <div>
        <label
          htmlFor={`attribute-data-${attribute_id}`}
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Add attribute value
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={`attribute-data-${attribute_id}`}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Enter value"
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />

          <button
            type="submit"
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Add Value
          </button>
        </div>
      </div>
    </form>
  );
};
