import type { Attribute, AttributeData } from "../../types";
import { CreateListingAttributeCard } from "./CreateListingAttributeCard";

type Props = {
  attributes: Attribute[];
  attributeData: AttributeData[];
  listingValues: Record<number, string[]>;
  setListingValues: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
};

export const CreateListingAttributeList = ({
  attributes,
  attributeData,
  listingValues,
  setListingValues,
}: Props) => {
  if (attributes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No attributes available for this category.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {attributes.map((attribute) => {
        if (!attribute.id) return null;

        return (
          <CreateListingAttributeCard
            key={attribute.id}
            attribute={attribute}
            attributeData={attributeData}
            listingValues={listingValues}
            setListingValues={setListingValues}
            attribute_id={attribute.id}
          />
        );
      })}
    </div>
  );
};