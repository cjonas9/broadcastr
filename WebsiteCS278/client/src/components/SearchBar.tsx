import { Search } from "lucide-react";
import { Input } from "./ui/input";

export default function SearchBar({ value, onChange, placeholder }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string }) {
  return (
    <div className="flex items-center bg-gray-700 rounded-lg px-4 py-2 mb-4">
      <span className="mr-2 text-gray-400">
        <Search size={20} />
      </span>
      <Input
        className="bg-transparent outline-none text-white w-full border-0 shadow-none placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
} 