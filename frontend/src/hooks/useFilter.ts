import { useSearchParams } from 'react-router-dom';

export type ExactFilter = { attributeId: string; type: 'exact'; value?: string };
export type RangeFilter = { attributeId: string; type: 'range'; from?: string; to?: string };
export type SearchFilter = { type: 'search'; value: string };
export type CategoryFilter = { type: 'category_id'; value: string };
export type Filter = ExactFilter | RangeFilter | SearchFilter | CategoryFilter;



export function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters: Filter[] = [];
  const search = searchParams.get("search")
  const category_id = searchParams.get("category_id")
  if (search !== null) {
      filters.push({type:"search", value:search});
  }
  if (category_id !== null) {
      filters.push({type:"category_id", value:category_id});
  }
  let i = 1;
  while (searchParams.has(`filter${i}`)) {
    const attributeId = searchParams.get(`filter${i}`)!;
    const exact       = searchParams.get(`value${i}`);
    const from        = searchParams.get(`value${i}_from`) ?? undefined;
    const to          = searchParams.get(`value${i}_to`) ?? undefined;

    if (exact !== null) {
      
      filters.push({ attributeId, type: 'exact', value: exact});
      
    } else if (from !== undefined || to !== undefined) {
      filters.push({ attributeId, type: 'range', from, to });
    }

    i++;
  }

  function setFilters(newFilters: Filter[]) {
  const params = new URLSearchParams();
  const existingAttributeIds: Record<string, number> = {};

  let filterIndex = 1;

  newFilters.forEach((filter) => {
    if (filter.type === "search") {
      params.set("search", filter.value);
      return;
    }

    if (filter.type === "category_id") {
      params.set("category_id", filter.value);
      return;
    }

    let n: number;

    if (filter.attributeId in existingAttributeIds) {
      n = existingAttributeIds[filter.attributeId];


      params.delete(`value${n}`);
      params.delete(`value${n}_from`);
      params.delete(`value${n}_to`);
    } else {
      n = filterIndex;
      existingAttributeIds[filter.attributeId] = n;
      filterIndex++;
    }

    params.set(`filter${n}`, filter.attributeId);

    if (filter.type === "exact" && filter.value) {
      
      params.set(`value${n}`, filter.value);
      
    }

    if (filter.type === "range") {
      if (filter.from != null) params.set(`value${n}_from`, filter.from);
      if (filter.to != null) params.set(`value${n}_to`, filter.to);
    }
    if (filter.type !== "range" && !filter.value){
        params.delete(`value${n}`);
        params.delete(`filter${n}`);
      }
      if (filter.type === "range" && !filter.to && !filter.from) {
        params.delete(`value${n}_from`);
        params.delete(`value${n}_to`);
        params.delete(`filter${n}`);
      }
  });

  setSearchParams(params);
}

  return { filters, setFilters };
}