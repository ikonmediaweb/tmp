// ... existing code ...

// Add this to your types file
declare global {
  interface Window {
    electron?: {
      openFile: () => Promise<string>;
      // Add other Electron API methods you need
    };
  }
}

// ... existing code ...