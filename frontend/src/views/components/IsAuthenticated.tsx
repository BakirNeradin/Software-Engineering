import { useAuth } from "../../contexts/AuthProvider";
import Login from "../Login";
import React from "react";

type Props = {
  fallback: any;
  children: React.ReactNode
};

const IsAuthenticated = ({
  fallback=<Login />,
  children
}:Props) => {
  const { token } = useAuth();
  const isAuthenticated = !!token

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

export default IsAuthenticated;