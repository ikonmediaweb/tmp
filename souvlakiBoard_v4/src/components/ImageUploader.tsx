// ... existing code ...

// Add this input field for direct path entry
<div className="mt-4">
  <label htmlFor="imagePath" className="block text-sm font-medium text-gray-700">
    Enter image path directly:
  </label>
  <div className="mt-1 flex rounded-md shadow-sm">
    <input
      type="text"
      name="imagePath"
      id="imagePath"
      className="focus:ring-indigo-500 focus:border-indigo-500 flex-1 block w-full rounded-md sm:text-sm border-gray-300 p-2"
      placeholder="C:\_git\souvlakiBoard_v4\src\assets\images\menu_image.jpg"
      onChange={(e) => {
        onImageSelected(e.target.value);
      }}
    />
    <button
      type="button"
      className="ml-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      onClick={() => {
        const path = document.getElementById('imagePath') as HTMLInputElement;
        if (path.value) {
          onImageSelected(path.value);
        }
      }}
    >
      Use Path
    </button>
  </div>
</div>

const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  const file = files[0];
  
  // Instead of reading the file as data URL, store the file path
  // For security reasons, browsers don't allow direct access to file paths
  // We'll need to use Electron's dialog API if this is an Electron app
  
  // For Electron apps:
  if (window.electron) {
    // Store the file path directly
    const filePath = file.path;
    onImageSelected(filePath);
  } else {
    // For web browsers (fallback to data URL if needed)
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelected(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  }
};