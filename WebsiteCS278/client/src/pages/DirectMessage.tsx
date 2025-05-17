import { useRoute, useLocation } from "wouter";
import { musicData } from "@/data/musicData";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function DirectMessage() {
  const [, params] = useRoute<{ id: string }>("/dm/:id");
  const [, setLocation] = useLocation();
  const friendId = params?.id ? parseInt(params.id) : null;
  const friend = musicData.friends.find(f => f.id === friendId);
  const user = musicData.user;

  // Mock message state
  const [messages, setMessages] = useState([
    { from: user.username, text: "Hey!" },
    { from: friend?.username, text: "Hey, what's up?" }
  ]);
  const [input, setInput] = useState("");

  if (!friend) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Friend not found.</div>;
  }

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([...messages, { from: user.username, text: input }]);
      setInput("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center relative">
        <button
          className="flex items-center text-purple-400 hover:text-purple-300"
          onClick={() => setLocation(`/profile/${friend.id}`)}
        >
          <ArrowLeft className="mr-2 h-5 w-5" />
          Back
        </button>
        <div className="flex items-center gap-2 mx-auto">
          <img src={friend.profileImage} alt={friend.username} className="w-10 h-10 rounded-full" />
          <div className="font-semibold">{friend.username}</div>
        </div>
        <button className="ml-auto text-purple-400 invisible">
          View Profile
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.from === user.username ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2 rounded-lg ${msg.from === user.username ? "bg-purple-600 text-white" : "bg-gray-700 text-white"}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-800 flex">
        <input
          className="flex-1 rounded-lg bg-gray-800 text-white px-4 py-2 mr-2 outline-none"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
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