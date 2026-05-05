import Categories from "./views/Categories";
import CreateCategory from "./views/CreateCategory";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./views/components/Navbar";
import Listings from "./views/Listings";
import Login from "./views/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import IsAuthenticated from "./views/components/IsAuthenticated";
import IsAuthorized from "./views/components/IsAuthorized.tsx";
import CreateListing from "./views/CreateListing";
import Registration from "./views/Registration";



export default function App() {
  return (
    <>
    <div className="bg-gray-100">
    <AuthProvider>
        <Navbar></Navbar>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Categories />} />
            <Route path="/categories" element={<Categories />}></Route>
            <Route path="/create" element={<IsAuthorized><CreateCategory /></IsAuthorized>}></Route>
            <Route path="/listings" element={<Listings />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Registration />}></Route>
            <Route path="/createlisting" element={<IsAuthenticated fallback={<Login></Login>}><CreateListing /></IsAuthenticated>}></Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
     </div>
    </>
  );
}