import { DataTypeEnum, type Attribute, type AttributeData } from "../../types";
import { AttributeDataForm } from "./AttributeDataForm";

type Props = {
  attribute: Attribute;
  attributeData: AttributeData[];
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
  attribute_id: number;
  editable?: boolean;
  onUpdateAttribute?: (attribute: Attribute) => void;
  onDeleteAttribute?: () => void;
};

export const AttributeCard = ({
  attribute,
  attributeData,
  setAttributeData,
  attribute_id,
  editable = false,
  onUpdateAttribute,
  onDeleteAttribute,
}: Props) => {
  const filteredAttributeData = attributeData
    .map((ad, index) => ({ ...ad, originalIndex: index }))
    .filter((ad) => ad.attribute_id === attribute_id);

  const updateAttribute = (changes: Partial<Attribute>) => {
    onUpdateAttribute?.({ ...attribute, ...changes });
  };

  const deleteAttributeValue = (originalIndex: number) => {
    setAttributeData((currentAttributeData) =>
      currentAttributeData.filter((_, index) => index !== originalIndex)
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        {/* Left side */}
        <div className="w-full space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {attribute.name}
              </h3>
              <p className="text-sm text-slate-500">Attribute configuration</p>
            </div>

            {editable && (
              <button
                type="button"
                onClick={onDeleteAttribute}
                className="self-start rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                Delete Attribute
              </button>
            )}
          </div>

          {editable ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <label
                  htmlFor={`attribute-name-${attribute_id}`}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Name
                </label>
                <input
                  id={`attribute-name-${attribute_id}`}
                  type="text"
                  value={attribute.name}
                  onChange={(e) => updateAttribute({ name: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`attribute-type-${attribute_id}`}
                  className="block text-sm font-semibold text-slate-700"
                >
                  Data type
                </label>
                <select
                  id={`attribute-type-${attribute_id}`}
                  value={attribute.data_type}
                  onChange={(e) =>
                    updateAttribute({ data_type: e.target.value as DataTypeEnum })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
                >
                  {Object.values(DataTypeEnum).map((enumVal) => (
                    <option key={enumVal} value={enumVal}>
                      {enumVal}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-1">
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={attribute.multiple_choice}
                    onChange={(e) =>
                      updateAttribute({ multiple_choice: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Multiple choice
                  </span>
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={attribute.user_written}
                    onChange={(e) =>
                      updateAttribute({ user_written: e.target.checked })
                    }
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium text-slate-700">
                    User written
                  </span>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                Type: {attribute.data_type}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  attribute.multiple_choice
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                Multiple choice: {attribute.multiple_choice ? "Yes" : "No"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  attribute.user_written
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                User written: {attribute.user_written ? "Yes" : "No"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attribute data form */}
      {!attribute.user_written && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <AttributeDataForm
            attributeData={attributeData}
            setAttributeData={setAttributeData}
            attribute_id={attribute_id}
          />
        </div>
      )}

      {/* Existing attribute data values */}
      {filteredAttributeData.length > 0 && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Attribute values
          </p>

          <div className="flex flex-wrap gap-2">
            {filteredAttributeData.map((ad, index) => (
              <span
                key={`${ad.name}-${ad.originalIndex}-${index}`}
                className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm text-orange-700"
              >
                {ad.name}
                <button
                  type="button"
                  onClick={() => deleteAttributeValue(ad.originalIndex)}
                  className="text-xs font-bold text-orange-500 transition hover:text-red-600"
                  aria-label={`Delete ${ad.name}`}
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};