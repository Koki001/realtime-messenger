"use client";

import supabase from "@/utils/supabase";
import { useState, useEffect } from "react";
import { store } from "@/store";
import { useAppSelector, useAppDispatch } from "@/store";
import { setGroupID, setGroupName } from "@/store/groupSlice";

interface GroupedContacts {
  [letter: string]: string[];
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

    if (!profiles) {
      console.log("profile not found");
      return;
    }

    const contactId = profiles.id;
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
    setContactEmail("");

    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .insert([
        {
          id: currentUser + contactId,
          user_one: currentUser,
          user_two: contactId,
        },
      ]);
    const { error } = await supabase.rpc("create_private_chat", {
      id: currentUser + contactId,
    });
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
    getContactList();
    if (contactError) {
      console.log(contactError);
    } else {
      console.log(contactData);
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

      setContactInfo(list as any);
      const contacts = list?.map((e) => `${e.first_name} ${e.last_name}`);
      if (contacts) {
        setContactList(contacts);
      }
    }
  };

  useEffect(() => {
    getContactList();
  }, []);

  const groupedContacts: GroupedContacts = contactList
    .sort()
    .reduce((result: GroupedContacts, name: string) => {
      const firstLetter: string = name.charAt(0).toUpperCase();
      if (!result[firstLetter]) {
        result[firstLetter] = [];
      }
      result[firstLetter].push(name);
      return result;
    }, {});

  const handleContactChat = async (e: any) => {
    contactInfo?.forEach((contact: any) => {
      if (`${contact.first_name} ${contact.last_name}` === e) {
        setSelectedContact(contact);
        console.log(groupedContacts);
        // dispatch(setGroupID(contact.id));
        // dispatch(setGroupName(contact.first_name));
      }
    });
  };

  return (
    <>
      <h2>Contacts</h2>
      <div className="searchContacts">
        <input onChange={(e) => setContactEmail(e.target.value)} type="text" />
        <button onClick={handleAddContact}>add new</button>
      </div>
      <ul className="viewContacts">
        {contactInfo &&
          Object.keys(groupedContacts).map((letter, index) => {
            return (
              <li key={index}>
                <h3 className="contactLetter">{letter}</h3>
                <ul>
                  {groupedContacts[letter].map((name, indexTwo) => {
                    return (
                      <li className="contactInfo" key={index + name}>
                        <p>{name}</p>
                        <button onClick={() => handleContactChat(name)}>
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
