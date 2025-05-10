import React from "react";
import { ChevronRight } from "lucide-react";

interface IndexSectionProps {
  onNavigate: (section: string) => void;
}

const IndexSection: React.FC<IndexSectionProps> = ({ onNavigate }) => {
  const sections = [
    { id: "profile", label: "Profil" },
    { id: "business", label: "Geschäftsinformationen" },
    { id: "tax", label: "Steuerinformationen" }, // Added Steuerinformationen section
    { id: "email", label: "E-Mail-Zugang" },
    { id: "social", label: "Social Media" },
    { id: "google", label: "Google Business" },
    { id: "website", label: "Webseite" },
  ];

  // This function ensures the correct section is loaded when clicked
  const handleNavigation = (sectionId: string) => {
    onNavigate(sectionId);
    // The parent component will handle loading the websiteProviderSection when sectionId is "website"
  };

  return (
    <div className="max-w-6xl mx-auto p-[20px] sm:p-[32px] space-y-3 animate-fade-in">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => handleNavigation(section.id)}
          className="w-full flex items-center justify-between p-[20px] bg-[#FAFAFA] hover:bg-[#F0F0F0] rounded-lg transition-all group"
        >
          <span className="text-[17px] text-[#262626]">{section.label}</span>
          <ChevronRight size={22} className="text-[#8E8E8E] group-hover:text-[#262626] transition-colors" />
        </button>
      ))}
    </div>
  );
}
export default IndexSection;