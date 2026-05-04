import { useAuth } from "../../contexts/AuthProvider";

export default function Navbar() {
  const { userName, logout } = useAuth();

  return (
    <header className="w-full bg-slate-900 text-white">
      {/* Top row */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left */}
        <div className="flex items-center gap-10">
          {/* Logo */}
          <span className="text-3xl font-bold text-orange-400">Market</span>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-gray-300">
            <a href="#" className="hover:text-white transition">
              Home
            </a>
            <a href="/categories" className="hover:text-white transition">
              Categories
            </a>
          </nav>
        </div>

        {/* Right */}
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
            <span className="hidden md:block text-sm text-gray-300">
              {userName}
            </span>
            <button
              onClick={logout}
              className="rounded-md border border-gray-600 px-3 py-2 text-sm font-medium hover:bg-gray-800"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Search row */}
      <div className="flex items-center gap-4 px-6 pb-4">
        {/* Search */}
        <div className="flex h-12 flex-1 items-center rounded-md bg-white px-4 text-black">
          <input
            type="text"
            placeholder="Search listings..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>

        
        <button className="hidden md:flex h-12 items-center rounded-md bg-orange-500 px-5 text-sm font-semibold text-white hover:bg-orange-400 transition">
          Publish listing
        </button>
      </div>
    </header>
  );
}
