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
  console.log(attributeData);

  return (
    <div className="rounded border border-gray-400 px-1 py-2 bg-white">
      <p>Attribute name: {attribute.name}</p>
      <p>Data type: {attribute.data_type}</p>
      <p>
        Multiple choice: {attribute.multiple_choice == true ? "true" : "false"}
      </p>
      <p>User written: {attribute.user_written == true ? "true" : "false"}</p>
      {!attribute.user_written && (
        <AttributeDataForm
          attributeData={attributeData}
          setAttributeData={setAttributeData}
          attribute_id={attribute_id}
        />
      )}
      {attributeData.map((ad) => {
        return ad.attribute_id === attribute_id ? <p>{ad.name}</p> : null;
      })}
    </div>
  );
};
