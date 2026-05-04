export enum DataTypeEnum {
  TEXT = "text",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "date",
}

export enum RoleEnum {
    USER = "user",
    ADMIN = "admin",
    GUEST = "guest"
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

export type AttributeData = {
  id?: number;
  name: string;
  attribute_id: number;
};

export type LoginData = {
  username: string;
  password: string;
}

export type RegisterData = {
  email: string;
  username: string;
  password: string;
}