"use client"
import "../styles/globals.scss";
import { Auth } from "@supabase/auth-ui-react";
import supabase from "@/utils/supabase";

export const metadata = {
  title: "ChatSpace Messenger",
  description: "Built in NextJS using Typescript, Tailwind and Supabase",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Auth.UserContextProvider supabaseClient={supabase}>
          {children}
        </Auth.UserContextProvider>
      </body>
    </html>
  );
}
