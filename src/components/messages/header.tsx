"use client";

import supabase from "@/utils/supabase";
import { useEffect, useState } from "react";
import { store } from "@/store";
import { useAppSelector } from "@/store";
import "../../styles/dashboard.scss";
import "../../styles/header.scss";
import {FiSearch} from "react-icons/fi"
import { LuPhone } from "react-icons/lu";
import {AiOutlineVideoCamera} from "react-icons/ai"
import {LiaUserTieSolid} from "react-icons/lia"
import {BsThreeDotsVertical} from "react-icons/bs"

const Header = () => {
  const [participants, setParticipants] = useState<any>([]);
  const groupID = store.getState().group.id;
  const groupName = useAppSelector((state) => state.group.name);

  const getParticipants = async () => {
    const { data: profiles, error } = await supabase
      .from("group_participants")
      .select("group_id, profiles (first_name, last_name)")
      .match({ group_id: groupID });
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
        {participants.length > 0 && (
          <p className="participantNumber">({participants.length})</p>
        )}
      </div>
      <div className="headerOptions">
        <label htmlFor="searchHeader">
          <FiSearch />
        </label>
        <input id="searchHeader" type="button" className="sr-only" />
        <label htmlFor="call">
          <LuPhone />
        </label>
        <input id="call" type="button" className="sr-only" />{" "}
        <label htmlFor="video">
          <AiOutlineVideoCamera />
        </label>
        <input id="video" type="button" className="sr-only" />{" "}
        <label htmlFor="profileHeader">
          <LiaUserTieSolid />
        </label>
        <input id="profileHeader" type="button" className="sr-only" />{" "}
        <label htmlFor="moreHeader">
          <BsThreeDotsVertical />
        </label>
        <input id="moreHeader" type="button" className="sr-only" />
      </div>
    </div>
  );
};

export default Header;
