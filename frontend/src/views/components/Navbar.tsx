import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthProvider";
import { useNavigate } from "react-router-dom";

type SearchUser = {
  id: string;
  username: string;
};


export default function Navbar() {
  const { userName, userId, logout } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [users, setUsers] = useState<SearchUser[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef<HTMLFormElement>(null);
    
  
    
    const get_role = async (userId: string) => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/get_role?id=${userId}`);
      const data = await res.json();
      setUserRole(data);
      
    };

    useEffect(() => {
      get_role(userId)
  }, [userId]);

  const loadUsers = async (search: string) => {
    const params = new URLSearchParams();
    params.append("search", search);

    const res = await fetch(`${import.meta.env.VITE_API_URL}/users_search?${params}`);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    const trimmedSearch = searchTerm.trim();

    if (!trimmedSearch) {
      setUsers([]);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadUsers(trimmedSearch);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    const closeSearch = (event: MouseEvent) => {
      if (!searchRef.current?.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", closeSearch);

    return () => document.removeEventListener("mousedown", closeSearch);
  }, []);

  const search = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate(`/listings?search=${encodeURIComponent(searchTerm)}`);
    setIsSearchOpen(false);
  }

  const openUserProfile = (user: SearchUser) => {
    navigate(`/profilepage/${user.id}`);
    setIsSearchOpen(false);
    setSearchTerm("");
  }

  return (
    <header className="w-full bg-slate-900 text-white">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-10">
          <span className="text-3xl font-bold text-orange-400">Market</span>

          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="/" className="hover:text-white transition">
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
        <form ref={searchRef} onSubmit={search} className="relative flex h-12 flex-1 items-center rounded-md bg-white px-4 text-black">
          <input
            type="text"
            placeholder="Search users or listings..."
            className="w-full bg-transparent outline-none text-sm"
            value={searchTerm}
            onFocus={() => setIsSearchOpen(true)}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsSearchOpen(true);
            }}
          />

          {isSearchOpen && searchTerm.trim() && (
            <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
              <div className="max-h-72 overflow-y-auto py-2">
                {users.length > 0 ? (
                  users.map((user) => {
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => openUserProfile(user)}
                        className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-slate-50"
                      >
                        <span className="text-sm font-semibold text-slate-900">
                          {user.username}
                        </span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-500">No users found.</p>
                )}
              </div>

              <button
                type="submit"
                className="flex w-full items-center justify-between border-t border-slate-200 px-4 py-3 text-left text-sm font-semibold text-orange-600 transition hover:bg-orange-50"
              >
                <span>Search listings</span>
                <span className="max-w-[60%] truncate text-xs text-slate-500">
                  {searchTerm || "All listings"}
                </span>
              </button>
            </div>
          )}
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