"use client";

import supabase from "@/utils/supabase";
import { useState, useEffect } from "react";
import { store } from "@/store";
import { useAppSelector, useAppDispatch } from "@/store";
import { setGroupID, setGroupName } from "@/store/groupSlice";
import { setPrivate } from "@/store/profileSlice";

interface Contact {
  bio: null | string;
  email: string;
  first_name: string;
  id: string;
  last_name: string;
  location: null | string;
  username: null | string;
}

interface GroupedContacts {
  [letter: string]: { name: string; id: string }[];
}
const Contacts = () => {
  const [contactEmail, setContactEmail] = useState<string>();
  const [contactList, setContactList] = useState<string[]>([]);
  const [contactInfo, setContactInfo] = useState<any>();
  const [selectedContact, setSelectedContact] = useState<any>();

  const currentUser = useAppSelector((state) => state.profile.id);
  const dispatch = useAppDispatch();

  const handleAddContact = async () => {
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
      // console.log("contact data", contactData);
      if (contactData) {
        const { error } = await supabase.rpc("create_private_chat", {
          id: contactData[0].id,
          user_one: currentUser,
          user_two: contactId,
        });
      }

      getContactList();
    }
    // const query1 = supabase
    //   .from("contacts")
    //   .select("*")
    //   .eq("user_one", currentUser)
    //   .eq("user_two", contactId)
    //   .single();

    // const query2 = supabase
    //   .from("contacts")
    //   .select("*")
    //   .eq("user_one", contactId)
    //   .eq("user_two", currentUser)
    //   .single();

    // const [result1, result2] = await Promise.all([query1, query2]);

    // const contactExists = result1.data || result2.data;
    // console.log(contactExists);

    // const { data } = await supabase.rpc("create_new_group", {
    //   name: "private",
    // });
    // if (data) {
    //   const { error } = await supabase
    //     .from("group_participants")
    //     .insert({ profile_id: contactId, group_id: data.id });
    // }
    // dispatch(setGroupID(data.id));
    // dispatch(setGroupName(profiles.first_name));

    // if (contactError) {
    //   console.log(contactError);
    // } else {
    //   console.log(contactData);
    // }
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

      setContactInfo(list as any);
      console.log(list);
      const contacts = list?.map((e) => `${e.first_name} ${e.last_name}`);
      if (contacts) {
        setContactList(contacts);
      }
    }
  };

  useEffect(() => {
    getContactList();
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
          });
          return result;
        }, {})
    : {};

  const handleContactChat = async (e: any) => {
    // contactInfo?.forEach((contact: any) => {
    //   if (`${contact.first_name} ${contact.last_name}` === e) {
    //     setSelectedContact(contact);
    //     console.log(selectedContact);
    //     // dispatch(setGroupID(contact.id));
    //     // dispatch(setGroupName(contact.first_name));
    //   }
    // });
    // dispatch(setPrivate(true));
  };

  const handleContactSelect = async (e: any) => {
    setSelectedContact(e);
    dispatch(setPrivate(true));
    // console.log(e);
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

  return (
    <>
      <h2>Contacts</h2>
      <div className="searchContacts">
        <input onChange={(e) => setContactEmail(e.target.value)} type="text" />
        <button onClick={handleAddContact}>add new</button>
      </div>
      <ul className="viewContacts">
        {contactInfo?.length > 0 &&
          Object.keys(groupedContacts).map((letter, index) => {
            return (
              <li key={index}>
                <h3 className="contactLetter">{letter}</h3>
                <ul>
                  {groupedContacts[letter].map((name, indexTwo) => {
                    return (
                      <li
                        onClick={() => handleContactSelect(name.id)}
                        className={
                          selectedContact === name.id
                            ? "contactInfo selectedContact"
                            : "contactInfo"
                        }
                        key={index + name.name}
                      >
                        <p>{name.name}</p>
                        <button onClick={() => handleContactChat(name.name)}>
                          ...
                        </button>
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
