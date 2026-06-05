import { useEffect, useState } from "react";
import type { Locations, User } from "../../types";
import locationpic from "../../assets/locationpic.png";
import messagepic from "../../assets/messagepic.png";
import profilepic from "../../assets/profilepic.png";
import coin from "../../assets/coin.png";


type ProfilePageInfoProps = {
  userData: User;
  userId: string;
};



function ProfilePageInfo({userData, userId}: ProfilePageInfoProps) {
    const [location, setLocation] = useState<Locations>();
    const loadLocations = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/location_by_id?id=${userData.location_id}`);
    const data = await res.json();
    setLocation(data);
    console.log(userData.points,"test")
  };
  useEffect(() => {
      loadLocations();
    }, []);
  return (
    <div className="flex sm:flex-col flex-row gap-2 py-6 sm:py-0">
      <span className="flex flex-row items-center gap-2">
        <img className="size-8" src={profilepic}></img>
        <p>{userData.username}</p>
      </span>

      <span className="flex flex-row items-center gap-2">
        <img className="size-8" src={locationpic}></img>
        <p>{location?.name}</p>
      </span>  

      <span className="flex flex-row items-center gap-2">
        <img className="size-8" src={coin}></img>
        <p>{userData.points}</p>
      </span>  

      <a href={`/messages/${userId}`} className="flex flex-row items-center gap-2">
        <img className="size-8" src={messagepic}></img>
        <p>Send Message</p>
      </a>
      
    </div>
  );
}

export default ProfilePageInfo;