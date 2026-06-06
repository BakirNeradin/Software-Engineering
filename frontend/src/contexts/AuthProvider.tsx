import { useContext, createContext, useState } from "react";
import Categories from "../views/Categories";
import CreateCategory from "../views/CreateCategory";
import Login from "../views/Login";
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import type { LoginData } from "../types";

type DecodedToken = {
  sub?: string;
  jti?: string;
};

type AuthContextType = {
  token: string;
  userId: string;
  userName: string;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  updateUserName: (name: string) => void;
};

const AuthContext = createContext<AuthContextType>({
  token: "",
  userId: "",
  userName: "",
  login: async () => {},
  logout: () => {},
  updateUserName: () => {},
});

const TOKEN_KEY = "token";

const getErrorMessage = (result: any, fallback: string) => {
  if (typeof result?.detail === "string") {
    return result.detail;
  }

  if (Array.isArray(result?.detail) && result.detail.length > 0) {
    return result.detail
      .map((item: any) => item?.msg || item?.message)
      .filter(Boolean)
      .join(", ");
  }

  return result?.message || fallback;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Categories />,
    children: [
      {
        path: "/unauthenticated",
        element: <Categories />,
      },
      {
        path: "/authenticated",
        element: <Categories />,
      },
      {
        path: "/authenticated-and-authorized",
        element: <CreateCategory />,
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <h1>404 page not found!!</h1>,
  },
]);

export default router;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const initialToken = localStorage.getItem(TOKEN_KEY) || "";
  const initialDecoded: DecodedToken = initialToken ? jwtDecode(initialToken) : {};

  const [token, setToken] = useState(initialToken);
  const [userName, setUserName] = useState(initialDecoded.sub || "");
  const [userId, setUserId] = useState(initialDecoded.jti || "");

  const login = async (data: LoginData) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);

    const response = await fetch(`${import.meta.env.VITE_API_URL}/token`, {
      method: "POST",
      body: formData,
    });

    let result: any = {};
    try {
      result = await response.json();
    } catch {
      result = {};
    }

    if (!response.ok) {
      throw new Error(getErrorMessage(result, "Login failed"));
    }

    if (!result.access_token) {
      throw new Error("No access token returned");
    }

    const decoded: DecodedToken = jwtDecode(result.access_token);

    setToken(result.access_token);
    setUserId(decoded.jti || "");
    setUserName(decoded.sub || "");
    localStorage.setItem(TOKEN_KEY, result.access_token);

    router.navigate("/");
  };

  const logout = () => {
    setUserId("");
    setToken("");
    setUserName("");
    localStorage.removeItem(TOKEN_KEY);
    router.navigate("/login");
  };

  const updateUserName = (name: string) => {
    setUserName(name);
  };

  return (
    <AuthContext.Provider value={{ token, userId, userName, login, logout, updateUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};