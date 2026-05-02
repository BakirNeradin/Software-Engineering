import Categories from "./views/Categories";
import CreateCategory from "./views/CreateCategory";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./views/components/Navbar";
import Listings from "./views/Listings";
import ImageUpload from "./views/ImageUpload";
import Login from "./views/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import IsAuthenticated from "./views/components/IsAuthenticated";
import IsAuthorized from "./views/components/IsAuthorized.tsx";



export default function App() {
  return (
    <>
    <div className="bg-gray-100">
    <AuthProvider>
        <Navbar></Navbar>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Categories />} />
            <Route path="/create" element={<IsAuthenticated fallback={<Categories></Categories>}><CreateCategory /></IsAuthenticated>}></Route>
            <Route path="/categories" element={<IsAuthorized><Categories /></IsAuthorized>}></Route>
            <Route path="/listings" element={<Listings />}></Route>
            <Route path="/imageupload" element={<ImageUpload />}></Route>
            <Route path="/login" element={<Login />}></Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
     </div>
    </>
  );
}