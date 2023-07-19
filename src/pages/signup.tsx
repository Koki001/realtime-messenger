"use client";

import supabase from "@/utils/supabase";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "../styles/globals.scss";
import "../styles/signup.scss";

const Login = () => {
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password, first, last } = Object.fromEntries(
      new FormData(e.currentTarget)
    );
    if (
      typeof email === "string" &&
      typeof password === "string" &&
      typeof first === "string" &&
      typeof last === "string"
    ) {
      let { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: first,
            last_name: last,
            email: email,
          },
        },
      });
      console.log(error);
      if (data && !error) {
        if (data.user?.id === "string") {
          const { data: bucket } = await supabase.storage
            .from("profiles")
            .upload(data.user?.id + "/" + "bucket", "");
        }

        const { data: contactData, error: contactError } = await supabase
          .from("contacts")
          .insert([
            {
              user_one: data.user?.id,
              user_two: "e082122a-b1ec-4cc6-9a1e-c8b7df701520",
            },
          ])
          .select();

        if (contactData) {
          const { error } = await supabase.rpc("create_private_chat", {
            id: contactData[0].id,
            user_one: data.user?.id,
            user_two: "e082122a-b1ec-4cc6-9a1e-c8b7df701520",
          });
        }
        const { data: userOneLogs } = await supabase.from("user_logs").insert({
          profile_id: data.user?.id,
          group_id: "1d6c3f19-ab40-4c3f-b8eb-8a38495a45df",
        });
        router.push("/");
      } else if (!data) {
        console.log(error);
        alert("something went wrong");
      }
    }
  };

  return (
    <main>
      <div className="heading">
        <Image
          src={"/assets/favicon.ico"}
          alt="ChatSpace"
          height={35}
          width={35}
        />
        <h1>ChatSpace</h1>
      </div>
      <div className="signInMessage">
        <h2>Sign in</h2>
        <p>Sign in to continue to ChatSpace</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="formBlock">
          <label htmlFor="email">Email</label>
          <input name="email" type="email" id="email" />
        </div>
        {/* <div className="formBlock">
          <label htmlFor="username">Username</label>
          <input name="username" type="text" id="username" />
        </div> */}
        <div className="formBlock">
          <label htmlFor="first">First name</label>
          <input name="first" type="text" id="first" />
        </div>
        <div className="formBlock">
          <label htmlFor="last">Last name</label>
          <input name="last" type="text" id="last" />
        </div>
        <div className="formBlock">
          <label htmlFor="password">Password</label>
          <input name="password" type="password" id="password" />
        </div>
        <button type="submit">Sign Up</button>
        <div className="signUpRedirect">
          <p>
            {"By registering you agree to the ChatSpace "}{" "}
            <Link href={""}>Terms of Use</Link>
          </p>
        </div>
      </form>
      <div className="signUpRedirect">
        <p>
          {"Already have an account ?"} <Link href={"/login"}>Sign in</Link>
        </p>
      </div>
      <p>© 2023 ChatSpace. Crafted with HEART by Themesbrand </p>
    </main>
  );
};

export default Login;
