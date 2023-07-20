"use client";

import Header from "./header";
import Input from "./input";
import Loader from "../loader";
import "../../styles/messageView.scss";
import supabase from "@/utils/supabase";
import { useEffect, useState, useRef } from "react";
import { store } from "@/store";
import { useAppDispatch, useAppSelector } from "@/store";
type Message = {
  id: string;
  created_at: string;
  content: string;
  profile_id: string;
  profile: {
    id: string;
    username: string;
  };
};

let profileCache = {} as any;
const MessageScreen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Message[]>([]);
  const prevSenderRef = useRef<string | null>(null);
  const [loader, setLoader] = useState(false);
  const user: string = store.getState().profile.id;
  const containerRef = useRef<HTMLUListElement>(null);
  const formatTime = (messageDate: string) => {
    const date = new Date(messageDate);
    const hoursAndMinutes = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return hoursAndMinutes;
  };

  const dispatch = useAppDispatch();
  const groupID = useAppSelector((state) => state.group.id);
  const privateChat = store.getState().profile.is_private;
  const updateLastVisited = async () => {
    const { data, error } = await supabase
      .from("user_logs")
      .update({ last_visited: new Date().toISOString() })
      .eq("group_id", groupID);
  };
  const getMessages = async () => {
    // setLoader(true);
    if (!privateChat) {
      const { data, error } = await supabase
        .from(`messages`)
        .select("*, profile: profiles(id, username)")
        .match({ group_id: groupID })
        .order("created_at");
      const { data: all_users } = await supabase.from("profiles").select("*");
      if (!data) {
        console.log(error);
        return;
      }
      data
        .map((message) => message.profile)
        .forEach((profile) => {
          profileCache[profile.id] = profile;
        });
      updateLastVisited();
      setMessages(data);
      setProfiles(all_users as any);

      setLoader(false);
    } else if (privateChat) {
      const { data, error } = await supabase
        .from(`direct_messages`)
        .select("*, profile: profiles(id, username)")
        .match({ private_group_id: groupID })
        .order("created_at");
      const { data: all_users } = await supabase.from("profiles").select("*");
      if (!data) {
        console.log(error);
        return;
      }
      data
        .map((message) => message.profile)
        .forEach((profile) => {
          profileCache[profile.id] = profile;
        });
      updateLastVisited();
      setMessages(data);
      setProfiles(all_users as any);

      setLoader(false);
    }
  };
  const handleUSERTEST = (msg: any, usrs: any) => {
    const info = { first: "", last: "", username: "" };
    usrs.forEach((usr: any) => {
      if (usr.id === msg.profile_id) {
        info.first = usr.first_name;
        info.last = usr.last_name;
        info.username = usr.username;
      }
    });
    return info;
  };
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);
  useEffect(() => {
    getMessages();
  }, [groupID]);
  useEffect(() => {
    supabase
      .channel(`messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          updateLastVisited();
          getMessages()
          // setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();
    supabase
      .channel(`direct_messages`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `private_group_id=eq.${groupID}`,
        },
        (payload) => {
          console.log(groupID);
          updateLastVisited();
          getMessages()
          // setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();
  }, [groupID]);
  const handleSignout = async () => {
    await supabase.auth.signOut();
  };
  let previousUser: any = null;
  let currentUser: any = null;
  return (
    <div className={"messagesMain"}>
      <Header />
      <button style={{ position: "absolute", left: 0 }} onClick={handleSignout}>
        SIGN OUT
      </button>
      {groupID === "" ? (
        <h1>SELECT GROUP CHAT</h1>
      ) : (
        <ul ref={containerRef} className={"messageView"}>
          {loader === false ? (
            messages.length > 0 ? (
              messages?.map((message: Message, index) => {
                const names = handleUSERTEST(message, profiles);
                const profile_id = messages[index].profile_id;

                const lastUserMessage =
                  (index === messages.length - 1 ||
                    messages[index + 1].profile_id !== profile_id) &&
                  previousUser === profile_id;
                const onlyUserMessage =
                  profile_id !== messages[index - 1]?.profile_id &&
                  profile_id !== messages[index + 1]?.profile_id;
                previousUser = profile_id;

                const showAvatar = lastUserMessage || onlyUserMessage;

                return (
                  <li
                    className={
                      user === message.profile_id
                        ? "myMessage"
                        : "participantMessage"
                    }
                    key={index}
                  >
                    {showAvatar && (
                      <p className={"bubbleAvatar"}>{names.first.charAt(0)}</p>
                    )}
                    <div
                      className={
                        !showAvatar && user === message.profile_id
                          ? "messageTextWrapper myMargin"
                          : !showAvatar && user !== message.profile_id
                          ? "messageTextWrapper participantMargin"
                          : "messageTextWrapper"
                      }
                    >
                      <p className={"messageText"}>
                        {" "}
                        {message.content}{" "}
                        <span
                          className={
                            user === message.profile_id
                              ? "myTimestamp"
                              : "participantTimestamp"
                          }
                        >
                          {formatTime(message.created_at)}
                        </span>
                        <button
                          className={
                            user === message.profile_id
                              ? "myButton bubbleButton"
                              : "participantButton bubbleButton"
                          }
                        >
                          ...
                        </button>
                      </p>
                      {showAvatar && (
                        <p className="bubbleFirstLast">
                          {names.first && names.last
                            ? names.first + " " + names.last
                            : names.username}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })
            ) : (
              <h2>There is no chat history</h2>
            )
          ) : (
            <Loader />
          )}
        </ul>
      )}
      <Input />
    </div>
  );
};

export default MessageScreen;
