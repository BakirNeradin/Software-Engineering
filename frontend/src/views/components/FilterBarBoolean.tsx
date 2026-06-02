import { useEffect, useState } from "react";
import type { Attribute } from "../../types";
import { useFilters } from "../../hooks/useFilter";


export const FilterBarBoolean = ({ attribute }: { attribute: Attribute }) => {
  const [selectedAttributeBoolean, setSelectedAttributeBoolean] =
    useState<boolean>(false);

  const { filters, setFilters } = useFilters();
  const inputId = `filter-boolean-${attribute.id}`;

  useEffect(() => {
    setFilters([
      ...filters.filter(
        (f) => !(f.type === "exact" && f.attributeId === String(attribute.id)),
      ),
      ...(selectedAttributeBoolean
        ? [
            {
              attributeId: String(attribute.id),
              type: "exact" as const,
              value: "true",
            },
          ]
        : []),
    ]);
  }, [selectedAttributeBoolean]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-orange-200 hover:bg-white">
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-center justify-between gap-4"
      >
        <span className="text-sm font-semibold text-slate-800">{attribute.name}</span>
        <input
          type="checkbox"
          id={inputId}
          value={attribute.name}
          checked={selectedAttributeBoolean}
          onChange={(e) => setSelectedAttributeBoolean(e.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-orange-500 accent-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      </label>
    </div>
  );
};