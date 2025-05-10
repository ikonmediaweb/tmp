import React, { useState, useEffect } from "react";
import { Client, FormState } from "../types";
import { saveClientData, getClientData } from "../utils/supabase";
import { encryptData, decryptData } from "../utils/encryption";
import WebsiteProviderSection from "./WebsiteProviderSection";
import IndexSection from "./IndexSection";
import TextField from "./TextField";
import PasswordField from "./PasswordField";
import FormSection from "./FormSection";
import TaxInformationSection from "./TaxInformationSection"; // Import the new component
import { Save, AlertTriangle, CheckCircle, Loader2, ChevronLeft } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import SocialMediaSection from "./SocialMediaSection";
import BusinessInformationSection from "./BusinessInformationSection";

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
  facebook_slug: "",
  instagram_username: "",
  instagram_password: "",
  google_location_id: "",
  google_account_id: "",
  website: "",
  website_provider: "",
  website_provider_user: "",
  website_provider_pwd: "",
  meta_tags: "", // Initialize meta_tags field
};

const ClientForm: React.FC = () => {
  const [client, setClient] = useState<Client>(initialClient);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [fadeOut, setFadeOut] = useState(false);
  const [currentView, setCurrentView] = useState<'form' | 'index' | 'website-provider' | 'social-media' | 'tax-information'>('form');

  const handleBackToIndex = () => {
    setCurrentView('index'); 
    
  }; // Add the missing closing brace here

  const handleSectionSelect = (section: string) => {
    setFadeOut(true);
    setTimeout(() => {
      switch (section) {
        case "website":
          setCurrentView('website-provider');
          break;
        case "social":
          setCurrentView('social-media');
          break;
        case "tax":
          setCurrentView('tax-information');
          break;
        case "business":
          setCurrentView('business');
          break;
        case "email":
          setCurrentView('email');
          break;
        case "google":
          setCurrentView('google');
          break;
        case "profile":
          setCurrentView('form');
          break;
        default:
          setCurrentView('index');
      }
      setFadeOut(false);
    }, 300);
  };

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

  const handleTaxInformationSave = (data: { tax_number: string }) => {
    // Update the client object with the new tax number
    setClient(prevClient => ({
      ...prevClient,
      tax_number: data.tax_number,
      tax_id: data.tax_id
    }));
    
    // Set form state to indicate changes
    setFormState(prev => ({
      ...prev,
      isSuccess: true
    }));
    
    // Reset success message after 3 seconds
    setTimeout(() => {
      setFormState(prev => ({ ...prev, isSuccess: false }));
    }, 3000);
    
    // Navigate back to the index view
    handleBackToIndex();
};

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

  const handleBusinessInformationSave = async (data: {
    name: string;
    address: string;
    state: string;
    country: string;
  }) => {
    // Update the client object with the new data
    const updatedClient = {
      ...client,
      name: data.name,
      address: data.address,
      state: data.state,
      country: data.country
    };
  
    setClient(updatedClient);
  
    try {
      // Preserve encrypted fields
      const encryptedData = {
        ...updatedClient,
        email_password: client.email_password ? encryptData(client.email_password) : null,
        facebook_password: client.facebook_password ? encryptData(client.facebook_password) : null,
        instagram_password: client.instagram_password ? encryptData(client.instagram_password) : null,
      };
  
      // Save to Supabase with encrypted data
      const success = await saveClientData(encryptedData);
  
      if (success) {
        setFormState({
          isLoading: false,
          isSubmitting: false,
          isSuccess: true,
          error: null,
        });
        
        setTimeout(() => {
          setFormState(prev => ({ ...prev, isSuccess: false }));
        }, 3000);
  
        handleBackToIndex();
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

  const handleWebsiteProviderSave = async (data: { domain: string, meta_tags: string }) => {
    // Update the client object with the new domain and meta_tags
    const updatedClient = {
      ...client,
      domain: data.domain,
      meta_tags: data.meta_tags
    };
  
    setClient(updatedClient);
  
    try {
      // Preserve encrypted fields
      const encryptedData = {
        ...updatedClient,
        email_password: client.email_password ? encryptData(client.email_password) : null,
        facebook_password: client.facebook_password ? encryptData(client.facebook_password) : null,
        instagram_password: client.instagram_password ? encryptData(client.instagram_password) : null,
      };
  
      // Save to Supabase with encrypted data
      const success = await saveClientData(encryptedData);
  
      if (success) {
        setFormState({
          isLoading: false,
          isSubmitting: false,
          isSuccess: true,
          error: null,
        });
        
        setTimeout(() => {
          setFormState(prev => ({ ...prev, isSuccess: false }));
        }, 3000);
  
        handleBackToIndex();
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
    <div className="max-w-6xl mx-auto p-[20px] sm:p-[32px] bg-white min-h-screen">
      <div className="flex items-center mb-6 space-x-4">
        <button 
          onClick={handleBackToIndex}
          className="text-[#262626] hover:opacity-70 transition-opacity"
        >
          <ChevronLeft size={40} strokeWidth={2} className="translate-y-[9%]" />
        </button>
        <h1 className="text-[32px] font-bold text-[#262626]">Konto</h1>
      </div>

      {currentView === 'index' ? (
        <IndexSection onNavigate={handleSectionSelect} />
      ) : currentView === 'business' ? (
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <BusinessInformationSection
          name={client.name}
          address={client.address}
          state={client.state}
          country={client.country}
          onSave={handleBusinessInformationSave}
          />
          {formState.isSuccess && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
              <CheckCircle size={20} />
              <span>Änderungen gespeichert</span>
            </div>
          )}
        </div>
      ) : currentView === 'website-provider' ? (
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <WebsiteProviderSection
            providerName={client.website_provider || "Webseite Provider"}
            providerUsername={client.website_provider_user || "provider_username"}
            onPhotoChange={() => console.log("Change photo clicked")}
            onBack={handleBackToIndex}
            domain={client.domain}
            meta_tags={client.meta_tags}
            onSave={handleWebsiteProviderSave}
          />
          {formState.isSuccess && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
              <CheckCircle size={20} />
              <span>Änderungen gespeichert</span>
            </div>
          )}
        </div>
      ) : currentView === 'social-media' ? (
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <SocialMediaSection
            facebook_user={client.facebook_username || ""}
            facebook_password={client.facebook_password || ""}
            facebook_slug={client.facebook_slug || ""}
            instagram_user={client.instagram_username || ""}
            instagram_password={client.instagram_password || ""}
            instagram_slug={client.instagram_slug || ""}
            onSave={async ({
              facebook_user,
              facebook_password,
              facebook_slug,
              instagram_user,
              instagram_password,
              instagram_slug
            }) => {
              // Update local state
              const updatedClient = {
                ...client,
                facebook_username: facebook_user,
                facebook_password: facebook_password,
                facebook_slug: facebook_slug,
                instagram_username: instagram_user,
                instagram_password: instagram_password,
                instagram_slug: instagram_slug,
              };

              setClient(updatedClient);

              // Encrypt sensitive data before saving
              const encryptedData = {
                ...updatedClient,
                email_password: encryptData(updatedClient.email_password),
                facebook_password: encryptData(facebook_password),
                instagram_password: encryptData(instagram_password),
              };

              try {
                // Save to Supabase
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
                    setFormState(prev => ({ ...prev, isSuccess: false }));
                  }, 3000);

                  // Navigate back to index
                  handleBackToIndex();
                } else {
                  throw new Error("Failed to save client data");
                }
              } catch (error) {
                console.error("Error saving social media data:", error);
                setFormState({
                  isLoading: false,
                  isSubmitting: false,
                  isSuccess: false,
                  error: "Failed to save client data",
                });
              }
            }}
          />
          {formState.isSuccess && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
              <CheckCircle size={20} />
              <span>Änderungen gespeichert</span>
            </div>
          )}
        </div>
      ) : currentView === 'tax-information' ? (
        <div className={`transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
          <TaxInformationSection
            tax_number={client.tax_number || ""}
            onSave={handleTaxInformationSave}
          />
          {formState.isSuccess && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in">
              <CheckCircle size={20} />
              <span>Änderungen gespeichert</span>
            </div>
          )}
        </div>
      ) : currentView === 'form' && (
        <form 
          onSubmit={handleSubmit} 
          className={`space-y-12 transition-opacity duration-300 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-8">
            <div></div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-[18px] px-[20px] bg-[#FAFAFA] rounded-lg">
                <p className="text-[#262626] text-[17px]">Produkt/Dienstleistung: <span className="font-semibold tracking-[-0.02em]">Social Media Abo</span></p>
                <div className="flex items-center space-x-3">
                  <button
                    type="submit"
                    className="w-[130px] h-[50px] flex items-center justify-center bg-[#0095F6] text-white rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#0095F6] focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed text-[19px] font-semibold mx-[15px]"
                    disabled={formState.isSubmitting}
                  >
                    {formState.isSubmitting ? (
                      <>
                        <Loader2 size={22} className="text-white animate-spin" />
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

          <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-8 ">
            <div className="space-y-8">
              <div className="text-lg font-semibold text-[#262626] text-right">Email</div>
              <div className="grid text-[18px] font-bold text-[#262626] leading-tight text-right justify-bottom translate-y-[35%]">WhatsApp<br/>Number</div>
            </div>
            <div className="space-y-6">
              <div>
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => handleInputChange(e, "email")}
                  className="w-full px-4 py-3.5 font-normal bg-[#FAFAFA] border border-[#DBDBDB] rounded-lg text-[18px] focus:outline-none focus:border-[#A8A8A8]"
                  placeholder="E-Mail-Adresse eingeben"
                />
              </div>

              <div>
                <div className="flex">
                  <button 
                    type="button"
                    className="px-4 py-3.5 bg-[#FAFAFA] border border-[#DBDBDB] border-r-0 rounded-l-lg text-[#0095F6] text-[18px] font-medium"
                  >
                    +
                  </button>
                  <input
                    type="text"
                    placeholder="WhatsApp Geschäftsnummer"
                    className="flex-1 px-4 py-3.5 font-normal bg-[#FAFAFA] border border-[#DBDBDB] rounded-r-lg text-[18px] focus:outline-none focus:border-[#A8A8A8]"
                  />
                </div>
                <p className="mt-2 text-[12px] text-[#8E8E8E]">
                  Verbinden Sie Ihr WhatsApp Business-Konto mit Instagram, um Anzeigen zu erstellen, die WhatsApp-Chats öffnen.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-8">
            <div className="text-lg font-semibold text-[#262626] leading-tight text-right">Wie dürfen wir sie erreichen?</div>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="radio" id="call" name="contact" className="text-[#262626] w-6 h-6 accent-[#262626]" />
                <label htmlFor="call" className="text-[16px] text-[#1A1A1A]">Anrufen</label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="radio" id="text" name="contact" className="text-[#262626] w-6 h-6 accent-[#262626]" />
                <label htmlFor="text" className="text-[16px] text-[#1A1A1A]">SMS</label>
              </div>
          
              <div className="space-y-2">
                <p className="text-[12px] text-[#8E8E8E]">
                  Personen können Sie unter dieser Nummer anrufen oder eine SMS senden. Es gelten die üblichen Nachrichtengebühren.
                </p>
                <div className="w-[20px] h-px"></div>
                <div className="flex items-center space-x-2 bg-[#FAFAFA] p-4 rounded-lg border border-[#DBDBDB]">
                  <input type="checkbox" id="display_contact" className="text-[#262626] rounded-xs w-6 h-6 accent-[#161616]" />
                  <label htmlFor="display_contact" className="text-[16px] text-[#1A1A1A]">Kontaktinformationen anzeigen</label>
                </div>
                <div className="bg-[#FAFAFA] p-4 rounded-lg border border-[#DBDBDB] space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#1A1A1A]">WhatsApp mit Geschäftsfunktionen</h3>
                      <p className="text-[16px] mt-1 text-[#1A1A1A]">Behalten Sie Ihre Nummer, Chats und Kontakte bei und fügen Sie Geschäftsfunktionen zu Ihrem WhatsApp hinzu.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#1A1A1A]">Verkäufe durch Gespräche steigern</h3>
                      <p className="text-[16px] mt-1 text-[#1A1A1A]">Verwalten Sie Nachrichten, um mit den Tools in WhatsApp Business dauerhafte Kundenbeziehungen aufzubauen.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-[240px,1fr] gap-8">
            <div className="text-lg font-semibold text-[#262626] text-right">Phone</div>
            <div>
              <div className="space-y-2">
                <div className="flex">
                  <div className="flex items-center px-3 py-3.5 bg-[#FAFAFA] border border-[#DBDBDB] border-r-0 rounded-l-lg text-[14px] min-w-[90px]">
                    <span className="text-[17px] font-normal text-[#0095F6]">DE</span>
                    <span className="text-[17px] font-normal text-[#0095F6] ml-2">+49</span>
                  </div>
                  <input
                    type="tel"
                    value={client.phone}
                    onChange={(e) => handleInputChange(e, "phone")}
                    className="flex-1 px-3 py-3.5 bg-[#FAFAFA] border border-[#DBDBDB] rounded-r-lg text-[18px] focus:outline-none focus:border-[#A8A8A8] font-normal placeholder-[#8E8E8E]"
                    placeholder="1624249788"
                  />
                </div>
                <p className="text-[12px] text-[#8E8E8E]">
                  Sie können SMS-Updates von Instagram erhalten und sich jederzeit abmelden.
                </p>
              </div>
            </div>
          </div>

          {/* Business sections commented out */}

          <div className="flex justify-end">
          
          </div>
        </form>
      )}
    </div>
  );
};

export default ClientForm;