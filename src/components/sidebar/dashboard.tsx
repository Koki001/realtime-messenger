"use client";
import { useState } from "react";
import "../../styles/globals.scss";
import "../../styles/dashboard.scss";
import Chats from "./chats";
import Contacts from "./contacts";
import Groups from "./groups";
import Profile from "./profile";
import Settings from "./settings";
import Image from "next/dist/client/image";
import { LiaUserTieSolid } from "react-icons/lia";
import { BiMessageSquareDots, BiMoon } from "react-icons/bi";
import {FiUsers} from "react-icons/fi"
import {PiUserList} from "react-icons/pi"
import {SlSettings} from "react-icons/sl"
import {RiGlobalLine} from "react-icons/ri"

const Sidebar = () => {
  const [view, setView] = useState("profile");

  interface componentView {
    [key: string]: React.ReactNode;
  }

  const components: componentView = {
    profile: <Profile />,
    chats: <Chats />,
    groups: <Groups />,
    contacts: <Contacts />,
    settings: <Settings />,
  };

  const handleViewChange = (e: React.FormEvent<HTMLFormElement>) => {
    const { options } = Object.fromEntries(new FormData(e.currentTarget));
    setView(options as string);
  };

  return (
    <div className={"dashboard"}>
      <div className={"sidebar"}>
        <Image
          src={"/assets/favicon.ico"}
          alt="Chatvia"
          height={35}
          width={35}
        />
        <form onChange={handleViewChange} className={"sidebarOptions"}>
          <input
            value={"profile"}
            className="sr-only"
            type="radio"
            name="options"
            id="profile"
            defaultChecked
          />
          <label title="Profile" htmlFor="profile">
            <LiaUserTieSolid />
          </label>
          <input
            value={"chats"}
            className="sr-only"
            type="radio"
            name="options"
            id="chats"
          />
          <label title="Chats" htmlFor="chats">
            <BiMessageSquareDots />
          </label>
          <input
            value={"groups"}
            className="sr-only"
            type="radio"
            name="options"
            id="groups"
          />
          <label title="Groups" htmlFor="groups">
            <FiUsers />
          </label>
          <input
            value={"contacts"}
            className="sr-only"
            type="radio"
            name="options"
            id="contacts"
          />
          <label title="Contacts" htmlFor="contacts">
            <PiUserList />
          </label>
          <input
            value={"settings"}
            className="sr-only"
            type="radio"
            name="options"
            id="settings"
          />
          <label title="Settings" htmlFor="settings">
            <SlSettings />
          </label>
        </form>
        <div className="sidebarExtras">
          <label title="Language" htmlFor="language">
            <RiGlobalLine />
          </label>
          <input
            value={"language"}
            className="sr-only"
            type="button"
            name="extras"
            id="language"
          />
          <label title="Mode" htmlFor="mode">
            <BiMoon />
          </label>
          <input
            value={"mode"}
            className="sr-only"
            type="button"
            name="extras"
            id="mode"
          />

          <button>user</button>
        </div>
      </div>
      <div className="sidebarView">{components[view]}</div>
    </div>
  );
};

export default Sidebar;
