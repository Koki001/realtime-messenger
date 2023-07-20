"use client";

import supabase from "@/utils/supabase";
import { useState, useEffect } from "react";
import { store } from "@/store";
import { useAppSelector, useAppDispatch } from "@/store";
import { setGroupID, setGroupName } from "@/store/groupSlice";
import { setEmail, setPrivate } from "@/store/profileSlice";
import { setContactsNotifications } from "@/store/notificationsSlice";
import { BsThreeDotsVertical } from "react-icons/bs";
import { AiOutlineUserAdd } from "react-icons/ai";

interface Contact {
  bio: null | string;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  location: null | string;
  private_group_key: string;
  username: null | string;
}

interface GroupedContacts {
  [letter: string]: { name: string; id: string; group: string }[];
}
const Contacts = () => {
  const [contactEmail, setContactEmail] = useState<string>();
  const [contactList, setContactList] = useState<any>();
  const [contactInfo, setContactInfo] = useState<any>();
  const [selectedContact, setSelectedContact] = useState<any>();
  const [notifications, setNotifications] = useState<any>();
  const [addPopup, setAddPopup] = useState(false);
  const [contactsFilter, setContactsFilter] = useState("");

  const currentUser = useAppSelector((state) => state.profile.id);
  const groupID = useAppSelector((state) => state.group.id);
  const dispatch = useAppDispatch();

  const handleAddContact = async (e: any) => {
    e.stopPropagation();
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, first_name")
      .eq("email", contactEmail)
      .single();

    if (profilesError) {
      console.log(profilesError);
      return;
    }
    console.log(profiles);
    if (!profiles) {
      console.log("profile not found");
      return;
    }
    if (profiles.id) {
      const contactId = profiles.id;

      setContactEmail("");

      const { data: contactData, error: contactError } = await supabase
        .from("contacts")
        .insert([
          {
            user_one: currentUser,
            user_two: contactId,
          },
        ])
        .select();
      if (contactData) {
        const { error } = await supabase.rpc("create_private_chat", {
          id: contactData[0].id,
          user_one: currentUser,
          user_two: contactId,
        });
        const { data: userOneLogs } = await supabase
          .from("user_logs")
          .insert({ profile_id: currentUser, group_id: contactData[0].id });
        const { data: userTwoLogs } = await supabase.from("user_logs").insert({
          profile_id: contactId,
          group_id: contactData[0].id,
        });
        setAddPopup(false);
        getContactList();
      }
    }
  };

  const getContactList = async () => {
    const { data, error } = await supabase.rpc("get_connections", {
      current_user_id: currentUser,
    });

    if (error) {
      console.error("Failed to check profile existence:", error);
      return false;
    }
    if (data) {
      const userIds = data.map((user: any) => user.connected_user_id);

      const { data: list, error: listError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);

      const { data: private_group } = await supabase.rpc(
        "find_matching_contacts",
        {
          user_one_value: currentUser,
        }
      );

      if (private_group) {
        const groupIds = private_group.map((group: any) => group.id);
        const modifiedList = list?.map((item, index) => ({
          ...item,
          private_group_key: groupIds[index],
        }));
        setContactInfo(modifiedList);
      }
    }
  };
  const findContacts = async () => {
    const { data, error } = await supabase
      .from("private_groups")
      .select("id, user_one, user_two")
      .or(`user_one.eq.${currentUser}, user_two.eq.${currentUser}`);

    if (data) {
      const otherUsers = data.map((group) => {
        if (group.user_one === currentUser) {
          return group.user_two;
        } else {
          return group.user_one;
        }
      });
    }
  };
  useEffect(() => {
    getContactList();
    findContacts();
  }, []);

  const groupedContacts: GroupedContacts = contactInfo?.length
    ? contactInfo
        .sort((a: Contact, b: Contact) =>
          a.first_name.localeCompare(b.first_name)
        )
        .reduce((result: GroupedContacts, contact: Contact) => {
          const firstLetter: string = contact.first_name
            .charAt(0)
            .toUpperCase();
          if (!result[firstLetter]) {
            result[firstLetter] = [];
          }
          result[firstLetter].push({
            name: `${contact.first_name} ${contact.last_name}`,
            id: contact.id,
            group: contact.private_group_key,
          });
          return result;
        }, {})
    : {};

  const handleContactChat = async (e: any) => {};
  const updateLastVisited = async () => {
    const { data, error } = await supabase
      .from("user_logs")
      .update({ last_visited: new Date().toISOString() })
      .eq("group_id", groupID);
  };
  const getNotifications = async () => {
    const { data: lastVisited, error: lastVisitedErr } = await supabase
      .from("user_logs")
      .select("group_id, last_visited")
      .match({ profile_id: currentUser })
      .neq("group_id", groupID);
    const { data: messages, error: messageError } = await supabase
      .from("direct_messages")
      .select("private_group_id, created_at")
      .neq("private_group_id", groupID);
    if (lastVisited && messages) {
      const counts: any = [];
      let notificationCount = 0;
      messages.forEach((message) => {
        const visitedObj = lastVisited.find(
          (visit) => visit.group_id === message.private_group_id
        );
        if (
          visitedObj &&
          message.created_at > visitedObj.last_visited &&
          visitedObj.group_id !== groupID
        ) {
          if (!counts[message.private_group_id]) {
            counts[message.private_group_id] = 1;
            notificationCount = 0;
          } else {
            counts[message.private_group_id]++;
            notificationCount++;
          }
        }
      });
      dispatch(setContactsNotifications(notificationCount));
      setNotifications(counts);
      return counts;
    }
  };
  useEffect(() => {
    getNotifications();
    supabase
      .channel(`direct_messages2`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "direct_messages",
          filter: `private_group_id=eq.${groupID}`,
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

  const handleContactSelect = async (e: any, name: any) => {
    setSelectedContact(e);
    dispatch(setPrivate(true));
    dispatch(setGroupName(name));
    const { data, error } = await supabase.rpc("find_matching_ids", {
      user_one_value: currentUser,
      user_two_value: e,
    });

    if (data) {
      console.log(data[0].id);
      dispatch(setGroupID(data[0].id));
    }
    if (error) {
      console.log(error);
    }
  };
  const handleContactEmail = (e: any) => {
    e.stopPropagation();
    setContactEmail(e.target.value);
  };
  return (
    <>
      <div className="headingContacts">
        <h2>Contacts</h2>
        <label htmlFor="addNewContact">
          <AiOutlineUserAdd />
        </label>
        <input
          type="button"
          id="addNewContact"
          onClick={() => setAddPopup(!addPopup)}
          className="sr-only"
        />
      </div>
      <label className="sr-only" htmlFor="searchContacts"></label>
      <input
        onChange={(e) => setContactsFilter(e.target.value)}
        placeholder="Search contacts..."
        className="contactsSearch"
        type="text"
        id="searchContacts"
        name="searchContacts"
      />
      {addPopup && (
        <div onClick={() => setAddPopup(false)} className="addContact">
          <div className="popupInner" onClick={(e) => e.stopPropagation()}>
            <input onChange={handleContactEmail} type="text" />
            <button onClick={handleAddContact}>add new</button>
          </div>
        </div>
      )}
      <ul className="viewContacts">
        {contactInfo?.length > 0 &&
          Object.keys(groupedContacts).map((letter, index) => {
            return (
              <li key={index}>
                <h3 className="contactLetter">{letter}</h3>
                <ul>
                  {groupedContacts[letter]
                    .filter((contact) =>
                      contact.name
                        .toLowerCase()
                        .includes(contactsFilter.toLowerCase())
                    )
                    .map((name, indexTwo) => {
                      return (
                        <li
                          onClick={() =>
                            handleContactSelect(name.id, name.name)
                          }
                          className={
                            selectedContact === name.id
                              ? "contactInfo selectedContact"
                              : "contactInfo"
                          }
                          key={index + name.name}
                        >
                          <p>{name.name}</p>
                          {notifications &&
                          notifications[name.group] > 0 &&
                          notifications[name.group] !== groupID ? (
                            <p className="dmNotification">
                              {notifications[name.group]}
                            </p>
                          ) : null}
                          <label htmlFor="contactsMore">
                            <BsThreeDotsVertical />
                          </label>
                          <input
                            id="contactsMore"
                            onClick={() => handleContactChat(name.name)}
                            type="button"
                            className="sr-only"
                          />
                        </li>
                      );
                    })}
                </ul>
              </li>
            );
          })}
      </ul>
    </>
  );
};

export default Contacts;
