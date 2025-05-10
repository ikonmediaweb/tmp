import React, { useState, useEffect } from "react";
import { User } from "lucide-react";

interface WebsiteProviderSectionProps {
  providerName: string;
  providerUsername: string;
  onPhotoChange?: () => void;
  onSave?: (data: { domain: string, meta_tags: string }) => void;
  onBack?: () => void;
  domain?: string;
  meta_tags?: string;
}

const WebsiteProviderSection: React.FC<WebsiteProviderSectionProps> = ({
  providerName,
  providerUsername,
  onPhotoChange,
  onSave,
  onBack,
  domain = "",
  meta_tags = ""
}) => {
  const [domainValue, setDomainValue] = useState(domain);
  const [metaTagsValue, setMetaTagsValue] = useState(meta_tags || "");
  const [charCount, setCharCount] = useState((meta_tags || "").length);
  const [hasChanges, setHasChanges] = useState(false);
  const [tags, setTags] = useState<string[]>(meta_tags ? meta_tags.split(',').map(tag => tag.trim()) : []);
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    setDomainValue(domain);
    setMetaTagsValue(meta_tags || "");
    setTags(meta_tags ? meta_tags.split(',').map(tag => tag.trim()) : []);
  }, [domain, meta_tags]);

  useEffect(() => {
    const domainChanged = domainValue !== domain;
    const currentMetaTags = tags.join(', ');
    const metaTagsChanged = currentMetaTags !== meta_tags;
    setHasChanges(domainChanged || metaTagsChanged);
    setCharCount(currentMetaTags.length);
    setMetaTagsValue(currentMetaTags);
  }, [domainValue, domain, tags, meta_tags]);

  const handleDomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDomainValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (currentTag.trim() && !tags.includes(currentTag.trim())) {
        const newTags = [...tags, currentTag.trim()];
        setTags(newTags);
        setMetaTagsValue(newTags.join(', '));
        setCurrentTag('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter(tag => tag !== tagToRemove);
    setTags(newTags);
    setMetaTagsValue(newTags.join(', '));
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        domain: domainValue,
        meta_tags: tags.join(', ')
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="flex">
          {/* Left Column - Section Headers */}
          <div className="w-32 pr-4 flex grid flex-col justify-center translate-y-[5%]">
            <div className="mb-6 flex">
              <span className="font-bold text-[#262626] text-[18px] leading-[0.9rem]">Domain</span>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="flex-1">
            {/* Domain Field */}
            <div className="mb-12">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold"></label>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-1 outline-none"
                value={domainValue}
                onChange={handleDomainChange}
                placeholder="mein-restaurant.de"
              />
              <p className="text-[12px] text-[#8E8E8E]">
                Änderung der Domain hat keine Auswirkungen auf unsere Dienstleistungen.
              </p>
            </div>

            {/* Meta Tags Field */}
            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-6 font-semibold">Meta-Tags</label>
              <div className="border border-[#DBDBDB] rounded-lg p-4 mt-2 mb-4 bg-[#FAFAFA]">
                <div>
                  <h3 className="text-[16px] font-semibold text-gray-700">Für mehr Sichtbarkeit</h3>
                  <p className="text-[16px] mt-4 text-gray-500 mb-4 leading-[0.98rem] ">
                    Meta-Tags helfen Ihrer Website, in Suchmaschinen besser gefunden zu werden. Wählen Sie präzise Begriffe, die Ihr Restaurant am besten beschreiben.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag, index) => (
                  <div 
                    key={index} 
                    className="flex items-center bg-gray-200 px-3 py-1.5 rounded-full"
                  >
                    <span className="text-[16px] text-gray-900">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-white hover:text-gray-200 w-4 h-4 flex items-center justify-center bg-gray-500 rounded-full text-[12px] leading-none"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal mb-2 outline-none"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Griechisch, Mediterran..."
              />
              
             

              <div className="bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg p-4 mb-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[16px] font-semibold text-[#1A1A1A]">Google-Ranking Potenzial</span>
                  <span className="text-[14px] text-[#1A1A1A]">{Math.min(tags.length * 20, 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(tags.length * 20, 100)}%` }}
                  ></div>
                </div>
                <p className="text-[12px] text-[#8E8E8E] mt-2">
                  {tags.length < 5 
                    ? `Noch ${5 - tags.length} Tags für optimale Sichtbarkeit empfohlen`
                    : 'Optimale Anzahl an Tags erreicht'}
                </p>
              </div>

              <div className="flex justify-end mt-3">
                <span className="text-[12px] text-[#8E8E8E]">{charCount} / 150</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <button
            className={`w-[160px] h-[48px] bg-[#0095F6] text-white rounded-lg font-semibold text-[18px] ${hasChanges ? "" : "opacity-30 cursor-not-allowed"}`}
            type="submit"
            disabled={!hasChanges}
          >
            Speichern
          </button>
        </div>
      </form>
    </div>
  );
};

export default WebsiteProviderSection;