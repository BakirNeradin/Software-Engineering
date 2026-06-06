import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { RoleEnum, type Locations, type RegisterData } from "../types";

const getErrorMessage = (result: any, fallback: string) => {
  if (typeof result?.detail === "string") {
    return result.detail;
  }

  if (Array.isArray(result?.detail) && result.detail.length > 0) {
    return result.detail
      .map((item: any) => item?.msg || item?.message)
      .filter(Boolean)
      .join(", ");
  }

  return result?.message || fallback;
};

function Registration() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [locations, setLocations] = useState<Locations[]>([])
  const [locationId, setLocationId] = useState<string>("1")
  
  const loadLocations = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/locations`);
    const data = await res.json();
    setLocations(data);
  };
  useEffect(() => {
    loadLocations();
  }, []);

  const register = async (data: RegisterData) => {
     

      const fetchUrl = new URL(`${import.meta.env.VITE_API_URL}/users`)
      fetchUrl.searchParams.append("email", data.email)
      fetchUrl.searchParams.append("username", data.username);
      fetchUrl.searchParams.append("password", data.password);
      fetchUrl.searchParams.append("role", RoleEnum.USER );
      fetchUrl.searchParams.append("disabled", "false")
      fetchUrl.searchParams.append("location_id", locationId)
  
      const response = await fetch(fetchUrl, {
        method: "POST"
      });

      let result: any = {};
      try {
        result = await response.json();
      } catch {
        result = {};
      }
  
      
      if (!response.ok) {
        throw new Error(getErrorMessage(result, "Registration failed"));
      }
  
  
      
  
      
  
      navigate("/login")
    };

  const handleRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    const email = formData.get("email")?.toString() || "";
    const username = formData.get("username")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    try {
      await register({ email, username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start mt-25 justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Welcome</h1>
          <p className="mt-1 text-sm text-slate-500">
            Register your account
          </p>
        </div>

        <form onSubmit={handleRegistration} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-slate-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              disabled={loading}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-slate-700"
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              required
              disabled={loading}
              placeholder="Enter your username"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-slate-700"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              disabled={loading}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-slate-700"
            >
              Location
            </label>
            <select
              id="location"
              name="location"
              required
              disabled={loading}
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100">
               {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))} 
            </select>
  
          </div>

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-orange-500 transition hover:text-orange-400 hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Registration;