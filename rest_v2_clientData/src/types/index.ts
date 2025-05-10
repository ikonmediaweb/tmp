export interface Client {
  id?: string;
  name: string; // matches clients.name
  domain: string;
  phone: string; // matches clients.phone
  address: string;
  tax_number: string;
  tax_id: string; // matches clients.tax_id
  owner_name: string; // matches clients.owner_name
  email: string; // matches clients.email
  email_password: string;
  facebook_username: string;
  facebook_password: string;
  instagram_username: string;
  instagram_password: string;
  google_location_id: string; // matches clients.google_location_id
  google_account_id: string; // matches clients.google_account_id
  website: string; // matches clients.website
  website_provider: string; // matches clients.website_provider
  website_provider_user: string; // matches clients.website_provider_user
  website_provider_pwd: string; // matches clients.website_provider_pwd
  meta_tags: string; // Add this new field for meta tags
  street: string;
  houseNumber: string;
  postalCode: string;
  state: string;
  country: string;
}

export interface FormState {
  isLoading: boolean;
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}