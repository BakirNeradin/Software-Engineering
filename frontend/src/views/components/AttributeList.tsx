import type { Attribute, AttributeData } from "../../types";
import { AttributeCard } from "./AttributeCard"

type Props = {
  attributes: Attribute[];
  attributeData: AttributeData[]
  setAttributeData: React.Dispatch<React.SetStateAction<AttributeData[]>>;
};


export const AttributeList = ({ attributes, attributeData, setAttributeData }: Props) => {
  



 return (
    <>
    {attributes.map((attribute, i) => {
        return (<AttributeCard attribute={attribute} attributeData={attributeData} setAttributeData={setAttributeData} attribute_id={i}/>)
    })}
    </>
  );
  
};
