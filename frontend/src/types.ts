
export enum DataTypeEnum {
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    DATE = 'date'
}

export type Category = {
  id: number;
  name: string;
  parent_id: number | null;
};
export type Attribute = {
  id?: number;
  name: string;
  category_id?: number | null;
  data_type: DataTypeEnum;
  multiple_choice: boolean;
  user_written: boolean;
};