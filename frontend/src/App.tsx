import Categories from "./views/Categories";
import CreateCategory from "./views/CreateCategory";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Test from "./views/Test";
import Navbar from "./views/components/Navbar";



export default function App() {
  return (
    <>
    <div className="bg-gray-100">
    <Navbar></Navbar>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Test />} />
        <Route path="/create" element={<CreateCategory />}></Route>
        <Route path="/categories" element={<Categories />}></Route>
          
        
        <Route path="/contact" element={<Test />} />
      </Routes>
    </BrowserRouter>
     </div>
    </>
  );
}