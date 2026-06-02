import { useEffect, useState } from "react";
import type { Attribute } from "../../types";
import { useFilters } from "../../hooks/useFilter";


export const FilterBarRange = ({ attribute }: { attribute: Attribute }) => {
  const [selectedAttributeFrom, setSelectedAttributeFrom] = useState<string>("");
  const [selectedAttributeTo, setSelectedAttributeTo] = useState<string>("");
  const { filters, setFilters } = useFilters();
  const fromId = `filter-range-${attribute.id}-from`;
  const toId = `filter-range-${attribute.id}-to`;

  useEffect(() => {
    setFilters([
      ...filters.filter(
        (f) => !(f.type === "range" && f.attributeId === String(attribute.id)),
      ),
      ...(selectedAttributeFrom || selectedAttributeTo
        ? [
            {
              attributeId: String(attribute.id),
              type: "range" as const,
              ...(selectedAttributeFrom ? { from: selectedAttributeFrom } : {}),
              ...(selectedAttributeTo ? { to: selectedAttributeTo } : {}),
            },
          ]
        : []),
    ]);
  }, [selectedAttributeFrom, selectedAttributeTo]);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-orange-200 hover:bg-white">
      <p className="mb-2 text-sm font-semibold text-slate-800">{attribute.name}</p>
      <div className="grid grid-cols-2 gap-2">
        <label htmlFor={fromId} className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Min</span>
          <input
            type="number"
            id={fromId}
            value={selectedAttributeFrom}
            onChange={(e) => setSelectedAttributeFrom(e.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            placeholder="0"
          />
        </label>

        <label htmlFor={toId} className="space-y-1">
          <span className="text-xs font-medium text-slate-500">Max</span>
          <input
            type="number"
            id={toId}
            value={selectedAttributeTo}
            onChange={(e) => setSelectedAttributeTo(e.target.value)}
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
            placeholder="Any"
          />
        </label>
      </div>
    </div>
  );
};