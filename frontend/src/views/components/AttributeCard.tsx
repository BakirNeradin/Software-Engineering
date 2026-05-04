import type { Attribute, AttributeData } from "../../types";
import { AttributeDataForm } from "./AttributeDataForm.tsx";

type Props = {
  attribute: Attribute;
  attributeData: AttributeData[];
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
  attribute_id: number;
};

export const AttributeCard = ({
  attribute,
  attributeData,
  setAttributeData,
  attribute_id,
}: Props) => {
  const filteredAttributeData = attributeData.filter(
    (ad) => ad.attribute_id === attribute_id,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
       
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {attribute.name}
            </h3>
            <p className="text-sm text-slate-500">Attribute configuration</p>
          </div>

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
        </div>
      </div>
      {!attribute.user_written && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <AttributeDataForm
            attributeData={attributeData}
            setAttributeData={setAttributeData}
            attribute_id={attribute_id}
          />
        </div>
      )}

      
      {filteredAttributeData.length > 0 && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <p className="mb-3 text-sm font-semibold text-slate-700">
            Attribute values
          </p>

          <div className="flex flex-wrap gap-2">
            {filteredAttributeData.map((ad, index) => (
              <span
                key={`${ad.name}-${index}`}
                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm text-orange-700"
              >
                {ad.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
