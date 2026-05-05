import type { Attribute, AttributeData } from "../../types";
import { AttributeDataForm } from "./CreateListingAttributeDataForm";

type Props = {
  attribute: Attribute;
  attributeData: AttributeData[];
  listingValues: Record<number, string[]>;
  setListingValues: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
  attribute_id: number;
};

export const CreateListingAttributeCard = ({
  attribute,
  attributeData,
  listingValues,
  setListingValues,
  attribute_id,
}: Props) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {attribute.name}
          </h3>
          <p className="text-sm text-slate-500">Listing field</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
            Type: {attribute.data_type}
          </span>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              attribute.multiple_choice
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-200 text-slate-700"
            }`}
          >
            Multiple: {attribute.multiple_choice ? "Yes" : "No"}
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

      <AttributeDataForm
        attribute={attribute}
        attributeData={attributeData}
        attribute_id={attribute_id}
        value={listingValues[attribute_id] || []}
        setListingValues={setListingValues}
      />
    </div>
  );
};