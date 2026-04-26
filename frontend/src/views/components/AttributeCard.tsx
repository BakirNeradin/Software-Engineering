import type { Attribute } from "../../types";

type Props = {
  attribute: Attribute;
};


export const AttributeCard = ({ attribute }: Props) => {
  
console.log(attribute, "mehki")
  

 return (
    <div style={{
    border: "1px solid #ccc",
    padding: "16px",
    borderRadius: "8px",
    marginBottom: "20px"
  }}>
        <p>Attribute name: {attribute.name}</p>
        <p>Data type: {attribute.data_type}</p>
        <p>Multiple choice: {attribute.multiple_choice==true ? "true":"false"}</p>
        <p>User written: {attribute.user_written==true ? "true":"false"}</p>
    </div>
  );
};