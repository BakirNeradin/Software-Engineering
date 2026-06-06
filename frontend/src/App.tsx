import Categories from "./views/Categories";
import CreateCategory from "./views/CreateCategory";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./views/components/Navbar";
import Listings from "./views/Listings";

import Login from "./views/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import IsAuthenticated from "./views/components/IsAuthenticated";
import IsAuthorized from "./views/components/IsAuthorized";
import CreateListing from "./views/CreateListing";
import Registration from "./views/Registration";
import IndividualListing from "./views/IndividualListing";
import ProfilePage from "./views/ProfilePage";
import { PaymentSuccess } from "./views/PaymentSuccess";
import { PaymentCancel } from "./views/PaymentCancel";
import UserMessages from "./views/UserMessages";
import EditProfile from "./views/EditProfile";
import Home from "./views/Home";

export default function App() {
  return (
    <div className="bg-gray-100">
      <AuthProvider>
        
        <BrowserRouter>
        <Navbar></Navbar>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />}></Route>
            <Route path="/create" element={<IsAuthorized><CreateCategory /></IsAuthorized>}></Route>
            <Route path="/listings" element={<Listings />}></Route>
            <Route path="/login" element={<Login />}></Route>
            <Route path="/register" element={<Registration />}></Route>
            <Route path="/createlisting" element={<IsAuthenticated fallback={<Login></Login>}><CreateListing /></IsAuthenticated>}></Route>
            <Route path="/listing/:id" element={<IndividualListing />}></Route>
            <Route path="/profilepage/:profileUserId" element={<ProfilePage />}></Route>
            <Route path="/profilepage/:profileUserId/edit" element={<IsAuthenticated fallback={<Login></Login>}><EditProfile /></IsAuthenticated>}></Route>
            <Route path="/messages" element={<IsAuthenticated fallback={<Login></Login>}><UserMessages /></IsAuthenticated>}></Route>
            <Route path="/payment-success" element={<PaymentSuccess></PaymentSuccess>}></Route>
            <Route path="/payment-cancel" element={<PaymentCancel></PaymentCancel>}></Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}