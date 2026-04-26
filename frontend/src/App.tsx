import { useEffect, useState } from "react";
import Categories from "./views/Categories";
import CreateCategory from "./views/CreateCategory";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Test from "./views/Test";

type User = {
  id: number;
  name: string;
  email: string;
};

const API_URL = "http://localhost:8000";

function Users() {
  const [users, setUsers] = useState<User[]>([]);

  const loadUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    const data = await res.json();
    setUsers(data);
  };

  const addUser = async () => {
    await fetch(`${API_URL}/users?name=Demir32&email=demir2@test.com`, {
      method: "POST",
    });
    loadUsers();
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Users</h1>

      <button onClick={addUser}>Add User</button>

      <ul>
        {users.map((u) => (
          <li key={u.id}>
            {u.name} - {u.email}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Users />} />
        <Route path="/create" element={<CreateCategory />}>
          <Route path="car" element={<Categories />} />
          <Route path="bike" element={<Test />} />
        </Route>
        <Route path="/contact" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}