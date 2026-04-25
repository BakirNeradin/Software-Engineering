import { useState } from "react";
import { DataTypeEnum, type Attribute } from "./types";


type Props = {
  attributes: Attribute[];
  setAttributes: React.Dispatch<React.SetStateAction<Attribute[]>>;
};
const AttributeForm = ({ attributes, setAttributes }: Props) => {
  const [name, setName] = useState("");
  const [dataType, setDataType] = useState(DataTypeEnum.TEXT);
  const [multipleChoice, setMultipleChoice] = useState(false);
  const [userWritten, setUserWritten] = useState(false);

  const addAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    const attribute = {
      name: name,
      data_type: dataType,
      multiple_choice: multipleChoice,
      user_written: userWritten,
    };
    setAttributes([...attributes, attribute]);
    console.log(attributes);
    console.log(attribute);
  };
  

  return (
    <form onSubmit={addAttribute}>
      <div>
        <label htmlFor="name">Attribute name:</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="dataType">Data type:</label>
        <select
          id="dataType"
          value={dataType}
          onChange={(e) => setDataType(e.target.value as DataTypeEnum)}
        >
          {Object.values(DataTypeEnum).map((enumVal) => (
            <option key={enumVal} value={enumVal}>
              {enumVal}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="multipleChoice">Multiple choice:</label>

        <div>
          <input
            onChange={(e) => setMultipleChoice(e.target.value === "true")}
            type="radio"
            id="multipleChoiceTrue"
            name="multipleChoice"
            value="true"
            checked={multipleChoice}
          />
          <label htmlFor="multipleChoiceTrue">True</label>
        </div>

        <div>
          <input
            onChange={(e) => setMultipleChoice(e.target.value === "true")}
            type="radio"
            id="multipleChoiceFalse"
            name="multipleChoice"
            value="false"
          />
          <label htmlFor="multipleChoiceFalse">False</label>
        </div>
      </div>

      <div>
        <label htmlFor="userWritten">User written:</label>

        <div>
          <input
            onChange={(e) => setUserWritten(e.target.value === "true")}
            type="radio"
            id="userWrittenTrue"
            name="userWritten"
            value="true"
            checked={userWritten}
          />
          <label htmlFor="userWrittenTrue">True</label>
        </div>

        <div>
          <input
            onChange={(e) => setUserWritten(e.target.value === "true")}
            type="radio"
            id="userWrittenFalse"
            name="userWritten"
            value="false"
          />
          <label htmlFor="userWrittenFalse">False</label>
        </div>
      </div>

      <button type="submit">Add Attribute</button>
    </form>
  );
};

export default AttributeForm;