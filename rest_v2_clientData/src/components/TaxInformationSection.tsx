import React, { useState } from "react";

interface TaxInformationSectionProps {
  tax_number: string;
  tax_id: string;
  onSave?: (data: { tax_number: string; tax_id: string }) => void;
}

const TaxInformationSection: React.FC<TaxInformationSectionProps> = ({
  tax_number,
  tax_id,
  onSave
}) => {
  const [part1, setPart1] = useState(tax_number.split('/')[0] ?? "");
  const [part2, setPart2] = useState(tax_number.split('/')[1] ?? "");
  const [part3, setPart3] = useState(tax_number.split('/')[2] ?? "");
  const [taxId, setTaxId] = useState(tax_id?.replace('DE', '') ?? "");

  const isChanged = (part1.length > 0 && part2.length > 0 && part3.length > 0) || 
                   (taxId.length > 0 && taxId !== tax_id?.replace('DE', ''));

  const handleSave = () => {
    if (onSave) {
      onSave({
        tax_number: `${part1}/${part2}/${part3}`,
        tax_id: `DE${taxId}`
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <form onSubmit={e => { e.preventDefault(); handleSave(); }}>
        <div className="mb-6">
          <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Umsatzsteuer-ID</label>
          <div className="flex">
            <div className="bg-[#FAFAFA] border border-[#DBDBDB] rounded-l-lg px-4 py-3 text-[17px] text-[#8E8E8E]">
              DE
            </div>
            <input
              type="text"
              className="flex-1 bg-[#FAFAFA] border border-[#DBDBDB] rounded-r-lg px-4 py-3 text-[17px] text-[#262626] font-normal outline-none border-l-0"
              value={taxId}
              onChange={e => setTaxId(e.target.value)}
              placeholder="123456789"
              maxLength={9}
            />
          </div>
          <p className="text-[12px] text-[#8E8E8E] mt-2">
            Geben Sie Ihre Umsatzsteuer-ID ein (falls vorhanden).
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-[17px] text-[#262626] mb-3 font-semibold">Steuernummer</label>
          <div className="flex space-x-2">
            <input
              type="text"
              className="w-16 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-2 py-3 text-[17px] text-[#262626] font-normal outline-none"
              value={part1}
              onChange={e => setPart1(e.target.value)}
              placeholder="2-3"
              maxLength={3}
            />
            <span>/</span>
            <input
              type="text"
              className="w-16 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-2 py-3 text-[17px] text-[#262626] font-normal outline-none"
              value={part2}
              onChange={e => setPart2(e.target.value)}
              placeholder="3"
              maxLength={3}
            />
            <span>/</span>
            <input
              type="text"
              className="w-20 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg px-2 py-3 text-[17px] text-[#262626] font-normal outline-none"
              value={part3}
              onChange={e => setPart3(e.target.value)}
              placeholder="5"
              maxLength={5}
            />
          </div>
          <p className="text-[12px] text-[#8E8E8E]">
            Bitte geben Sie Ihre 13-stellige Steuernummer ein.
          </p>
          <div className="bg-[#FAFAFA] p-4 rounded-lg mt-4">
            <div className="flex items-start space-x-2">
              <span className="text-[#262626] font-semibold">Wo finde ich meine 13-stellige Steuernummer?</span>
            </div>
            <p className="text-[12px] text-[#8E8E8E] mt-2">
              Die landesspezifische Steuernummer finden Sie auf allen Dokumenten, die Sie vom Finanzamt erhalten. Dazu zählt beispielsweise der Steuerbescheid. Es ist natürlich auch möglich, die Steuernummer telefonisch beim Finanzamt zu erfragen. Einige Bundesländer verteilen allerdings nur 10-, 11- oder 12-stellige Steuernummern. Sie können diese landesspezifischen Nummern selbst in das neue, 13-stellige Format bringen. Für die Umwandlung in die 13-stellige ELSTER-Steuernummer können Sie die untenstehende Tabelle zu Rate ziehen.
            </p>
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

export default TaxInformationSection;