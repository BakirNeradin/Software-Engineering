import { useEffect, useState } from "react";
import type { Attribute, AttributeData } from "../../types";
import { useFilters } from "../../hooks/useFilter";


export const FilterBarOption = ({attribute, attributeData }: {attribute: Attribute, attributeData: AttributeData[]}) => {
   const [selectedAttributeData, setSelectedAttributeData] = useState<string>("")
    const { filters, setFilters } = useFilters();
    


    const filteredOptions = attributeData.filter(
    (ad) => ad.attribute_id === attribute.id
  );

     useEffect(() => {
    setFilters([...filters, {"attributeId": String(attribute.id), "type": "exact", "value": selectedAttributeData}]);
  }, [selectedAttributeData]);

  return (
    <div className="bg-white w-full mx-auto">
        <div className="space-y-2">
                <label
                  htmlFor="attribute"
                  className="block text-sm font-semibold text-slate-700"
                >
                  {attribute.name}
                </label>
                <select
                  id="attribute"
                  value={selectedAttributeData}
                  onChange={(e) => setSelectedAttributeData(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:bg-slate-100"
                >
                  <option value="">None</option>
                  {filteredOptions.map((attributeData) => (
                    <option key={attributeData.id} value={attributeData.name}>
                      {attributeData.name}
                    </option>
                  ))}
                </select>
              </div>
    </div>
  );
};