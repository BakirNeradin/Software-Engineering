import { DataTypeEnum, type Attribute, type AttributeData } from "../../types";

type Props = {
  attributeData: AttributeData[];
  attribute: Attribute;
  setListingValues: React.Dispatch<React.SetStateAction<Record<number, string[]>>>;
  attribute_id: number;
  value: string[];
};

export const AttributeDataForm = ({
  attributeData,
  setListingValues,
  attribute_id,
  attribute,
  value,
}: Props) => {
  const handleSingleValueChange = (newValue: string) => {
    setListingValues((prev) => ({
      ...prev,
      [attribute_id]: newValue ? [newValue] : [],
    }));
  };

  const handleMultiValueChange = (optionValue: string, checked: boolean) => {
    setListingValues((prev) => {
      const currentValues = prev[attribute_id] || [];

      if (checked) {
        return {
          ...prev,
          [attribute_id]: [...currentValues, optionValue],
        };
      }

      return {
        ...prev,
        [attribute_id]: currentValues.filter((v) => v !== optionValue),
      };
    });
  };

  const filteredOptions = attributeData.filter(
    (ad) => ad.attribute_id === attribute_id
  );

  return (
    <div className="space-y-3">
      <label
        htmlFor={`attr_${attribute.id}`}
        className="block text-sm font-semibold text-slate-700"
      >
        {attribute.name}
      </label>

      {attribute.user_written ? (
        attribute.data_type === DataTypeEnum.BOOLEAN ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50">
              <input
                type="radio"
                name={`attr_${attribute.id}`}
                value="true"
                checked={value[0] === "true"}
                onChange={(e) => handleSingleValueChange(e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">Yes</span>
            </label>

            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50">
              <input
                type="radio"
                name={`attr_${attribute.id}`}
                value="false"
                checked={value[0] === "false"}
                onChange={(e) => handleSingleValueChange(e.target.value)}
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">No</span>
            </label>
          </div>
        ) : (
          <input
            id={`attr_${attribute.id}`}
            type={attribute.data_type}
            value={value[0] || ""}
            onChange={(e) => handleSingleValueChange(e.target.value)}
            required
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
          />
        )
      ) : attribute.multiple_choice ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filteredOptions.map((option, index) => (
            <label
              key={index}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                value={option.name}
                checked={value.includes(option.name)}
                onChange={(e) =>
                  handleMultiValueChange(option.name, e.target.checked)
                }
                className="h-4 w-4"
              />
              <span className="text-sm text-slate-700">{option.name}</span>
            </label>
          ))}
        </div>
      ) : (
        <select
          id={`attr_${attribute.id}`}
          value={value[0] || ""}
          onChange={(e) => handleSingleValueChange(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200"
        >
          <option value="">Select value</option>
          {filteredOptions.map((option, index) => (
            <option key={index} value={option.name}>
              {option.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};