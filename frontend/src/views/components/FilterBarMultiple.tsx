import { useEffect, useState } from "react";
import type { Attribute, AttributeData } from "../../types";
import { useFilters } from "../../hooks/useFilter";

export const FilterBarMultiple = ({
  attribute,
  attributeData,
}: {
  attribute: Attribute;
  attributeData: AttributeData[];
}) => {
  const [selectedAttributeMultiple, setSelectedAttributeMultiple] = useState<
    string[]
  >([]);

  const { filters, setFilters } = useFilters();

  const filteredOptions = attributeData.filter(
    (ad) => ad.attribute_id === attribute.id,
  );

  useEffect(() => {
    const value = selectedAttributeMultiple.join(",");

    setFilters([
      ...filters.filter(
        (f) => !(f.type === "exact" && f.attributeId === String(attribute.id)),
      ),
      ...(selectedAttributeMultiple.length > 0
        ? [
            {
              attributeId: String(attribute.id),
              type: "exact" as const,
              value,
            },
          ]
        : []),
    ]);
  }, [selectedAttributeMultiple]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-orange-200 hover:bg-white">
      <p className="mb-3 text-sm font-semibold text-slate-800">{attribute.name}</p>
      <div className="flex flex-wrap gap-2">
        {filteredOptions.map((ac) => (
          <label
            key={ac.id}
            htmlFor={`filter-multiple-${attribute.id}-${ac.id}`}
            className={`cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              selectedAttributeMultiple.includes(ac.name)
                ? "border-orange-400 bg-orange-50 text-orange-700"
                : "border-slate-200 bg-white text-slate-600 hover:border-orange-200 hover:text-slate-900"
            }`}
          >
            <input
              type="checkbox"
              id={`filter-multiple-${attribute.id}-${ac.id}`}
              value={ac.name}
              checked={selectedAttributeMultiple.includes(ac.name)}
              onChange={(e) => {
                const value = e.target.value;

                setSelectedAttributeMultiple((prev) =>
                  prev.includes(value)
                    ? prev.filter((item) => item !== value)
                    : [...prev, value],
                );
              }}
              className="sr-only"
            />
            {ac.name}
          </label>
        ))}
      </div>
    </div>
  );
};