import React, { useState } from "react";
import { useLocation } from "wouter";
import { ButtonWrapper } from "@/components/ButtonWrapper";
import { Heading } from "@/components/Heading";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [lastfm, setLastfm] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const handleSignup = async () => {
    if (!email || !lastfm || !password || !password2) {
      alert("Please fill in all fields.");
      return;
    }

    if (password !== password2) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const url = `/api/user/create-profile?user=${encodeURIComponent(lastfm)}&firstname=${encodeURIComponent(lastfm)}&lastname=${encodeURIComponent(lastfm)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Sign up failed.");
        return;
      }

      alert("Account created! Redirecting to login...");
      setLocation("/login");
    } catch (err) {
      console.error("Signup error:", err);
      alert("An error occurred while signing up.");
    }
  };


  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center px-4">
      <div className="w-full max-w-md">
        <button
          className="self-start text-3xl text-white mb-4"
          onClick={() => setLocation("/login")}
        >
          ←
        </button>
        <div className="w-full max-w-md text-white">
          <Heading level={1}>Sign Up</Heading>
          <p className="text-gray-400 mb-8">
            BroadCastr requires a last.FM account to use for us to acquire your music listening data
          </p>
          <label className="block text-gray-300 mb-1">Last.FM User ID</label>
          <input
            className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 outline-none mb-4"
            placeholder="@username"
            value={lastfm}
            onChange={e => setLastfm(e.target.value)}
          />
		  <label className="block text-gray-300 mb-1">Last.FM User ID</label>
          <input
            className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 outline-none mb-4"
            placeholder="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          <label className="block text-gray-300 mb-1">Password</label>
          <input
            className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 outline-none mb-4"
            placeholder="your password here"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <label className="block text-gray-300 mb-1">Reenter your password</label>
          <input
            className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 placeholder-gray-500 outline-none mb-8"
            placeholder="your password here"
            type="password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
          />
          <ButtonWrapper  
            width="full"
            className="mb-4"
            onClick={() => handleSignup()}
            >  
            Sign Up
          </ButtonWrapper>
        </div>  
      </div>
    </div>
  );
}