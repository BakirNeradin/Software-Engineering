import { useEffect, useState } from "react";
import { DataTypeEnum, type Attribute, type AttributeData } from "../../types";
import { FilterBarOption } from "./FilterBarOption";
import { FilterBarRange } from "./FilterBarRange";


export const FilterBar = ({categoryId }: {categoryId?: string}) => {
    const [attributeCat, setAttributeCat] = useState<Attribute[]>([]);
    const [attributeCatData, setAttributeCatData] = useState<AttributeData[]>([]);

    const loadAttributesFilter = async () => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/attributes_for_create_listing${categoryId ? `?category_id=${categoryId}`: ""}`);
        const data = await res.json();
        setAttributeCat(data[0]);
        setAttributeCatData(data[1])
        
      };
    
      useEffect(() => {
        loadAttributesFilter();
      }, [categoryId]);
      console.log(attributeCat,"ac");
      console.log(attributeCatData,"acd");

      

  return (
    <div className="bg-white w-full mx-auto">
        {attributeCat.map((ac) => (
        !ac.user_written ? 
        <FilterBarOption attributeData={attributeCatData} key={ac.id} attribute={ac} />
        : ac.user_written && ac.data_type===DataTypeEnum.NUMBER ? <FilterBarRange key={ac.id} attribute={ac}></FilterBarRange>:null
        ))}
    </div>
);
};