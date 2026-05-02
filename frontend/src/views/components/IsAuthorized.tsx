import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import Listings from "../Listings";

type Props = {
  fallback?: any;
  children: React.ReactNode;
};

const IsAuthorized = ({ fallback = <Listings />, children }: Props) => {
  const [userRole, setUserRole] = useState<String>("");
  console.log("ovo je to");

  const API_URL = "http://localhost:8000";
  const get_role = async (userId: string) => {
    const res = await fetch(`${API_URL}/get_role?id=${userId}`);
    const data = await res.json();
    setUserRole(data);
    console.log(data, "DATA");
  };
  const { userId } = useAuth();
  useEffect(() => {
    get_role(userId);
  }, []);
  const isAuthorized = userRole === "admin";
  if (isAuthorized) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default IsAuthorized;