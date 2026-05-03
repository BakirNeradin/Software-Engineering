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
import CreateListing from "./views/CreateListing";



export default function App() {
  return (
    <>
    <div className="bg-gray-100">
    <AuthProvider>
        <Navbar></Navbar>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Categories />} />
            <Route path="/categories" element={<IsAuthenticated fallback={<Login></Login>}><Categories /></IsAuthenticated>}></Route>
            <Route path="/create" element={<IsAuthorized><CreateCategory /></IsAuthorized>}></Route>
            <Route path="/listings" element={<Listings />}></Route>
            <Route path="/imageupload" element={<ImageUpload />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/createlisting" element={<CreateListing />}></Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
     </div>
    </>
  );
}