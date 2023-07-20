"use client";

import { useEffect, useState } from "react";
import supabase from "@/utils/supabase";
import { store } from "@/store";
import { setGroupID, setGroupName } from "@/store/groupSlice";
import { useAppDispatch, useAppSelector } from "@/store";
import { setPrivate } from "@/store/profileSlice";
import { setGroupsNotifications } from "@/store/notificationsSlice";
import { FiUsers } from "react-icons/fi";
import { BsThreeDotsVertical } from "react-icons/bs";

const Groups = () => {
  const [groupsArr, setGroupsArr] = useState([] as any[]);
  const [newGroup, setNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const dispatch = useAppDispatch();
  const groupID = store.getState().group.id;
  const user = useAppSelector((state) => state.profile.id);
  const [notifications, setNotifications] = useState<any>([]);
  const [groupInvite, setGroupInvite] = useState(false);

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

    const { data: userLogs } = await supabase
      .from("user_logs")
      .insert({ profile_id: user, group_id: data.id });
  };

  const getGroups = async () => {
    const { data } = await supabase
      .from("groups")
      .select("*")
      .neq("private", "true");
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
    console.log(groupID)
    console.log(store.getState().group.id)
    const { data: lastVisited, error: lastVisitedErr } = await supabase
      .from("user_logs")
      .select("group_id, last_visited")
      .match({ profile_id: user })
      .neq("group_id", store.getState().group.id);
    const { data: messages, error: messageError } = await supabase
      .from("messages")
      .select("group_id, created_at")
      .neq("group_id", store.getState().group.id);
    if (lastVisited && messages) {
      const counts: any = [];

      messages.forEach((message) => {
        const visitedObj = lastVisited.find(
          (visit) => visit.group_id === message.group_id
        );

        if (
          visitedObj &&
          message.created_at > visitedObj.last_visited &&
          visitedObj.group_id !== store.getState().group.id
        ) {
          if (!counts[message.group_id]) {
            counts[message.group_id] = 1;
          } else {
            counts[message.group_id]++;
          }
        }
      });
      setNotifications(counts);
      dispatch(setGroupsNotifications(counts));
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
          console.log("message channel");
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
  const handleInvite = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation()
    if (e.key === "Enter") {
      const target = e.currentTarget;
      const { data } = await supabase
        .from("profiles")
        .select("id")
        .match({ email: target.value })
        .single();
      if (!data) {
        return alert("user not found");
      }
      const { error } = await supabase
        .from("group_participants")
        .insert({ profile_id: data?.id, group_id: groupID });
      if (error) {
        return alert("not sent ");
      }
      if (!error) {
        target.value = "";
      }
      const { data: userLogs } = await supabase
        .from("user_logs")
        .insert({ profile_id: data?.id, group_id: groupID });
    }
  };
  const handleGroupSelect = async (e: any, group: any, index: any) => {
    dispatch(setPrivate(false));
    dispatch(setGroupID(group.id));
    dispatch(setGroupName(group.name));
    console.log(group.id)
  };

  return (
    <>
      <div className="groupsHeading">
        <h2>Groups</h2>
        <button className="addGroup" onClick={() => setNewGroup(true)}>
          <FiUsers />
        </button>
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
            group?.name.toLowerCase().includes(groupFilter.toLowerCase())
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
                {group.id !== "1d6c3f19-ab40-4c3f-b8eb-8a38495a45df" && (
                  <button
                    onClick={() => setGroupInvite(!groupInvite)}
                    className="groupMore"
                  >
                    <BsThreeDotsVertical />
                  </button>
                )}
                {notifications[group.id] > 0 &&
                  notifications[group.id] !== groupID && (
                    <p className="notification">{notifications[group.id]}</p>
                  )}
              </li>
            );
          })}
      </ul>
      {groupInvite && (
        <div onClick={() => setGroupInvite(false)} className="inviteToGroup">
          <div onClick={(e) => e.stopPropagation()} className="innerInvitePopup">
            <label htmlFor="invite">Invite by user email:</label>
            <input
              onKeyDown={handleInvite}
              name="invite"
              type="text"
              id="invite"
            />
          </div>
        </div>
      )}

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
