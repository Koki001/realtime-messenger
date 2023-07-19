"use client";

import { useEffect, useState } from "react";
import Providers from "@/components/provider";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar/dashboard";
import MessageScreen from "@/components/messages/messageScreen";
import "../styles/globals.scss";
import { store } from "@/store";
import Loader from "@/components/loader";
import {
  setID,
  setFirstName,
  setLastName,
  setEmail,
} from "@/store/profileSlice";
import "../styles/loader.scss";

export default function Home() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>();
  const [loader, setLoader] = useState(true);
  const getUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setProfile(user);
    if (!user) {
      router.push("/login");
    } else if (user && user.email) {
      const { data, error } = await supabase
        .from(`profiles`)
        .select("*")
        .match({ id: user.id })
        .single();

      store.dispatch(setEmail(user.email));
      store.dispatch(setID(user.id));
      store.dispatch(setFirstName(user.user_metadata.first_name));
      store.dispatch(setLastName(user.user_metadata.last_name));

      setTimeout(() => {
        setLoader(false);
      }, 1200);
    }
  };

  useEffect(() => {
    setLoader(true);
    getUser();
  }, []);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        router.push("/login");
      }
    });
  }, []);

  if (profile && !loader) {
    return (
      <main>
        <Providers>
          <Sidebar />
          <MessageScreen />
        </Providers>
      </main>
    );
  } else {
    return (
      <main>
        <Loader />
      </main>
    );
  }
}
