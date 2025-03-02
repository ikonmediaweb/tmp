import React from 'react';
import { ImageSection as ImageSectionType } from '../types';
import { X } from 'lucide-react';

interface Props {
  section: ImageSectionType;
  onUpdate: (section: ImageSectionType) => void;
  onDelete: () => void;
}

export function ImageSection({ section, onUpdate, onDelete }: Props) {
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onUpdate({
            ...section,
            imageUrl: e.target.result as string
          });
        }
      };
      reader.onerror = () => {
        console.error("Error reading file");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="border rounded-lg p-4 mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Image Section</h3>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-gray-100 rounded"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
      />
      
      {section.imageUrl && (
        <img 
          src={section.imageUrl} 
          alt="Section" 
          className="mt-4 max-w-full h-auto"
          style={{
            maxHeight: '90vh', // Adjust max height to prevent overflow
            objectFit: 'contain' // Ensure the image fits within the container
          }}
        />
      )}
    </div>
  );
}