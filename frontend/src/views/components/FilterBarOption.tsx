import { useEffect, useState } from "react";
import type { Attribute, AttributeData } from "../../types";
import { useFilters } from "../../hooks/useFilter";


export const FilterBarOption = ({
  attribute,
  attributeData,
}: {
  attribute: Attribute;
  attributeData: AttributeData[];
}) => {
  const [selectedAttributeData, setSelectedAttributeData] = useState<string>("");
  const { filters, setFilters } = useFilters();
  const inputId = `filter-option-${attribute.id}`;

  const filteredOptions = attributeData.filter(
    (ad) => ad.attribute_id === attribute.id,
  );

  useEffect(() => {
    setFilters([
      ...filters.filter(
        (f) => !(f.type === "exact" && f.attributeId === String(attribute.id)),
      ),
      ...(selectedAttributeData
        ? [
            {
              attributeId: String(attribute.id),
              type: "exact" as const,
              value: selectedAttributeData,
            },
          ]
        : []),
    ]);
  }, [selectedAttributeData]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-orange-200 hover:bg-white">
      <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-slate-800">
        {attribute.name}
      </label>
      <select
        id={inputId}
        value={selectedAttributeData}
        onChange={(e) => setSelectedAttributeData(e.target.value)}
        className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
      >
        <option value="">Any</option>
        {filteredOptions.map((attributeData) => (
          <option key={attributeData.id} value={attributeData.name}>
            {attributeData.name}
          </option>
        ))}
      </select>
    </div>
  );
};