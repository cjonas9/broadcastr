import { useState } from "react";
import { Link } from "wouter";

export default function DropDownMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Menu button — bigger and styled */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-purple-700 hover:bg-purple-600 text-white text-lg font-semibold px-6 py-3 rounded-xl shadow-lg transition"
      >
        Menu
      </button>

      {/* Dropdown list */}
      {isOpen && (
        <div className="mt-2 bg-white rounded-xl shadow-xl flex flex-col w-48 overflow-hidden">
          <Link
            href="/"
            className="px-5 py-3 hover:bg-purple-100 text-gray-800 border-b"
            onClick={() => setIsOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/friends"
            className="px-5 py-3 hover:bg-purple-100 text-gray-800 border-b"
            onClick={() => setIsOpen(false)}
          >
            Friends
          </Link>
          <Link
        to="/track-swap"
        className="px-4 py-2 hover:bg-gray-100 text-black"
        onClick={() => setIsOpen(false)}
        >
        Track Swap
        </Link>
        </div>
      )}
    </div>
  );
}
