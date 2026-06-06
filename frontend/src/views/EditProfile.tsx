import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthProvider";
import type { Locations, User } from "../types";

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

function EditProfile() {
  const { profileUserId } = useParams();
  const { token, userId, updateUserName } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<User>();
  const [locations, setLocations] = useState<Locations[]>([]);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [locationId, setLocationId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profileUserId || userId !== profileUserId) {
      navigate(`/profilepage/${profileUserId || userId}`);
      return;
    }

    const loadProfile = async () => {
      setLoading(true);
      setError("");

      try {
        const [userResponse, locationsResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/get_user_by_id?user_id=${profileUserId}`),
          fetch(`${import.meta.env.VITE_API_URL}/locations`),
        ]);

        if (!userResponse.ok) {
          throw new Error("Could not load profile information.");
        }

        if (!locationsResponse.ok) {
          throw new Error("Could not load locations.");
        }

        const userData = await userResponse.json();
        const locationsData = await locationsResponse.json();

        setUser(userData);
        setUsername(userData.username || "");
        setEmail(userData.email || "");
        setLocationId(String(userData.location_id || ""));
        setLocations(locationsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not load profile information.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileUserId, userId, navigate]);

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!profileUserId) {
      return;
    }

    setSaving(true);
    setError("");

    if (password || confirmPassword) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setSaving(false);
        return;
      }
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${profileUserId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        location_id: Number(locationId),
        password: password || null,
      }),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(getErrorMessage(result, "Could not update profile."));
      setSaving(false);
      return;
    }

    updateUserName(result.username || username);
    navigate(`/profilepage/${profileUserId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-sm text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-8 md:px-8">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Edit profile</h1>
          <p className="mt-1 text-sm text-slate-500">
            Update your marketplace profile information.
          </p>
        </div>

        {user ? (
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-slate-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                required
                disabled={saving}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={saving}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-semibold text-slate-700">
                Location
              </label>
              <select
                id="location"
                required
                disabled={saving}
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                New password
              </label>
              <input
                id="password"
                type="password"
                disabled={saving}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                disabled={saving}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={() => navigate(`/profilepage/${profileUserId}`)}
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:active:scale-100"
              >
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </form>
        ) : (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error || "Profile not found."}
          </p>
        )}
      </div>
    </div>
  );
}

export default EditProfile;