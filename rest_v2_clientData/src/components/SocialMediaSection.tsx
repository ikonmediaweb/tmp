import React, { useState } from "react";

interface SocialMediaSectionProps {
  facebook_user: string;
  facebook_password: string;
  facebook_slug: string;
  instagram_user: string;
  instagram_password: string;
  instagram_slug: string;
  onSave?: (data: {
    facebook_user: string;
    facebook_password: string;
    facebook_slug: string;
    instagram_user: string;
    instagram_password: string;
    instagram_slug: string;
  }) => void;
}

const SocialMediaSection: React.FC<SocialMediaSectionProps> = ({
  facebook_user,
  facebook_password,
  facebook_slug,
  instagram_user,
  instagram_password,
  instagram_slug,
  onSave
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [editableSlug, setEditableSlug] = useState(facebook_slug ?? "");
  const [editableUser, setEditableUser] = useState(facebook_user ?? "");
  const [editablePassword, setEditablePassword] = useState("");
  const [editableInstagramSlug, setEditableInstagramSlug] = useState(instagram_slug ?? "");
  const [editableInstagramUser, setEditableInstagramUser] = useState(instagram_user ?? "");
  const [editableInstagramPassword, setEditableInstagramPassword] = useState("");
  const [showFacebookPassword, setShowFacebookPassword] = useState(false);
  const [showInstagramPassword, setShowInstagramPassword] = useState(false);

  // TikTok fields
  const [editableTikTokSlug, setEditableTikTokSlug] = useState("");
  const [editableTikTokUser, setEditableTikTokUser] = useState("");
  const [editableTikTokPassword, setEditableTikTokPassword] = useState("");
  const [showTikTokPassword, setShowTikTokPassword] = useState(false);

  const isChanged =
    editableSlug !== facebook_slug ||
    editableUser !== facebook_user ||
    editablePassword !== "" ||
    editableInstagramSlug !== instagram_slug ||
    editableInstagramUser !== instagram_user ||
    editableInstagramPassword !== "" ||
    editableTikTokSlug !== "" ||
    editableTikTokUser !== "" ||
    editableTikTokPassword !== "";

  const handleSave = () => {
    if (onSave) {
      const newFacebookPassword = editablePassword ? editablePassword : facebook_password;
      const newInstagramPassword = editableInstagramPassword ? editableInstagramPassword : instagram_password;
      const newTikTokPassword = editableTikTokPassword;

      onSave({
        facebook_user: editableUser,
        facebook_password: newFacebookPassword,
        facebook_slug: editableSlug,
        instagram_user: editableInstagramUser,
        instagram_password: newInstagramPassword,
        instagram_slug: editableInstagramSlug,
        tiktok_user: editableTikTokUser,
        tiktok_password: newTikTokPassword,
        tiktok_slug: editableTikTokSlug,
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="flex">
          {/* Left Column - Section Headers */}
          <div className="w-32 pr-4 flex grid ">
            <div className="mb-0 grid">
              <span className="font-bold text-[#262626] text-[22px]">facebook</span>
             
            </div>
            <div className="mb-6 flex grid">
            <span className="font-bold text-[#262626] text-[22px]">instagram</span>
            </div>
            <div className="mb-6 flex grid">
            <span className="font-bold text-[#262626] text-[22px]">tiktok</span>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="flex-1">
            {/* Facebook Fields */}
            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Slug</label>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                value={editableSlug}
                onChange={e => setEditableSlug(e.target.value)}
              />
              <p className="text-[12px] text-[#8E8E8E]">
                z.B. facebook.com/slug
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Benutzername</label>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                value={editableUser}
                onChange={e => setEditableUser(e.target.value)}
              />
              <p className="text-[12px] text-[#8E8E8E]">
              Geben Sie hier Ihren Facebook-Benutzernamen ein. Dieser wird für die Anmeldung und die Verknüpfung verwendet.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Passwort</label>
              <div className="relative">
                <input
                  type={showFacebookPassword ? "text" : "password"}
                  className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                  value={editablePassword}
                  onChange={e => setEditablePassword(e.target.value)}
                  placeholder="Neues Passwort eingeben"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-[#8E8E8E] hover:text-[#262626]"
                  onClick={() => setShowFacebookPassword(!showFacebookPassword)}
                >
                  {showFacebookPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-[12px] text-[#8E8E8E]">
              Passwort für die Anmeldung. Passwörter werden <a href="https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Onlinekommunikation/Verschluesselt-kommunizieren/Arten-der-Verschluesselung/arten-der-verschluesselung.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">256-Bit verschlüsselt</a> gespeichert.
              </p>
            </div>

            {/* Instagram Fields */}
            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Slug</label>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none"
                value={editableInstagramSlug}
                onChange={e => setEditableInstagramSlug(e.target.value)}
              />
              <p className="text-[12px] text-[#8E8E8E]">
                z.B. instagram.com/slug
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Benutzername</label>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none"
                value={editableInstagramUser}
                onChange={e => setEditableInstagramUser(e.target.value)}
              />
              <p className="text-[12px] text-[#8E8E8E]">
                Geben Sie hier Ihren Instagram-Benutzernamen ein. Dieser wird für die Anmeldung und die Verknüpfung verwendet.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Passwort</label>
              <div className="relative">
                <input
                  type={showInstagramPassword ? "text" : "password"}
                  className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                  value={editableInstagramPassword}
                  onChange={e => setEditableInstagramPassword(e.target.value)}
                  placeholder="Neues Passwort eingeben"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-[#8E8E8E] hover:text-[#262626]"
                  onClick={() => setShowInstagramPassword(!showInstagramPassword)}
                >
                  {showInstagramPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-[12px] text-[#8E8E8E]">
              Passwort für die Anmeldung. Passwörter werden <a href="https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Onlinekommunikation/Verschluesselt-kommunizieren/Arten-der-Verschluesselung/arten-der-verschluesselung.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">256-Bit verschlüsselt</a> gespeichert.
              </p>
            </div>
  

            {/* TikTok Fields */}
            <div className="mb-0">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Slug</label>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                value={editableTikTokSlug}
                onChange={e => setEditableTikTokSlug(e.target.value)}
              />
              <p className="text-[12px] text-[#8E8E8E]">
                z.B. tiktok.com/@slug
              </p>
            </div>

            <div className="">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Benutzername</label>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                value={editableTikTokUser}
                onChange={e => setEditableTikTokUser(e.target.value)}
              />
              <p className="text-[12px] text-[#8E8E8E]">
                Geben Sie hier Ihren TikTok-Benutzernamen ein. Dieser wird für die Anmeldung und die Verknüpfung verwendet.
              </p>
            </div>

            <div className="">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Passwort</label>
              <div className="relative">
                <input
                  type={showTikTokPassword ? "text" : "password"}
                  className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                  value={editableTikTokPassword}
                  onChange={e => setEditableTikTokPassword(e.target.value)}
                  placeholder="Neues Passwort eingeben"
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-[#8E8E8E] hover:text-[#262626]"
                  onClick={() => setShowTikTokPassword(!showTikTokPassword)}
                >
                  {showTikTokPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-[12px] text-[#8E8E8E]">
                Passwort für die Anmeldung. Passwörter werden <a href="https://www.bsi.bund.de/DE/Themen/Verbraucherinnen-und-Verbraucher/Informationen-und-Empfehlungen/Onlinekommunikation/Verschluesselt-kommunizieren/Arten-der-Verschluesselung/arten-der-verschluesselung.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">256-Bit verschlüsselt</a> gespeichert.
              </p>
            </div>
            {/* Submit Button */}
            <div className="flex justify-end mt-0">
        <button
          className={`w-[160px] h-[48px] bg-[#0095F6] text-white rounded-lg font-semibold text-[18px] mt-8 ${isChanged ? "" : "opacity-30 cursor-not-allowed"}`}
          type="submit"
          disabled={!isChanged}
        >
          Speichern
        </button>
      </div>  
      </div>  
      </div>
    </form>
  </div>
    
  );
};

export default SocialMediaSection;