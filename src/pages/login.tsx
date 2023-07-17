"use client";

import { useRouter } from "next/navigation";
import supabase from "@/utils/supabase";
import Image from "next/image";
import Link from "next/link";
import "../styles/globals.scss";
import "../styles/login.scss";

const SignUp = () => {
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = Object.fromEntries(
      new FormData(e.currentTarget)
    );

    if (typeof email === "string" && typeof password === "string") {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
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
          <label htmlFor="email">Username / Email</label>
          <input name="email" type="email" id="email" />
        </div>
        <div className="formBlock">
          <div className="passTop">
            <label htmlFor="password">Password</label>
            <Link href={""}>Forgot password?</Link>
          </div>
          <input name="password" type="password" id="password" />
        </div>
        <div className="rememberMe">
          <input type="checkbox" id="rememberMe" name="rememberMe" />
          <label htmlFor="rememberMe">Remember me</label>
        </div>
        <button type="submit">Sign in</button>
      </form>
      <div className="signUpRedirect">
        <p>
          {"Don't have an account ?"} <Link href={"/signup"}>Sign up now</Link>
        </p>
      </div>
      <p>© 2023 Chatvia. Crafted with HEART by Themesbrand </p>
    </main>
  );
};

export default SignUp;
