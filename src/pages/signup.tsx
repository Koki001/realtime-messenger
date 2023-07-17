"use client"

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
            email: email
          },
        },
      });
      console.log(error)
      if (data && !error) {
        router.push("/");
      } else if (!data) {
        console.log(error?.message);
        alert("something went wrong");
      }
    }
  };

  return (
    <main>
      <div className="heading">
        <Image
          src={"/assets/favicon.ico"}
          alt="Chatvia"
          height={35}
          width={35}
        />
        <h1>Chatvia</h1>
      </div>
      <div className="signInMessage">
        <h2>Sign in</h2>
        <p>Sign in to continue to Chatvia</p>
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
            {"By registering you agree to the Chatvia "} <Link href={""}>Terms of Use</Link>
          </p>
        </div>

      </form>
      <div className="signUpRedirect">
        <p>
          {"Already have an account ?"} <Link href={"/login"}>Sign in</Link>
        </p>
      </div>
      <p>© 2023 Chatvia. Crafted with HEART by Themesbrand </p>
    </main>
  );
};

export default Login;
