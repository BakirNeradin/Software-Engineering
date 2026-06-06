import { useEffect, useState } from "react";
import type { Locations, User } from "../../types";
import locationpic from "../../assets/locationpic.png";
import messagepic from "../../assets/messagepic.png";
import profilepic from "../../assets/profilepic.png";
import coin from "../../assets/coin.png";
import { useAuth } from "../../contexts/AuthProvider";


type ProfilePageInfoProps = {
  userData: User;
  profileUserId: string;
};



function ProfilePageInfo({userData, profileUserId}: ProfilePageInfoProps) {
    const [location, setLocation] = useState<Locations>();
    const {userId}= useAuth();
    const loadLocations = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/location_by_id?id=${userData.location_id}`);
    const data = await res.json();
    setLocation(data);
  };
  useEffect(() => {
      loadLocations();
    }, []);
  return (
    <div className="flex flex-col gap-3">
      <span className="flex flex-row items-center gap-2">
        <img className="size-8" src={profilepic}></img>
        <a href={`/profilepage/${profileUserId}`} className="font-semibold text-slate-900">{userData.username}</a>
      </span>

      <span className="flex flex-row items-center gap-2">
        <img className="size-8" src={locationpic}></img>
        <p className="text-sm text-slate-600">{location?.name}</p>
      </span>  
    {userId===profileUserId?
      <>
        <span className="flex flex-row items-center gap-2">
          <img className="size-8" src={coin}></img>
          <p className="text-sm text-slate-600">{userData.points} points</p>
        </span>
        <a
          href={`/profilepage/${profileUserId}/edit`}
          className="mt-2 rounded-xl bg-orange-50 px-3 py-2 text-center text-sm font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white"
        >
          Edit profile information
        </a>
      </> : null } 

      {userId!==profileUserId? <a href={`/messages?user_id=${profileUserId}`} className="mt-2 flex flex-row items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-600 transition hover:bg-orange-500 hover:text-white">
        <img className="size-8" src={messagepic}></img>
        <p>Send Message</p>
      </a> : null }
      
    </div>
  );
}

export default ProfilePageInfo;