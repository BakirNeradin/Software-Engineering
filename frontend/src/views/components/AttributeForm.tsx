import { useState } from "react";
import { DataTypeEnum, type Attribute } from "../../types";

type Props = {
  attributes: Attribute[];
  setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>;
};
const AttributeForm = ({ attributes, setAttributes }: Props) => {
  const [name, setName] = useState("");
  const [dataType, setDataType] = useState(DataTypeEnum.TEXT);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [userWritten, setUserWritten] = useState(false);

  const addAttribute = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const attribute = {
      name,
      data_type: dataType,
      multiple_choice: multipleChoice,
      user_written: userWritten,
    };
    setAttributes([...attributes, attribute]);

    setName("");
    setDataType(DataTypeEnum.TEXT);
    setMultipleChoice(false);
    setUserWritten(false);
  };

  return (
    <form
      onSubmit={addAttribute}
      className="space-y-6 rounded-2xl border border-slate-200 bg-slate-50 p-6"
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900">Add Attribute</h3>
        <p className="mt-1 text-sm text-slate-600">
          Create a new attribute that can be assigned to a category.
        </p>
      </div>

      
      <div className="space-y-2">
        <label
          htmlFor="name"
          className="block text-sm font-semibold text-slate-700"
        >
          Attribute name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Enter attribute name"
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="dataType"
          className="block text-sm font-semibold text-slate-700"
        >
          Data type
        </label>
        <select
          id="dataType"
          value={dataType}
          onChange={(e) => setDataType(e.target.value as DataTypeEnum)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
        >
          {Object.values(DataTypeEnum).map((enumVal) => (
            <option key={enumVal} value={enumVal}>
              {enumVal}
            </option>
          ))}
        </select>
      </div>

      
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Multiple choice
          </p>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <input
                type="radio"
                name="multipleChoice"
                checked={multipleChoice === true}
                onChange={() => setMultipleChoice(true)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">True</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <input
                type="radio"
                name="multipleChoice"
                checked={multipleChoice === false}
                onChange={() => setMultipleChoice(false)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">False</span>
            </label>
          </div>
        </div>

        
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            User written
          </p>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <input
                type="radio"
                name="userWritten"
                checked={userWritten === true}
                onChange={() => setUserWritten(true)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">True</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50">
              <input
                type="radio"
                name="userWritten"
                checked={userWritten === false}
                onChange={() => setUserWritten(false)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">False</span>
            </label>
          </div>
        </div>
      </div>

      
      <div className="flex justify-end border-t border-slate-200 pt-4">
        <button
          type="submit"
          className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98]"
        >
          Add Attribute
        </button>
      </div>
    </form>
  );
};

export default AttributeForm;
