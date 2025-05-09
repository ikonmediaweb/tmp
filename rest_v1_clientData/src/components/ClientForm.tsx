import React, { useState, useEffect } from "react";
import { Client, FormState } from "../types";
import { saveClientData, getClientData } from "../utils/supabase";
import { encryptData, decryptData } from "../utils/encryption";
import TextField from "./TextField";
import PasswordField from "./PasswordField";
import FormSection from "./FormSection";
import { Save, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";

const initialFormState: FormState = {
  isLoading: true,
  isSubmitting: false,
  isSuccess: false,
  error: null,
};

const initialClient: Client = {
  name: "",
  domain: "",
  phone: "",
  address: "",
  tax_number: "",
  tax_id: "",
  owner_name: "",
  email: "",
  email_password: "",
  facebook_username: "",
  facebook_password: "",
  instagram_username: "",
  instagram_password: "",
  google_location_id: "",
  google_account_id: "",
  website: "",
  website_provider: "",
  website_provider_user: "",
  website_provider_pwd: "",
};

const ClientForm: React.FC = () => {
  const [client, setClient] = useState<Client>(initialClient);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchClientData = async () => {
      try {
        const data = await getClientData();
        if (data) {
          // Decrypt password fields
          const decryptedData = {
            ...data,
            email_password: decryptData(data.email_password),
            facebook_password: decryptData(data.facebook_password),
            instagram_password: decryptData(data.instagram_password),
          };
          setClient(decryptedData);
        }
        setFormState((prev) => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error("Error fetching client data:", error);
        setFormState({
          isLoading: false,
          isSubmitting: false,
          isSuccess: false,
          error: "Failed to load client data",
        });
      }
    };

    fetchClientData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof Client
  ) => {
    setClient({ ...client, [field]: e.target.value });
    
    // Clear error when field is edited
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    
    // Reset success state when form is edited
    if (formState.isSuccess) {
      setFormState((prev) => ({ ...prev, isSuccess: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const requiredFields: (keyof Client)[] = [
      "name",
      "owner_name",
      "email",
    ];

    // Check required fields
    requiredFields.forEach((field) => {
      if (!client[field]) {
        newErrors[field] = "This field is required";
      }
    });

    // Email validation
    if (
      client.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)
    ) {
      newErrors.email = "Invalid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setFormState({
      isLoading: false,
      isSubmitting: true,
      isSuccess: false,
      error: null,
    });

    try {
      // Encrypt password fields before saving
      const encryptedData = {
        ...client,
        email_password: encryptData(client.email_password),
        facebook_password: encryptData(client.facebook_password),
        instagram_password: encryptData(client.instagram_password),
      };

      const success = await saveClientData(encryptedData);

      if (success) {
        setFormState({
          isLoading: false,
          isSubmitting: false,
          isSuccess: true,
          error: null,
        });
        
        // Reset success message after 3 seconds
        setTimeout(() => {
          setFormState((prev) => ({ ...prev, isSuccess: false }));
        }, 3000);
      } else {
        throw new Error("Failed to save client data");
      }
    } catch (error) {
      console.error("Error saving client data:", error);
      setFormState({
        isLoading: false,
        isSubmitting: false,
        isSuccess: false,
        error: "Failed to save client data",
      });
    }
  };

  if (formState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 bg-white min-h-screen">
      {formState.error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-md mb-6 flex items-center text-sm">
          <AlertTriangle size={16} className="mr-2" />
          <span>{formState.error === "Failed to load client data" ? "Fehler beim Laden der Daten" : formState.error}</span>
        </div>
      )}

      {formState.isSuccess && (
        <div className="bg-green-50 text-green-600 px-4 py-3 rounded-md mb-6 flex items-center text-sm animate-fade-in">
          <CheckCircle size={16} className="mr-2" />
          <span>Daten erfolgreich gespeichert!</span>
        </div>
      )}

      <div className="space-y-12">
        <div className="flex items-center space-x-4 mb-8">
          <button className="text-[#0095F6] hover:opacity-70 transition-opacity">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-[#262626]">Professionelles Konto</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-8">
            <div className="text-xl font-bold text-[#262626]">Kategorie</div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3.5 px-4 bg-[#FAFAFA] rounded-lg">
                <span className="text-[#262626] text-[14px]">Produkt/Dienstleistung</span>
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    className="flex items-center justify-center bg-[#0095F6] text-white py-2 px-4 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0095F6] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed text-[14px] font-medium"
                    disabled={formState.isSubmitting}
                  >
                    {formState.isSubmitting ? (
                      <>
                        <Loader2 size={14} className="text-[#0095F6] text-lg font-medium animate-spin mr-1" />
                        Wird gespeichert...
                      </>
                    ) : (
                      <>
                        
                        Ändern
                      </>
                    )}
                  </button>
                  
                </div>
              </div>
           
            </div>
          </div>

          <div className="flex-grid grid grid-cols-1 md:grid-cols-[300px,1fr] gap-8">
            <div className="text-xl font-bold text-white">Öffentliche Geschäftsinformationen</div>
            <div className="space-y-6">
              <div>
                <label className="block text-[14px] text-[#262626] mb-2">E-Mail</label>
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => handleInputChange(e, "email")}
                  className="w-full px-4 py-3.5 bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg text-[14px] focus:outline-none focus:border-[#A8A8A8]"
                  placeholder="E-Mail-Adresse eingeben"
                />
              </div>

              <div>
                <div className="flex-grid block text-xl font-bold text-[#262626] mb-2">
                  <div className="flex-grid lextext-left mr-20 px-4 leading-[1.4rem]">WhatsApp<div>Nummer</div></div>
                </div>
                <div className="flex">
                  <button 
                    type="button"
                    className="px-4 py-3.5 bg-[#FAFAFA] border border-[#DBDBDB] border-r-0 rounded-l-lg text-[#0095F6] text-[14px] font-medium"
                  >
                    +
                  </button>
                  <input
                    type="text"
                    placeholder="WhatsApp Geschäftsnummer"
                    className="flex-1 px-4 py-3.5 bg-[#FAFAFA] border border-[#DBDBDB] rounded-r-lg text-[14px] focus:outline-none focus:border-[#A8A8A8]"
                  />
                </div>
                <p className="mt-2 text-[12px] text-[#8E8E8E]">
                  Verbinden Sie Ihr WhatsApp Business-Konto mit Instagram, um Anzeigen zu erstellen, die WhatsApp-Chats öffnen.
                </p>
              </div>
            </div>
          </div>

          {/* Apply the same grid layout to all sections */}
          <div className="grid grid-cols-1 md:grid-cols-[300px,1fr] gap-8">
            <div className="text-xl font-bold text-white">Optionen</div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="radio" id="call" name="contact" className="text-[#0095F6]" />
                <label htmlFor="call" className="text-[14px] text-[#262626]">Anrufen</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="text" name="contact" className="text-[#0095F6]" />
                <label htmlFor="text" className="text-[14px] text-[#262626]">SMS</label>
              </div>
              <p className="text-[12px] text-[#8E8E8E] mt-2">
                Personen können Sie unter dieser Nummer anrufen oder eine SMS senden. Es gelten die üblichen Nachrichtengebühren.
              </p>
            </div>
          </div>

          {/* Continue with other sections using the same grid layout */}
          <FormSection title="Geschäftsinformationen">
            <TextField
              id="name"
              label="Restaurantname"
              value={client.name}
              onChange={(e) => handleInputChange(e, "name")}
              error={errors.name}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="domain"
                label="Domain"
                value={client.domain}
                onChange={(e) => handleInputChange(e, "domain")}
                error={errors.domain}
              />

              <TextField
                id="phone"
                label="Telefon"
                value={client.phone}
                onChange={(e) => handleInputChange(e, "phone")}
                error={errors.phone}
                type="tel"
              />
            </div>

            <TextField
              id="address"
              label="Adresse"
              value={client.address}
              onChange={(e) => handleInputChange(e, "address")}
              error={errors.address}
              placeholder="Standort des Restaurants"
            />
          </FormSection>

          <FormSection title="Steuerinformationen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="tax_number"
                label="Steuernummer"
                value={client.tax_number}
                onChange={(e) => handleInputChange(e, "tax_number")}
                error={errors.tax_number}
              />

              <TextField
                id="tax_id"
                label="Steuer-ID"
                value={client.tax_id}
                onChange={(e) => handleInputChange(e, "tax_id")}
                error={errors.tax_id}
              />
            </div>
          </FormSection>

          <FormSection title="E-Mail-Zugang">
            <TextField
              id="email"
              label="E-Mail-Adresse"
              value={client.email}
              onChange={(e) => handleInputChange(e, "email")}
              error={errors.email}
              type="email"
            />

            <PasswordField
              id="email_password"
              label="E-Mail-Passwort"
              value={client.email_password}
              onChange={(e) => handleInputChange(e, "email_password")}
              error={errors.email_password}
            />
          </FormSection>

          <FormSection title="Social Media Zugang">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="facebook_username"
                label="Facebook Benutzername"
                value={client.facebook_username}
                onChange={(e) => handleInputChange(e, "facebook_username")}
                error={errors.facebook_username}
              />

              <PasswordField
                id="facebook_password"
                label="Facebook Passwort"
                value={client.facebook_password}
                onChange={(e) => handleInputChange(e, "facebook_password")}
                error={errors.facebook_password}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="instagram_username"
                label="Instagram Benutzername"
                value={client.instagram_username}
                onChange={(e) => handleInputChange(e, "instagram_username")}
                error={errors.instagram_username}
              />

              <PasswordField
                id="instagram_password"
                label="Instagram Passwort"
                value={client.instagram_password}
                onChange={(e) => handleInputChange(e, "instagram_password")}
                error={errors.instagram_password}
              />
            </div>
          </FormSection>

          <FormSection title="Google Business Informationen">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="google_location_id"
                label="Google Standort-ID"
                value={client.google_location_id}
                onChange={(e) => handleInputChange(e, "google_location_id")}
                error={errors.google_location_id}
              />

              <TextField
                id="google_account_id"
                label="Google Konto-ID"
                value={client.google_account_id}
                onChange={(e) => handleInputChange(e, "google_account_id")}
                error={errors.google_account_id}
              />
            </div>
          </FormSection>

          <FormSection title="Website-Anbieter Informationen">
            <TextField
              id="website_provider"
              label="Website-Anbieter"
              value={client.website_provider}
              onChange={(e) => handleInputChange(e, "website_provider")}
              error={errors.website_provider}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                id="website_provider_user"
                label="Anbieter Benutzername"
                value={client.website_provider_user}
                onChange={(e) => handleInputChange(e, "website_provider_user")}
                error={errors.website_provider_user}
              />

              <PasswordField
                id="website_provider_pwd"
                label="Anbieter Passwort"
                value={client.website_provider_pwd}
                onChange={(e) => handleInputChange(e, "website_provider_pwd")}
                error={errors.website_provider_pwd}
              />
            </div>
          </FormSection>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center justify-center bg-[#0095F6] hover:bg-[#1877F2] text-white py-3.5 px-6 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0095F6] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed min-w-[120px] text-[14px] font-medium"
              disabled={formState.isSubmitting}
            >
              {formState.isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2" />
                  Wird gespeichert...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Speichern
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};






export default ClientForm;