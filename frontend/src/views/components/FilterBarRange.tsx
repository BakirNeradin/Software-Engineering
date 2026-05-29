import { useEffect, useState } from "react";
import type { Attribute } from "../../types";
import { useFilters } from "../../hooks/useFilter";


export const FilterBarRange = ({attribute }: {attribute: Attribute}) => {
   const [selectedAttributeFrom, setSelectedAttributeFrom] = useState<string>("")
   const [selectedAttributeTo, setSelectedAttributeTo] = useState<string>("")
    const { filters, setFilters } = useFilters();
    


    


     useEffect(() => {
    setFilters([...filters, selectedAttributeFrom && !selectedAttributeTo ? {"attributeId": String(attribute.id), "type": "range", "from": selectedAttributeFrom}: !selectedAttributeFrom && selectedAttributeTo ? {"attributeId": String(attribute.id), "type": "range", "to": selectedAttributeTo}: selectedAttributeFrom && selectedAttributeTo ? {"attributeId": String(attribute.id), "type": "range", "from": selectedAttributeFrom, "to":selectedAttributeTo}: {"attributeId": String(attribute.id), "type": "range"}]);
  }, [selectedAttributeFrom, selectedAttributeTo]);

  return (
    <div className="bg-white w-full mx-auto">
        <div className="space-y-2">
                <label
                  htmlFor="attribute"
                  className="block text-sm font-semibold text-slate-700"
                >
                  {attribute.name}
                </label>
                <input 
                type="number"
                id="attribute"
                value={selectedAttributeFrom}
                 onChange={(e) => setSelectedAttributeFrom(e.target.value)}>
                </input>

                <input 
                type="number"
                id="attribute"
                value={selectedAttributeTo}
                 onChange={(e) => setSelectedAttributeTo(e.target.value)}>
                </input>
                
              </div>
    </div>
  );
};