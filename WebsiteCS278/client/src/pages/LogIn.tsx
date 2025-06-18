import { ButtonWrapper } from "@/components/ButtonWrapper";
import { Heading } from "@/components/Heading";
import React, { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/AuthContext";
import { API_CONFIG } from "@/config";

const VITE_API_URL="https://broadcastr-backend2.onrender.com"

export default function LogIn() {
	const [, setLocation] = useLocation();
	const [lastfm, setLastfm] = useState("");
	const [password, setPassword] = useState("");
	const { login } = useAuth();

	const handleLogin = async () => {
		try {
			const response = await fetch(
				`${API_CONFIG.baseUrl}/api/user/login?user=${encodeURIComponent(lastfm)}&password=${encodeURIComponent(password)}`
			);
			await login(lastfm, password);
			// If login(...) resolves, userDetails is now populated
			setLocation("/"); // redirect to home
		} catch (err: any) {
			alert(err.message || "Login failed");
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
			placeholder="Last.FM username"
			value={lastfm}
			onChange={e => setLastfm(e.target.value)}
			/>
			
		<input
			className="w-full bg-gray-800 rounded-md px-4 py-3 text-gray-200 mb-8 placeholder-gray-500 outline-none"
			placeholder="Website password"
			type="password"
			value={password}
			onChange={e => setPassword(e.target.value)}
		/>
		<ButtonWrapper
			className="w-full bg-[#6C4ED9] text-white font-bold rounded-full mb-4 text-lg"
			onClick={() => handleLogin()}
		>
			Log In
		</ButtonWrapper>
		<ButtonWrapper  
			width="full"
			variant="secondary"
			onClick={() => setLocation("/signup")}
			>  
			Sign Up
		</ButtonWrapper>
		</div>
	</div>
	);
}