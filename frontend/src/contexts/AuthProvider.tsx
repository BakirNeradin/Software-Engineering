import { useContext, createContext, useState } from 'react';
import Categories from '../views/Categories';
import CreateCategory from '../views/CreateCategory';
import Login from '../views/Login';
import React from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext({token: "",userId: "", login: {}, logout: {}});
const TOKEN_KEY = "token";

const router = createBrowserRouter([
    {
      path: "/",
      element: <Categories />,
      children: [
        {
          path: '/unauthenticated',
          element: <Categories />
        },
        {
          path: '/authenticated',
          element: (
            <Categories>
             
            </Categories>
          )
        },
        {
          path: '/authenticated-and-authorized',
          element: (
            <CreateCategory>
              
            </CreateCategory>
          )
        },
      ]
    },
    {
      path: '/login',
      element: <Login />
    },
    {
      path: "*",
      element: <h1>404 page not found!!</h1>
    }
  ])

  export default router;

export const AuthProvider = ({ children }: {children: React.ReactNode}) => {
    const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY) || "");
    let decoded = token?jwtDecode(token):{jti: ""};
    console.log(decoded,"najbitnije")
    const [userId, setUserId] = useState(decoded.jti || "");
    console.log(localStorage.getItem(TOKEN_KEY), "ovaj printr")
    const login = async (data: any) => {
        try {
            const response = await fetch(
                'http://localhost:8000/login/',
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                }
            );
            const result = await response.json();
            if(result) {
                setToken(result.access_token);
                decoded = jwtDecode(result.access_token)
                setUserId(decoded.jti || "")
                localStorage.setItem(TOKEN_KEY, result.access_token);
                router.navigate('/');
            }
            throw new Error(result.message);
        } catch (error) {
            console.log(error);
        }
    }

    const logout = () => {
        setUserId("");
        setToken("");
        localStorage.removeItem(TOKEN_KEY);
    }

    return (
        <AuthContext.Provider value={{ token, userId, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
}