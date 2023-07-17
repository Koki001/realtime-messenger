"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { store } from "@/store";
import { setGroupID, setGroupName } from "@/store/groupSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPrivate } from "@/store/profileSlice";

const Groups = () => {
  const [groupsArr, setGroupsArr] = useState([] as any[]);
  const [newGroup, setNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const dispatch = useAppDispatch();
  const groupID = useAppSelector((state) => state.group.id);
  const user = useAppSelector((state) => state.profile.id);
  const [notifications, setNotifications] = useState<any>([]);

  const handlePropagation = (e: any) => {
    e.stopPropagation();
    setNewGroup(false);
  };
  const handleCreateGroup = async () => {
    const { data, error } = await supabase.rpc("create_new_group", {
      name: newGroupName,
    });
    setGroupsArr((current) => [...current, data]);
    dispatch(setGroupID(data.id));
    dispatch(setGroupName(data.name));
    setNewGroup(false);
  };

  const getGroups = async () => {
    const { data } = await supabase.from("groups").select("*").neq("private", "true");
    if (data) {
      setGroupsArr(data as any);
    }
  };

  const updateLastVisited = async () => {
    const { data, error } = await supabase
      .from("user_logs")
      .update({ last_visited: new Date().toISOString() })
      .eq("group_id", groupID);
  };

  const getNotifications = async () => {
    // console.log("notifications")
    const { data: lastVisited, error: lastVisitedErr } = await supabase
      .from("user_logs")
      .select("group_id, last_visited")
      .match({ profile_id: user })
      .neq("group_id", groupID);
    const { data: messages, error: messageError } = await supabase
      .from("messages")
      .select("group_id, created_at")
      .neq("group_id", groupID);

    if (lastVisited && messages) {
      const counts: any = [];

      messages.forEach((message) => {
        const visitedObj = lastVisited.find(
          (visit) => visit.group_id === message.group_id
        );

        if (
          visitedObj &&
          message.created_at > visitedObj.last_visited &&
          visitedObj.group_id !== groupID
        ) {
          if (!counts[message.group_id]) {
            counts[message.group_id] = 1;
          } else {
            counts[message.group_id]++;
          }
        }
      });
      // console.log("last visited", lastVisited)
      // console.log("messages", messages)
      setNotifications(counts);
      // console.log(notifications);
      return counts;
    }
  };

  useEffect(() => {
    getGroups();
    getNotifications();
    supabase
      .channel(`messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        () => {
          getNotifications();
        }
      )
      .subscribe();
    supabase
      .channel(`last_visited`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
        },
        () => {
          getNotifications();
        }
      )
      .subscribe();
  }, []);

  useEffect(() => {
    updateLastVisited();
  }, [groupID]);

  const handleGroupSelect = async (e: any, group: any, index: any) => {
    dispatch(setGroupID(group.id));
    dispatch(setGroupName(group.name));
    dispatch(setPrivate(false))
    // const { error } = await supabase
    //   .from("user_logs")
    //   .insert({ profile_id: store.getState().profile.id, group_id: group.id });
    // console.log(~~(+new Date() / 1000));
  };

  return (
    <>
      <div className="groupsHeading">
        <h2>Groups</h2>
        <button onClick={() => setNewGroup(true)}>new +</button>
        <label className="sr-only" htmlFor="searchGroup"></label>
        <input
          onChange={(e) => setGroupFilter(e.target.value)}
          placeholder="Search groups..."
          className="groupsSearch"
          type="text"
          id="searchGroup"
          name="searchGroup"
        />
      </div>

      <ul className="groupsRecent">
        {groupsArr
          ?.filter((group) =>
            group.name.toLowerCase().includes(groupFilter.toLowerCase())
          )
          .map((group, index) => {
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
                <p className="groupNameP">#{group.name}</p>
                {notifications[group.id] > 0 &&
                  notifications[group.id] !== groupID && (
                    <p className="notification">{notifications[group.id]}</p>
                  )}
              </li>
            );
          })}
      </ul>
      {newGroup && (
        <div onClick={handlePropagation} className="newGroupPopup">
          <div onClick={(e) => e.stopPropagation()} className="createGroup">
            <label htmlFor="newGroup">Group Name</label>
            <input
              onChange={(e) => setNewGroupName(e.target.value)}
              type="text"
              id="newGroup"
              name="newGroup"
            />
            <div>
              <button onClick={() => setNewGroup(false)}>Cancel</button>
              <button onClick={handleCreateGroup}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Groups;