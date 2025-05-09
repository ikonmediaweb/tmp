import CryptoJS from "crypto-js";

const SECRET_KEY = "client-data-secure-key"; // In production, this would be a secure environment variable

export const encryptData = (text: string): string => {
  if (!text) return "";
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decryptData = (ciphertext: string): string => {
  if (!ciphertext) return "";
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};