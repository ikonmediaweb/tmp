import React from "react";

interface TextFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
  onClick?: () => void;
  placeholder?: string;
  className?: string;
}

const TextField: React.FC<TextFieldProps> = ({
  id,
  label,
  value,
  onChange,
  error,
  onClick,
  type = "text",
  placeholder, 
  className,
}) => {
  return (
    <div className="mb-6">
      <label
        htmlFor={id}
        className="block text-[17px] text-[#262626] mb-3"
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        placeholder={placeholder}
        className={`w-full px-[20px] py-[18px] bg-[#FAFAFA] border rounded-lg transition-all ${className || ''} ${
          error ? "border-red-500" : "border-[#DBDBDB]"
        }`}
        onClick={onClick}
        value={value}
        onChange={onChange}
      />
      {error && <p className="mt-3 text-[15px] text-[#ED4956]">{error}</p>}
    </div>
  );
};

export default TextField;