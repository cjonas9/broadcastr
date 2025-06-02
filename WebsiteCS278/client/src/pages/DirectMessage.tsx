import { useRoute, useLocation } from "wouter";
import { useState, useEffect, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/AuthContext";

const VITE_API_URL = "https://broadcastr.onrender.com";
const POLLING_INTERVAL = 5000; // Poll every 5 seconds for new messages

interface Message {
  id: number;
  type: "Incoming" | "Outgoing";
  sender: string;
  recipient: string;
  message: string;
  timestamp: string;
}

export default function DirectMessage() {
  const [, params] = useRoute<{ username: string }>("/dm/:username");
  const [, setLocation] = useLocation();
  const { userDetails } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");

  const fetchMessages = useCallback(async () => {
    if (!userDetails?.profile || !params?.username) return;

    try {
      const res = await fetch(
        `${VITE_API_URL}/api/user/direct-messages?user=${encodeURIComponent(userDetails.profile)}&conversant=${encodeURIComponent(params.username)}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch messages");
      }

      const data = await res.json();
      setMessages(data.directMessages);

      // Mark messages as read
      await fetch(
        `${VITE_API_URL}/api/mark-messages-read?user=${encodeURIComponent(params.username)}&recipient=${encodeURIComponent(userDetails.profile)}`,
        { method: "POST" }
      );
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    }
  }, [params?.username, userDetails?.profile]);

  // Initial load
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      await fetchMessages();
      setLoading(false);
    };

    loadMessages();
  }, [fetchMessages]);

  // Poll for new messages
  useEffect(() => {
    if (!userDetails?.profile || !params?.username) return;

    const pollInterval = setInterval(fetchMessages, POLLING_INTERVAL);

    return () => clearInterval(pollInterval);
  }, [fetchMessages, params?.username, userDetails?.profile]);

  const sendMessage = async () => {
    if (!input.trim() || !userDetails?.profile || !params?.username) return;

    try {
      const res = await fetch(
        `${VITE_API_URL}/api/send-direct-message?user=${encodeURIComponent(userDetails.profile)}&recipient=${encodeURIComponent(params.username)}&message=${encodeURIComponent(input.trim())}`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      // Fetch latest messages
      await fetchMessages();
      setInput("");
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message");
    }
  };

  if (!userDetails?.profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        Please log in to view messages.
      </div>
    );
  }

  if (!params?.username) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        User not found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-lg mb-4">Loading messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-lg mb-4">{error}</p>
          <button
            className="text-purple-400 hover:text-purple-300"
            onClick={() => setLocation(`/profile/${params.username}`)}
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center relative">
        <button
          className="flex items-center text-purple-400 hover:text-purple-300"
          onClick={() => setLocation(`/profile/${params.username}`)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <div className="font-semibold">@{params.username}</div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.type === "Outgoing" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg ${
                  msg.type === "Outgoing" ? "bg-purple-600 text-white" : "bg-gray-700 text-white"
                }`}
              >
                <div className="text-sm">{msg.message}</div>
                <div className="text-xs opacity-75 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 border-t border-gray-800 flex">
        <input
          className="flex-1 rounded-lg bg-gray-800 text-white px-4 py-2 mr-2 outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
          placeholder="Type a message..."
        />
        <button
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-2 rounded-lg"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
} 