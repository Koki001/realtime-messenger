"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { store } from "@/store";
import { setGroupID, setGroupName } from "@/store/groupSlice";
import { useAppDispatch, useAppSelector } from "@/store";

const Chats = () => {
  const [groupsArr, setGroupsArr] = useState([] as any[]);
  const dispatch = useAppDispatch();
  const groupID = useAppSelector((state) => state.group.id);
  const [lastMessage, setLastMessage] = useState([] as any[]);
  const [lastTime, setLastTime] = useState([] as any[]);
  const [groupFilter, setGroupFilter] = useState("");

  // const getMessages = async () => {
  //   if (groupID !== "") {
  //     let last = [];
  //     for (let i = 0; i < groupsArr.length; i++) {
  //       const { data, error } = await supabase
  //         .from(`messages`)
  //         .select("content")
  //         .match({ group_id: groupsArr[i].id })
  //         .order("created_at", { ascending: false })
  //         .limit(1);
  //       if (data) {
  //         last.push(data[0]?.content);
  //       }
  //     }
  //     setLastMessage(last);
  //   }
  // };
  const getGroups = async () => {
    const { data } = await supabase.from("groups").select("*");
    if (data) {
      setGroupsArr(data as any);
      // console.log(data);
      let last = [];
      let timestamp = [];
      for (let i = 0; i < data.length; i++) {
        const { data: content, error } = await supabase
          .from(`messages`)
          .select("content, created_at")
          .match({ group_id: data[i].id })
          .order("created_at", { ascending: false })
          .limit(1);
        if (content) {
          last.push(content[0]?.content);
          timestamp.push(content[0]?.created_at);
        }
      }
      // console.log(data);
      setLastTime(timestamp);
      setLastMessage(last);
    }
  };

  useEffect(() => {
    getGroups();
  }, []);

  const handleGroupSelect = (e: any, group: any, index: any) => {
    dispatch(setGroupID(group.id));
    dispatch(setGroupName(group.name));
  };

  return (
    <>
      <h2>Chats</h2>
      <div className="chatsSearch">
        <label className="sr-only" htmlFor="searchContacts"></label>
        <input
          onChange={(e) => setGroupFilter(e.target.value)}
          placeholder="Search groups..."
          className="groupsSearch"
          type="text"
          id="searchContacts"
          name="searchContacts"
        />
        <div className="searchContacts">
          {groupsArr
            ?.filter((group) =>
              group.name.toLowerCase().includes(groupFilter.toLowerCase())
            )
            .map((contact: any, index: any) => {
              if (index < 4) {
                return (
                  <div key={index + "contact"}>
                    <p className="groupIcon">
                      {contact.name.charAt(0).toUpperCase()}
                    </p>
                  </div>
                );
              }
            })}
        </div>
      </div>
      <div className="chatsRecent">
        <h3>Recent</h3>
        <ul className="recentCards">
          {groupsArr
            ?.filter((group) =>
              group.name.toLowerCase().includes(groupFilter.toLowerCase())
            )
            .map((group, index) => {
              const time = new Date(lastTime[index]);
              return (
                <li
                  title={group.name}
                  onClick={(e) => handleGroupSelect(e, group, index)}
                  className={
                    store.getState().group.id === group.id
                      ? `groupsCards selectedGroup`
                      : `groupsCards`
                  }
                  key={index}
                >
                  <p className="groupIcon">
                    {group.name.charAt(0).toUpperCase()}
                  </p>
                  <div>
                    <p className="groupNameP">#{group.name}</p>
                    <p className="lastMessage">
                      {lastMessage && lastMessage[index]}
                    </p>
                    <p className="lastTime">
                      {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                </li>
              );
            })}
        </ul>
      </div>
    </>
  );
};

export default Chats;