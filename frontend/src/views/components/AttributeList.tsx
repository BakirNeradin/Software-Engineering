import type { Attribute } from "../../types";
import { AttributeCard } from "./AttributeCard"

type Props = {
  attributes: Attribute[];
};


export const AttributeList = ({ attributes }: Props) => {
  

console.log("nesto", attributes)

 return (
    <>
    {attributes.map((attribute) => {
        return (<AttributeCard attribute={attribute}/>)
    })}
    </>
  );
  
};
