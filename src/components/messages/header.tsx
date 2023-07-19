"use client";

import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { store } from "@/store";
import { useAppSelector } from "@/store";
import "../../styles/dashboard.scss";
import "../../styles/header.scss";

const Header = () => {
  const [participants, setParticipants] = useState<any>([]);
  const groupID = store.getState().group.id;
  const groupName = useAppSelector((state) => state.group.name);

  const getParticipants = async () => {
    const { data: profiles, error } = await supabase
      .from("group_participants")
      .select("group_id, profiles (first_name, last_name)")
      .match({ group_id: groupID });
    // console.log(profiles)
    if (profiles) {
      setParticipants(profiles);
    }
  };

  useEffect(() => {
    getParticipants();
  }, [groupID]);

  return (
    <div className="header">
      <div className="headerAvatar">
        <div className="groupsCards" title={groupName}>
          <p className="groupIcon">{groupName.charAt(0).toUpperCase()}</p>
          <p className="groupNameP">{groupName}</p>
        </div>
        {/* <p>img</p> */}
        {participants.length > 0 && (
          // participants.map((participant: any, index: number) => {
          //   return (
          //     <div key={index + "participant"} className="participants">
          //       <p>
          //         {/* {index + 1 + "."}
          //         {participant.profiles.first_name}{" "}
          //         {participant.profiles.last_name} */}

          //       </p>
          //     </div>
          //   );
          // })
          <p className="participantNumber">({participants.length})</p>
        )}
      </div>
      <div className="headerOptions">
        <button>srch</button>
        <button>call</button>
        <button>vid</button>
        <button>prof</button>
        <button>more</button>
      </div>
    </div>
  );
};

export default Header;
