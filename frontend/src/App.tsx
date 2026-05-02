import Categories from "./views/Categories";
import CreateCategory from "./views/CreateCategory";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./views/components/Navbar";
import Listings from "./views/Listings";
import ImageUpload from "./views/ImageUpload";
import Login from "./views/Login";



export default function App() {
  return (
    <>
    <div className="bg-gray-100">
    <Navbar></Navbar>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Categories />} />
        <Route path="/create" element={<CreateCategory />}></Route>
        <Route path="/categories" element={<Categories />}></Route>
        <Route path="/listings" element={<Listings />}></Route>
        <Route path="/imageupload" element={<ImageUpload />}></Route>
        <Route path="/login" element={<Login />}></Route>
      </Routes>
    </BrowserRouter>
     </div>
    </>
  );
}