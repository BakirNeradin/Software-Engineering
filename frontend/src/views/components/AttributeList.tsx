import type { Attribute, AttributeData } from "../../types";
import { AttributeCard } from "./AttributeCard";

type Props = {
  attributes: Attribute[];
  attributeData: AttributeData[];
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
  editableStartIndex?: number;
  onUpdateAttribute?: (index: number, attribute: Attribute) => void;
  onDeleteAttribute?: (index: number) => void;
};

export const AttributeList = ({
  attributes,
  attributeData,
  setAttributeData,
  editableStartIndex = attributes.length,
  onUpdateAttribute,
  onDeleteAttribute,
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
          key={attribute.id ? `existing-${attribute.id}` : `new-${i}`}
          attribute={attribute}
          attributeData={attributeData}
          setAttributeData={setAttributeData}
          attribute_id={i}
          editable={i >= editableStartIndex}
          onUpdateAttribute={(updatedAttribute) =>
            onUpdateAttribute?.(i, updatedAttribute)
          }
          onDeleteAttribute={() => onDeleteAttribute?.(i)}
        />
      ))}
    </div>
  );
};