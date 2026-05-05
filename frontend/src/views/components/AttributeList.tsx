import type { Attribute, AttributeData } from "../../types";
import { AttributeCard } from "./AttributeCard";

type Props = {
  attributes: Attribute[];
  attributeData: AttributeData[];
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
};


export const AttributeList = ({
  attributes,
  attributeData,
  setAttributeData,
}: Props) => {
  if (attributes.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
        No attributes added yet.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {attributes.map((attribute, i) => (
        <AttributeCard
          key={`${attribute.name}-${i}`}
          attribute={attribute}
          attributeData={attributeData}
          setAttributeData={setAttributeData}
          attribute_id={i}
        />
      ))}
    </div>
  );
  
};
