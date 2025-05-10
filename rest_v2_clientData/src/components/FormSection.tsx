import React from "react";

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
}

const FormSection: React.FC<FormSectionProps> = ({ title, children }) => {
  return (
    <div className="border-t border-[#DBDBDB] pt-[32px] mb-[32px]">
      <h2 className="text-[20px] font-semibold text-[#262626] mb-[32px]">
        {title}
      </h2>
      <div className="space-y-[32px]">{children}</div>
    </div>
  );
};

export default FormSection;