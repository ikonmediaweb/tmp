// ... existing code ...

const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
  event.preventDefault();
  event.stopPropagation();
  setIsDragging(false);
  
  const files = event.dataTransfer.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  
  // For Electron apps:
  if (window.electron) {
    // Get the file path directly   
    const filePath = file.path;
    onFileDrop(filePath);
  } else {
    // For web browsers (fallback to data URL)
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onFileDrop(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }
};

// ... existing code ...