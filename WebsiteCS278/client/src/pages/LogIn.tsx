import { Heading } from "@/components/Heading";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/AuthContext";

export default function LogIn() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {setIsLoggedIn, setUsername} = useAuth();

  const handleLogin = async () => {
	try {
	  const res = await fetch(`/api/user/login?user=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, {
		method: "POST"
	  });
  
	  if (!res.ok) {
		const error = await res.json();
		alert(error.error || "Login failed");
		return;
	  }
  
	  // If successful, update auth context and redirect
	  setIsLoggedIn(true);
	  setUsername(email); // or parse/display name from backend if available
	  setLocation("/");
	} catch (err) {
	  console.error("Login error:", err);
	  alert("An error occurred while logging in.");
	}
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4 text-white">
      <img src="/assets/logo.svg" alt="Broadcastr Logo" className="w-40 mb-6" />
      <Heading level={1}>BroadCastr</Heading>
      <p className="text-lg text-gray-500 mb-4">Connect and compete through your favorite music</p>
      <div className="w-full max-w-md">
        <input
            className="w-full bg-gray-800 rounded-md px-4 py-3 mb-4 text-gray-200 placeholder-gray-500 outline-none"
            placeholder="Your Last.FM username"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          
        <input
          className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 mb-4 placeholder-gray-500 outline-none"
          placeholder="Website password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-[#6C4ED9] text-white font-bold py-4 rounded-full mb-4 text-lg"
          onClick={() => {handleLogin}}
        >
          Log In
        </button>
        <button
          className="w-full bg-[#232226] text-white font-bold py-4 rounded-full text-lg"
          onClick={() => setLocation("/signup")}
        >
          Create Account
        </button>
      </div>
    </div>
  );
}