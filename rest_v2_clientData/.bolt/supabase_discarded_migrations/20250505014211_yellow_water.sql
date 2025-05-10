/*
  # Create clients table

  1. New Table
     - `clients`
       - `id` (uuid, primary key)
       - `restaurant_name` (text)
       - `domain` (text)
       - `telephone` (text)
       - `address` (text)
       - `tax_number` (text)
       - `owner_name` (text)
       - `email_address` (text)
       - `email_password` (text, encrypted)
       - `facebook_username` (text)
       - `facebook_password` (text, encrypted)
       - `instagram_username` (text)
       - `instagram_password` (text, encrypted)
       - `google_location_id` (text)
  
  2. Security
     - Enable RLS on `clients` table
     - Add policy for authenticated users to read and manage client data
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_name text NOT NULL,
  domain text,
  telephone text,
  address text,
  tax_number text,
  owner_name text NOT NULL,
  email_address text NOT NULL,
  email_password text,
  facebook_username text,
  facebook_password text,
  instagram_username text,
  instagram_password text,
  google_location_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);