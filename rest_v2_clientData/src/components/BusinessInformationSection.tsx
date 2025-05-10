import React, { useState, useEffect } from "react";
import TextField from "./TextField";

// Add city to state mapping
const cityToState: { [key: string]: string } = {
  // Bayern (BY)
  'Nürnberg': 'BY',
  'München': 'BY',
  'Augsburg': 'BY',
  'Regensburg': 'BY',
  'Würzburg': 'BY',
  'Erlangen': 'BY',
  'Fürth': 'BY',

  // Berlin (BE)
  'Berlin': 'BE',

  // Hamburg (HH)
  'Hamburg': 'HH',

  // Bremen (HB)
  'Bremen': 'HB',

  // Sachsen (SN)
  'Dresden': 'SN',
  'Leipzig': 'SN',
  'Chemnitz': 'SN',

  // Hessen (HE)
  'Frankfurt': 'HE',
  'Wiesbaden': 'HE',
  'Kassel': 'HE',
  'Darmstadt': 'HE',

  // Nordrhein-Westfalen (NW)
  'Düsseldorf': 'NW',
  'Köln': 'NW',
  'Dortmund': 'NW',
  'Essen': 'NW',
  'Duisburg': 'NW',
  'Bochum': 'NW',
  'Wuppertal': 'NW',
  'Bonn': 'NW',

  // Baden-Württemberg (BW)
  'Stuttgart': 'BW',
  'Karlsruhe': 'BW',
  'Mannheim': 'BW',
  'Freiburg': 'BW',
  'Heidelberg': 'BW',

  // Niedersachsen (NI)
  'Hannover': 'NI',
  'Braunschweig': 'NI',
  'Osnabrück': 'NI',
  'Oldenburg': 'NI',

  // Rheinland-Pfalz (RP)
  'Mainz': 'RP',
  'Ludwigshafen': 'RP',
  'Koblenz': 'RP',
  'Trier': 'RP',

  // Schleswig-Holstein (SH)
  'Kiel': 'SH',
  'Lübeck': 'SH',
  'Flensburg': 'SH'
};

interface BusinessInformationSectionProps {
  name: string;
  address: string;
  state: string;
  country: string;
  onSave?: (data: {
    name: string;
    address: string;
    state: string;
    country: string;  // Added country to the save interface
  }) => void;
}

const BusinessInformationSection: React.FC<BusinessInformationSectionProps> = ({
  name,
  address,
  state,
  country,
  onSave
}) => {
  const [editableName, setEditableName] = useState(name || '');
  
  // Parse address into components using regex to handle different formats
  const parseAddress = (address: string) => {
    const regex = /^(.*?)(?:\s+(\d+[a-zA-Z]?))?,?\s*(\d{5})?\s*([^,]+)?$/;
    const match = (address || '').match(regex) || [];
    return {
      street: match[1]?.trim() || '',
      houseNumber: match[2]?.trim() || '',
      postalCode: match[3]?.trim() || '',
      city: match[4]?.trim() || ''
    };
  };

  // First parse the address to get the initial values
  const parsedAddress = parseAddress(address);
  const [editableStreet, setEditableStreet] = useState(parsedAddress.street);
  const [editableHouseNumber, setEditableHouseNumber] = useState(parsedAddress.houseNumber);
  const [editablePostalCode, setEditablePostalCode] = useState(parsedAddress.postalCode);
  const [editableCity, setEditableCity] = useState(parsedAddress.city);
  const [editableCountry, setEditableCountry] = useState(country);
  const [editableState, setEditableState] = useState(state);
  const [isGermany, setIsGermany] = useState(country === "DE");

  // Update isGermany when country changes
  useEffect(() => {
    setIsGermany(editableCountry === "DE");
  }, [editableCountry]);

  // Update state based on city when address changes
  useEffect(() => {
    const { city } = parseAddress(editableStreet);
    if (city && cityToState[city]) {
      setEditableState(cityToState[city]);
    }
  }, [editableStreet]);

  const isChanged =
    editableName !== name ||
    `${editableStreet} ${editableHouseNumber}, ${editablePostalCode} ${editableCity}` !== address ||
    editableState !== state ||
    editableCountry !== country;
    

  const handleSave = () => {
    if (onSave) {
      // Filter out empty components and join with proper spacing
      const addressComponents = [
        editableStreet,
        editableHouseNumber && `${editableHouseNumber},`, // Added comma after house number
        [editablePostalCode, editableCity].filter(Boolean).join(' ')
      ].filter(Boolean);
      
      const formattedAddress = addressComponents.join(' ').trim();
      
      onSave({
        name: editableName,
        address: formattedAddress,
        state: editableState,
        country: editableCountry
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="flex">
          {/* Left Column - Section Headers */}
          <div className="w-32 pr-4 flex grid flex-col justify-start">
            <div className="mb-6 flex">
              <span className="font-bold text-[#262626] text-[22px] text-right leading-tight">
                Restaurant<br/>Name
              </span>
            </div>
          </div>

          {/* Right Column - Form Fields */}
          <div className="flex-1">
            <div className="mb-6">
              <input
                type="text"
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[20px] text-[#262626] font-normal outline-none"
                value={editableName}
                onChange={(e) => setEditableName(e.target.value)}
                placeholder="Restaurant Name eingeben"
              />
              <div className="w-[20px] h-px"></div>
              <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#DBDBDB] space-y-4 mt-4">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525L2 22L7.54753 20.9565C8.88843 21.6244 10.4003 22 12 22Z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 12H15M12 9V15" stroke="#262626" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Restaurant Name auf allen Plattformen</h3>
                    <p className="text-[16px] mt-1 text-[#1A1A1A]">Dieser Name wird auf Google Business Profile, Social Media, Rechnungen, Webseite, Reservierungssystemen und Lieferplattformen verwendet. Änderungen sollten sorgfältig überlegt sein.</p>
                  </div>
                </div>
              </div>
                   {/* Add concatenated address display */}
                   {editableStreet && (
                <div className="flex grid text-[20px] text-[#262626] mt-2 mb-5">
                  
               </div>
              )}
            </div>

            <div className="mb-6">
              <span><label className="block text-[17px] text-[#262626] mb-3 font-semibold">Adresse:<label className="font-light"> {`${editableStreet} ${editableHouseNumber}, ${editablePostalCode} ${editableCity}`.trim()}</label></label></span>
         
              <div className="space-y-4">
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="flex-1 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none"
                    value={editableStreet}
                    onChange={(e) => setEditableStreet(e.target.value)}
                    placeholder="Straße"
                  />
                  <input
                    type="text"
                    className="w-24 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none"
                    value={editableHouseNumber}
                    onChange={(e) => setEditableHouseNumber(e.target.value)}
                    placeholder="Nr."
                  />
                </div>
                <div className="flex gap-4">
                  <input
                    type="text"
                    className="w-1/3 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none"
                    value={editablePostalCode}
                    onChange={(e) => setEditablePostalCode(e.target.value)}
                    placeholder="PLZ"
                  />
                  <input
                    type="text"
                    className="flex-1 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none"
                    value={editableCity}
                    onChange={(e) => {
                      setEditableCity(e.target.value);
                      if (cityToState[e.target.value]) {
                        setEditableState(cityToState[e.target.value]);
                      }
                    }}
                    placeholder="Stadt"
                  />
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Land</label>
              <select
                className="w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none"
                value={editableCountry}
                onChange={(e) => setEditableCountry(e.target.value)}
              >
                <option value="DE">Deutschland</option>
                <option value="AT">Österreich</option>
                <option value="CH">Schweiz</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Bundesland</label>
              <select
                className={`w-full bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none ${!isGermany ? 'opacity-50 cursor-not-allowed' : ''}`}
                value={editableState}
                onChange={(e) => setEditableState(e.target.value)}
                disabled={!isGermany}
              >
                <option value="">Bitte wählen</option>
                <option value="BW">Baden-Württemberg</option>
                <option value="BY">Bayern</option>
                <option value="BE">Berlin</option>
                <option value="BB">Brandenburg</option>
                <option value="HB">Bremen</option>
                <option value="HH">Hamburg</option>
                <option value="HE">Hessen</option>
                <option value="MV">Mecklenburg-Vorpommern</option>
                <option value="NI">Niedersachsen</option>
                <option value="NW">Nordrhein-Westfalen</option>
                <option value="RP">Rheinland-Pfalz</option>
                <option value="SL">Saarland</option>
                <option value="SN">Sachsen</option>
                <option value="ST">Sachsen-Anhalt</option>
                <option value="SH">Schleswig-Holstein</option>
                <option value="TH">Thüringen</option>
              </select>
              <p className="text-[12px] text-[#8E8E8E] mt-2">
                Das Bundesland wird automatisch anhand der Stadt ausgewählt. Sie können es auch manuell ändern.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
               className={`w-[160px] h-[48px] bg-[#0095F6] text-white rounded-lg font-semibold text-[18px] opacity-30 ${isChanged ? "opacity-100" : "cursor-not-allowed"}`}
               type="submit"
               disabled={!isChanged}
             >
               Speichern
             </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessInformationSection;