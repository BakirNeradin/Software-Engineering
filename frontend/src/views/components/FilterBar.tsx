import { useEffect, useState } from "react";
import { DataTypeEnum, type Attribute, type AttributeData, type Locations } from "../../types";
import { FilterBarOption } from "./FilterBarOption";
import { FilterBarRange } from "./FilterBarRange";
import { FilterBarBoolean } from "./FilterBarBoolean";
import { FilterBarMultiple } from "./FilterBarMultiple";


export const FilterBar = ({ categoryId }: { categoryId?: string }) => {
  const [attributeCat, setAttributeCat] = useState<Attribute[]>([]);
  const [locations, setLocations] = useState<Locations[]>([]);
  const [attributeCatData, setAttributeCatData] = useState<AttributeData[]>([]);

  const loadAttributesFilter = async () => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/attributes_for_create_listing${
        categoryId ? `?category_id=${categoryId}` : ""
      }`,
    );
    
    const data = await res.json();
    setAttributeCat(data[0]);
    setAttributeCatData(data[1]);
  };
  const loadLocations = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/locations`);
    const data = await res.json();
    setLocations(data);
  };

  useEffect(() => {
    loadAttributesFilter();
    loadLocations();
  }, [categoryId]);
  console.log(locations, "da znamo sta je")

  return (
    <div className="mx-auto mb-6 w-full max-w-368 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Filters</h2>
          <p className="text-xs text-slate-500">Refine listings by category details.</p>
        </div>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
          {attributeCat.length} available
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {attributeCat.map((ac) =>
          ac.multiple_choice ? (
            <FilterBarMultiple
              attributeData={attributeCatData}
              key={ac.id}
              attribute={ac}
            />
          ) : !ac.user_written && ac.data_type !== DataTypeEnum.BOOLEAN ? (
            <FilterBarOption
              locations={locations}
              attributeData={attributeCatData}
              key={ac.id}
              attribute={ac}
            />
          ) : ac.user_written && ac.data_type === DataTypeEnum.NUMBER ? (
            <FilterBarRange key={ac.id} attribute={ac} />
          ) : !ac.user_written &&
            !ac.multiple_choice &&
            ac.data_type === DataTypeEnum.BOOLEAN ? (
            <FilterBarBoolean key={ac.id} attribute={ac} />
          ) : null,
        )}
      </div>
    </div>
  );
};