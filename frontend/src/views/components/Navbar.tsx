import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";


export default function Navbar() {
  const { userName, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
    
  
    
    const get_role = async (userId: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/get_role?id=${userId}`);
      const data = await res.json();
      setUserRole(data);
      
    };

    useEffect(() => {
      get_role(userId)
  }, [userId]);

  const search = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/listings?search=${searchTerm}`)
  }

  return (
    <header className="w-full bg-slate-900 text-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <span className="text-3xl font-bold text-orange-400">Market</span>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#" className="hover:text-white transition">
              Home
            </a>
            <a href="/categories" className="hover:text-white transition">
              Categories
            </a>
            <a href="/listings" className="hover:text-white transition">
              Listings
            </a>
            {userRole === "admin" ? <a href="/create" className="hover:text-white transition">
              Create Category
            </a>: null }
          </nav>
        </div>

        {!userName ? (
          <div className="hidden lg:flex items-center gap-3">
            <a href="/login">
              <button className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white">
                Sign in
              </button>
            </a>
            <a href="/register">
              <button className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-400 transition">
                Sign up
              </button>
            </a>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <a href={`/profilepage/${userId}`} className="hidden md:block text-sm text-gray-300">
              {userName}
            </a>
            <button
              onClick={logout}
              className="rounded-md border border-gray-600 px-3 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 px-6 pb-4">
        <form onSubmit={search} className="flex h-12 flex-1 items-center rounded-md bg-white px-4 text-black">
          <input
            type="text"
            placeholder="Search listings..."
            className="w-full bg-transparent outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <a href="/createlisting">
          <button className="hidden md:flex h-12 items-center rounded-md bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-400 transition">
            Publish listing
          </button>
        </a>
      </div>
    </header>
  );
}