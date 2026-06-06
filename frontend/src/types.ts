

export enum DataTypeEnum {
    TEXT = 'text',
    NUMBER = 'number',
    BOOLEAN = 'boolean',
    DATE = 'date'
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
  id: number;
  name: string;
  category_id?: number | null;
  data_type: DataTypeEnum;
  multiple_choice: boolean;
  user_written: boolean;
};
export type ListingImage = {
  image_url: string;
  id: number;
  listing_id: number;
}
export type Listing = {
  id: number;
  name: string;
  category_id: number;
  user_id: string;
  description: string;
  highlighted_until?: string;
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

export type ListingAttributeData = {
  attribute_id: number;
  value: string;
  listing_id: number;
  id: number;
}

export type User = {
  id: string;
  username: string;
  email: string;
  role: RoleEnum;
  location_id: number;
  disabled: boolean;
  points: number;
}

export type Locations = {
  id: number;
  name: string; 
}

export type UserMessages = {
  sender_id: string;
  sender_username: string;
  recipient_id: string;
  recipient_username: string;
  message: string;
  message_date: Date;
}

export type Review = {
  id: number;
  reviewing_user_id: string;
  reviewing_username: string;
  reviewed_user_id: string;
  rating: number;
  comment: string;
}
