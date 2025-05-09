/*
  # Add social media credentials to clients table

  1. Changes
    - Add social media credentials columns:
      - facebook_username (text)
      - facebook_password (text)
      - instagram_username (text)
      - instagram_password (text)
      - email_password (text)

  2. Security
    - Maintain existing RLS policies
    - All new columns inherit existing table security
*/

-- Add new columns for social media credentials
ALTER TABLE clients
ADD COLUMN IF NOT EXISTS facebook_username text,
ADD COLUMN IF NOT EXISTS facebook_password text,
ADD COLUMN IF NOT EXISTS instagram_username text,
ADD COLUMN IF NOT EXISTS instagram_password text,
ADD COLUMN IF NOT EXISTS email_password text;