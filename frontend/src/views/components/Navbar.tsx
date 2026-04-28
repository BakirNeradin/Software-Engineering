export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-gray-300 mb-10">
      <div className="mx-auto flex items-center justify-between px-4 py-3">
        {/* Left side */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-5xl font-extrabold leading-none text-green-800">
              Market
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 text-[15px] font-medium text-green-800 lg:flex">
            <a href="#" className="hover:text-black">
              Home
            </a>
            <a href="#" className="hover:text-black">
              Categories
            </a>
            

            
          </nav>
        </div>

        {/* Right side */}
        <div className="hidden items-center gap-4 lg:flex">
          <button className="rounded-md px-3 py-2 text-sm font-medium bg-white text-slate-800 hover:bg-gray-100">
            Sign in
          </button>

          <button className="rounded-md bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-400">
            Sign up
          </button>
        </div>
      </div>

      {/* Search row */}
      <div className="mx-auto flex items-center gap-4 px-4 pb-4">
        {/* Search input */}
        <div className="flex h-14 flex-1 items-center rounded-md border border-gray-300 bg-white px-4 shadow-sm">
          
          <input
            type="text"
            placeholder="Search"
            className="w-full border-none bg-transparent text-base outline-none placeholder:text-slate-500"
          />
        </div>

        {/* Publish buttons */}
        <button className="hidden h-14 items-center gap-2 rounded-md border border-gray-300 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-gray-50 md:flex">
           
          Publish listing
        </button>

        
      </div>
    </header>
  );
}