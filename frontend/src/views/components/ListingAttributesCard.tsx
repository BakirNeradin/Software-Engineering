import type { Attribute, ListingAttributeData } from "../../types";


type Props = {
  attributes: Attribute[];
  attributesData: ListingAttributeData[];
};

export const ListingAttributesCard = ({
  attributes,
  attributesData,
}: Props) => {
  const formattedAttributes = attributes.map((attr) => {
    const data = attributesData.filter((ad) => ad.attribute_id === attr.id);

    return {
      ...attr,
      data,
    };
  });

  const filteredAttributes = formattedAttributes.filter(
    (attr) => attr.data.length > 0
  );

  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 border-b pb-3 text-xl font-semibold text-gray-800">
        Listing details
      </h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredAttributes.map((attr) => (
          <div
            key={attr.id}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4 transition hover:border-blue-300 hover:bg-blue-50/40"
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {attr.name}
            </p>

            <div className="flex flex-wrap gap-2">
              {attr.data.map((d) => (
                <span
                  key={d.id}
                  className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-400 shadow-sm ring-1 ring-gray-200"
                >
                  {d.value}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};