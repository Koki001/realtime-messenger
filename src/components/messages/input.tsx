"use client";

import { RiImageFill, RiAttachmentLine } from "react-icons/ri";
import { FaRegSmile } from "react-icons/fa";
import { AiFillPlaySquare } from "react-icons/ai";
import EmojiPicker from "emoji-picker-react";

import supabase from "@/utils/supabase";
import { useAppSelector, useAppDispatch } from "@/store";
import { useState } from "react";
import { setGroupID } from "@/store/groupSlice";
const Input = () => {
  const groupID = useAppSelector((state) => state.group.id);
  const privateChat = useAppSelector((state) => state.profile.is_private);
  const currentUser = useAppSelector((state) => state.profile.id);
  const [emojis, setEmojis] = useState(false);
  const [input, setInput] = useState<string>("");
  const dispatch = useAppDispatch();
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const { message } = Object.fromEntries(new FormData(e.currentTarget));

    const updateLastVisited = async () => {
      const { data, error } = await supabase
        .from("user_logs")
        .update({ last_visited: new Date().toISOString() })
        .eq("group_id", groupID);
      console.log("logging ?");
    };
    if (typeof message === "string" && message.trim().length !== 0) {
      if (privateChat === false) {
        const { error } = await supabase.from("messages").insert({
          // profile_id: currentUser,
          content: message,
          group_id: groupID,
        });
        dispatch(setGroupID(groupID));
        form.reset();
        setInput("");
        updateLastVisited();
      } else if (privateChat === true) {
        const { error } = await supabase.from("direct_messages").insert({
          // profile_id: currentUser,
          content: message,
          private_group_id: groupID,
        });
        dispatch(setGroupID(groupID));
        form.reset();
        setInput("");
        updateLastVisited();
      }
    }
  };
  const handleEmojiPicker = () => {
    setEmojis(!emojis);
  };
  const handleAddEmoji = (e: any) => {
    setInput(input + e.emoji);
  };
  return (
    <form
      onSubmit={handleSendMessage}
      className={
        groupID === "1d6c3f19-ab40-4c3f-b8eb-8a38495a45df"
          ? "messageInput blurred"
          : "messageInput"
      }
    >
      <input
        placeholder="Enter Message..."
        onChange={(e) => setInput(e.target.value)}
        autoComplete="off"
        type="text"
        name="message"
        value={input}
        disabled={groupID === "1d6c3f19-ab40-4c3f-b8eb-8a38495a45df"}
      />
      <div className="emojiDiv">
        <FaRegSmile onClick={handleEmojiPicker} />
        {emojis && <EmojiPicker onEmojiClick={handleAddEmoji} />}
      </div>
      <RiAttachmentLine />
      <RiImageFill />

      <button>
        <AiFillPlaySquare />
      </button>
    </form>
  );
};

export default Input;
