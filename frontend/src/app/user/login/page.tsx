"use client";

import LoginPage from "@/components/LoginForm";
import { useState } from "react";
import { useRouter } from "next/navigation";


export default function Login() {
  const [id, setId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const router = useRouter(); // ✅ Add router for navigation

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: Number(id),
          password:password,
        }),
        credentials: "include",  // ✅ Required for cookies to be stored
          });

      if (!response.ok) {
        console.error(`HTTP Error: ${response.status}`);
        return;
      }

      const data = await response.json();
      console.log("Response Message:",data.message);

      if (response.status === 200) {
        sessionStorage.setItem("id",id);
        router.push("/user/face-auth");
      }
    } catch (error) {
      console.error("Error:", error);
    }
};

  return (
    
      <LoginPage
        header="भारत निर्वाचन प्रणाली"
        input="Adhar Number"
        placeholder="Enter your Adhar Number"
        inputfield={id}
        setinputfield={setId}
        password={password}
        setPassword={setPassword}
        handlesubmit={handleSubmit}
      />

  );
}
