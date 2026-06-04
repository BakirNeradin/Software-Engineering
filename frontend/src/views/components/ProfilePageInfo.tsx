import { useEffect, useState } from "react";
import type { Locations, User } from "../../types";


type ProfilePageInfoProps = {
  userData: User;
  
};



function ProfilePageInfo({userData}: ProfilePageInfoProps) {
    const [location, setLocation] = useState<Locations>();
    const loadLocations = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/location_by_id?id=${userData.location_id}`);
    const data = await res.json();
    setLocation(data);
    
  };
  useEffect(() => {
      loadLocations();
    }, []);
  return (
    <div>
        <p>{userData.username}</p>
        <p>{location?.name}</p>
    </div>
  );
}

export default ProfilePageInfo;