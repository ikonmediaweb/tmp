export interface Client {
  name: string;
  domain: string;
  phone: string;
  address: string;
  tax_number?: string; // Make tax_number optional
  tax_id: string;
  owner_name: string;
  email: string;
  email_password: string;
  facebook_username: string;
  facebook_password: string;
  facebook_slug: string;
  instagram_username: string;
  instagram_password: string;
  google_location_id: string;
  google_account_id: string;
  website: string;
  website_provider: string;
  website_provider_user: string;
  website_provider_pwd: string;
  meta_tags: string;
}

export interface State {
  id: number;
  name: string;  // Deutschland, Österreich
  code: string;  // DE, AT
}

export interface Region {
  id: number;
  state_id: number;
  name: string;  // e.g., Bayern, Berlin, etc.
  code: string;  // BY, BE, etc.
}

// Update Client interface to include state and region
export interface Client {
  name: string;
  domain: string;
  phone: string;
  address: string;
  tax_number?: string; // Make tax_number optional
  tax_id: string;
  owner_name: string;
  email: string;
  email_password: string;
  facebook_username: string;
  facebook_password: string;
  facebook_slug: string;
  instagram_username: string;
  instagram_password: string;
  google_location_id: string;
  google_account_id: string;
  website: string;
  website_provider: string;
  website_provider_user: string;
  website_provider_pwd: string;
  meta_tags: string;
  state_id?: number;
  region_id?: number;
}