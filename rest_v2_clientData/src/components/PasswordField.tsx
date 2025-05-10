import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const PasswordField: React.FC<PasswordFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block text-[17px] text-[#262626] mb-3"
      >
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          id={id}
          className={`w-full px-[20px] py-[18px] bg-[#FAFAFA] border rounded-lg transition-all ${
            error ? "border-red-500" : "border-[#DBDBDB]"
          }`}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="absolute right-[15px] top-1/2 transform -translate-y-1/2 text-[#8E8E8E] hover:text-[#262626] focus:outline-none"
          onClick={togglePasswordVisibility}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff size={22} className="transition-all" />
          ) : (
            <Eye size={22} className="transition-all" />
          )}
        </button>
      </div>
      {error && <p className="mt-3 text-[15px] text-[#ED4956]">{error}</p>}
    </div>
  );
};

export default PasswordField;