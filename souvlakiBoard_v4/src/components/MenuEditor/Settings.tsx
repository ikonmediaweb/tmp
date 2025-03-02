// ... existing imports ...
import { UploadIcon } from '@heroicons/react/outline';

// ... inside your Settings component ...
        <div className="space-y-4">
          {/* ... other settings ... */}
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Restaurant Logo</label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="file"
                  accept="image/png"
                  className="hidden"
                  id="logo-upload"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (e) => {
                        onChange({
                          ...data,
                          customLogo: e.target?.result as string
                        });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <UploadIcon className="h-4 w-4 mr-2" />
                  Upload Logo
                </label>
              </div>
              {data.customLogo && (
                <button
                  type="button"
                  className="text-sm text-red-600 hover:text-red-700"
                  onClick={() => onChange({ ...data, customLogo: undefined })}
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500">
              Recommended: PNG format with transparent background
            </p>
          </div>
          
          {/* ... other settings ... */}
        </div>