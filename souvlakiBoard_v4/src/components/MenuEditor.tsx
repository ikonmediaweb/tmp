import { useState, useEffect } from 'react';
import { MenuData, MenuSection, MenuItem, AVAILABLE_FONTS, FONT_SIZES, FONT_WEIGHTS, LINE_HEIGHTS, SectionStyles, LETTER_SPACING, TEXT_TRANSFORMS, Price} from '../types';
import { Settings, Plus, Trash2, Eye, EyeOff, AlignJustify, ChevronDown, ChevronUp, GripVertical, Tractor as Transform, Search, MoveRight, Download, RefreshCw } from 'lucide-react';
import { createPortal } from 'react-dom';
import logo from '../assets/logo.png'; // Adjust the path 
import logoHover from '../assets/logo-hover.png';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Logo from './Logo';
import React from 'react';

// Load the sound file
/* const popSound = new Audio(require('../assets/sounds/pop.mp3')); */

// PLU counter for generating unique PLU numbers
let pluCounter = 1000;

function generatePLU(): string {
  return (pluCounter++).toString();
}

interface MenuEditorProps {
  menuData: MenuData;
  onUpdate: (data: MenuData) => void;
  currentVersion: { name: string } | null;
}

interface TypographyControlProps {
  label: string;
  fontSize: string;
  fontWeight: string;
  lineHeight: string;
  letterSpacing: string;
  transform?: string;
  onUpdate: (fontSize: string, fontWeight: string, lineHeight: string, letterSpacing: string, transform?: string) => void;
}

interface SortableSectionProps {
  section: MenuSection;
  menuData: MenuData;
  expandedSections: { [key: string]: boolean };
  expandedControls: { [key: string]: boolean };
  editingSectionStyles: string | null;
  toggleSection: (id: string) => void;
  toggleControl: (id: string) => void;
  updateSection: (id: string, updates: Partial<MenuSection>) => void;
  updateSectionStyles: (id: string, styles: SectionStyles) => void;
  togglePluVisibility: (id: string) => void;
  toggleDescriptionVisibility: (id: string) => void;
  setEditingSectionStyles: (id: string | null) => void;
  addMenuItem: (id: string) => void;
  deleteSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  updateMenuItem: (sectionId: string, itemId: string, updates: Partial<MenuItem>) => void;
  addPrice: (sectionId: string, itemId: string) => void;
  updateItemPriceAt: (sectionId: string, itemId: string, index: number, updates: Partial<Price>) => void;
  removePrice: (sectionId: string, itemId: string, index: number) => void;
  deleteMenuItem: (sectionId: string, itemId: string) => void;
  resetSectionTypography: (sectionId: string) => void;
  moveMenuItem: (fromSectionId: string, toSectionId: string, itemId: string) => void;
}

interface ImageSectionProps {
  section: MenuSection;
  onUpdate: (updatedSection: MenuSection) => void;
  onDelete: () => void;
}

function TypographyControl({ label, fontSize, fontWeight, lineHeight, letterSpacing, transform, onUpdate }: TypographyControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-2 flex items-center justify-between hover:bg-gray-750 transition-colors"
      >
        <span className="text-sm font-medium text-gray-300">{label}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {isExpanded && (
        <div className="p-2 space-y-2 bg-gray-850">
          <select
            value={fontSize}
            onChange={(e) => onUpdate(e.target.value, fontWeight, lineHeight, letterSpacing, transform)}
            className="w-full p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {FONT_SIZES.map((size) => (
              <option key={size.value} value={size.value}>{size.label}</option>
            ))}
          </select>
          <select
            value={fontWeight}
            onChange={(e) => onUpdate(fontSize, e.target.value, lineHeight, letterSpacing, transform)}
            className="w-full p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {FONT_WEIGHTS.map((weight) => (
              <option key={weight.value} value={weight.value}>{weight.label}</option>
            ))}
          </select>
          <select
            value={lineHeight}
            onChange={(e) => onUpdate(fontSize, fontWeight, e.target.value, letterSpacing, transform)}
            className="w-full p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {LINE_HEIGHTS.map((height) => (
              <option key={height.value} value={height.value}>{height.label}</option>
            ))}
          </select>
          <select
            value={letterSpacing}
            onChange={(e) => onUpdate(fontSize, fontWeight, lineHeight, e.target.value, transform)}
            className="w-full p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            {LETTER_SPACING.map((spacing) => (
              <option key={spacing.value} value={spacing.value}>{spacing.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <Transform className="w-4 h-4 text-gray-400" />
            <select
              value={transform || ''}
              onChange={(e) => onUpdate(fontSize, fontWeight, lineHeight, letterSpacing, e.target.value)}
              className="flex-1 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            >
              {TEXT_TRANSFORMS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
function SortableImageSection({ section, onUpdate, onDelete }: {
  section: MenuSection;
  onUpdate: (updatedSection: MenuSection) => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'opacity-50' : ''}`}
    >
      <ImageSection 
        section={section}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}
function SortableSection({
  section,
  menuData,
  expandedSections,
  editingSectionStyles,
  toggleSection,
  updateSection,
  togglePluVisibility,
  toggleDescriptionVisibility,
  addMenuItem,
  deleteSection,
  duplicateSection,
  updateMenuItem,
  addPrice,
  updateItemPriceAt,
  removePrice,
  deleteMenuItem,
  moveMenuItem,
}: SortableSectionProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  const isExpanded = expandedSections[section.id];
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`bg-gray-800 rounded-lg border border-gray-700 shadow-sm ${isDragging ? 'opacity-80' : ''}`}
    >
        <div className="p-3 flex justify-between items-start border-b border-gray-700">
        <div className="flex items-start gap-2">
        <div className="flex gap-2 items-center">
            <button
              className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4" />
            </button>
            <button
              onClick={() => toggleSection(section.id)}
              className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors transform -translate-y-[-8px]"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
          <div className="flex flex-col gap-2">
          <input
              type="text"
              value={section.name}
              onChange={(e) => updateSection(section.id, { name: e.target.value })}
              className="text-base font-medium p-1 bg-gray-750 border-b border-transparent hover:border-gray-600 focus:border-gray-500 focus:outline-none text-indigo-400"
            />
            {!isExpanded && section.description && section.showDescriptions !== false && (
              <div className="text-sm text-gray-400 italic truncate max-w-80">
                {section.description}
              </div>
            )}
           {isExpanded && (
              <>
              <textarea
                  value={section.description || ''}
                  onChange={(e) => updateSection(section.id, { description: e.target.value })}
                  className="w-[350px] h-[200px] mt-2 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="Section description (optional)"
                  rows={2}
                />
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateSection(section.id, { forcePageBreak: !section.forcePageBreak })}
                    className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${section.forcePageBreak ? 'bg-indigo-600' : 'bg-gray-700'}`}
                  >
                    <span className="sr-only">Force page break</span>
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${section.forcePageBreak ? 'translate-x-5' : 'translate-x-0'}`}
                    />
                  </button>
                  <span className="text-sm text-gray-400">Force page break</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-400">Description position:</span>
                  <button
                    onClick={() => updateSection(section.id, { descriptionPosition: 'above' })}
                    className={`px-3 py-1 rounded text-sm ${section.descriptionPosition === 'above' ? 'bg-indigo-600 text-white' : 'bg-gray-750 text-gray-300 hover:bg-gray-700'}`}
                  >
                    Above title
                  </button>
                  <button
                    onClick={() => updateSection(section.id, { descriptionPosition: 'below' })}
                    className={`px-3 py-1 rounded text-sm ${section.descriptionPosition !== 'above' ? 'bg-indigo-600 text-white' : 'bg-gray-750 text-gray-300 hover:bg-gray-700'}`}
                  >
                    Below items
                  </button>
                </div>
              </>
            )}
          </div>
          
        </div>
      
        <div className="flex gap-1">
          <button
            onClick={() => togglePluVisibility(section.id)}
            className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
            title={section.showPlu ? "Hide PLU numbers" : "Show PLU numbers"}
          >
            {section.showPlu ? <Eye className="w-4 h-4 text-indigo-500" /> : <EyeOff className="w-4 h-4" />}
          </button>
          <button
            onClick={() => toggleDescriptionVisibility(section.id)}
            className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
            title={section.showDescriptions ? "Hide descriptions" : "Show descriptions"}
          >
            <AlignJustify className={`w-4 h-4 ${section.showDescriptions ? 'text-indigo-500' : 'text-gray-600'}`} />
          </button>
          {isExpanded && (
            <>
              <button
                onClick={() => addMenuItem(section.id)}
                className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => deleteSection(section.id)}
            className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          {[...section.items]
            .sort((a, b) => {
              const pluA = parseInt(a.plu) || Infinity;
              const pluB = parseInt(b.plu) || Infinity;
              return pluA - pluB;
            })
            .map((item) => (
              <div key={item.id} className="bg-gray-850 p-3 rounded-lg space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-1 space-y-2">
                    <div className="flex gap-2">
                      {section.showPlu && (
                        <input
                          type="text"
                          value={item.plu}
                          onChange={(e) => updateMenuItem(section.id, item.id, { plu: e.target.value })}
                          className="w-16 p-1.5 bg-gray-750 border border-gray-700 rounded text-yellow-400 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="PLU"
                        />
                      )}
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateMenuItem(section.id, item.id, { name: e.target.value })}
                        className="flex-1 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="Item name"
                      />
                      
                      
                      <input
                        type="text"
                        value={item.a || ''}
                        onChange={(e) => {
                          const newA = e.target.value;
                          const template = menuData.sTemplates?.find(t => 
                            t.a === newA && t.z === item.z
                          );
                          updateMenuItem(section.id, item.id, { 
                            a: newA,
                            s: template?.s || item.s
                          });
                        }}
                        className="w-16 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="A"
                      />
                      <input
                        type="text"
                        value={item.z || ''}
                        onChange={(e) => {
                          const newZ = e.target.value;
                          const template = menuData.sTemplates?.find(t => 
                            t.a === item.a && t.z === newZ
                          );
                          updateMenuItem(section.id, item.id, { 
                            z: newZ,
                            s: template?.s || item.s
                          });
                        }}
                        className="w-16 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="Z"
                      />
                    </div>
                    {section.showDescriptions !== false && (
                      <textarea
                        value={item.description}
                        onChange={(e) => updateMenuItem(section.id, item.id, { description: e.target.value })}
                        className="w-full p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        placeholder="Description"
                        rows={2}
                      />
                    )}
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => deleteMenuItem(section.id, item.id)}
                      className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setMovingItemId(movingItemId === item.id ? null : item.id)}
                        className="p-1.5 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
                        title="Move to another section"
                      >
                        <MoveRight className="w-4 h-4" />
                      </button>
                      {movingItemId === item.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 z-50">
                          {menuData.sections
                            .filter(s => s.id !== section.id)
                            .map(targetSection => (
                              <button
                                key={targetSection.id}
                                onClick={() => {
                                  moveMenuItem(section.id, targetSection.id, item.id);
                                  setMovingItemId(null);
                                }}
                                className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-750"
                              >
                                {targetSection.name}
                              </button>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 items-center">
                  {item.prices.map((price, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-800 rounded-lg p-1.5">
                      <input
                        type="text"
                        value={price.size || ''}
                        onChange={(e) => updateItemPriceAt(section.id, item.id, index, { size: e.target.value })}
                        className="w-16 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-1"
                        placeholder="Size"
                      />
                      <input
                        type="number"
                        value={price.price}
                        onChange={(e) => updateItemPriceAt(section.id, item.id, index, { price: parseFloat(e.target.value) || 0 })}
                        className="w-20 bg-gray-750 border border-gray-700 rounded text-green-400 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 p-1"
                        step="0.01"
                        min="0"
                      />
                      {item.prices.length > 1 && (
                        <button
                          onClick={() => removePrice(section.id, item.id, index)}
                          className="p-1 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addPrice(section.id, item.id)}
                    className="p-1.5 bg-gray-800 hover:bg-gray-750 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
function ImageSection({ section, onUpdate, onDelete, dragHandleProps }: ImageSectionProps & { dragHandleProps?: any }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadActive, setUploadActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Define SVG icons as constants with proper encoding
  const UPLOAD_ICON = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15V19C21 19.5304 20.7893 19.9391 20.4142 20.3142C20.0391 20.6893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" 
        stroke="#647484" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
    </svg>
  `)}`;

  const UPLOAD_ACTIVE_ICON = `data:image/svg+xml,${encodeURIComponent(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M21 15V19C21 19.5304 20.7893 19.9391 20.4142 20.3142C20.0391 20.6893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" 
        stroke="#6397ff" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"/>
    </svg>
  `)}`;

  const handleFileUpload = async (file: File) => {
    setUploadActive(true);
    setUploadProgress(0);
  
    if (window.electron) {
      // Use Electron's file system API to save the file to the assets folder
      const assetsPath = await window.electron.saveFileToAssets(file);
      onUpdate({ 
        ...section, 
        imageUrl: `assets/${assetsPath}`,
        name: file.name.split('.').slice(0, -1).join('.')
      });
      setUploadProgress(100);
      setTimeout(() => setUploadActive(false), 100);
    } else {
      try {
        // For web browsers, use Firebase Storage
        const storageRef = ref(storage, `images/${file.name}`);
        
        // Create upload task
        const uploadTask = uploadBytes(storageRef, file);
        
        // Wait for upload to complete
        const snapshot = await uploadTask;
        
        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        
        // Update section with the new image URL
        onUpdate({ 
          ...section, 
          imageUrl: downloadURL,
          name: file.name.split('.').slice(0, -1).join('.')
        });
        
        setUploadProgress(100);
        setTimeout(() => setUploadActive(false), 100);
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress(0);
        setUploadActive(false);
      }
    }
  };
  

  // Cleanup effect for blob URLs
  useEffect(() => {
    const currentUrl = section.imageUrl;
    
    // Load stored file info on mount
  if (!currentUrl && !window.electron) {
    const storedInfo = localStorage.getItem(`image-${section.id}`);
    if (storedInfo) {
      const fileInfo = JSON.parse(storedInfo);
      onUpdate({ ...section, imageUrl: fileInfo.url });
    }
  }
  // Reset error state when imageUrl changes
  
  
  return () => {
    if (!window.electron && currentUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(currentUrl);
      localStorage.removeItem(`image-${section.id}`);
    }
  };
}, [section.id, section.imageUrl]);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileUpload(file);
    }
  };
    
    

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 mb-2 relative h-[120px] overflow-hidden">
      {/* Show upload progress indicator */}
      {uploadActive && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="text-white">
            <div className="mb-2">Uploading... {uploadProgress}%</div>
            <div className="w-48 h-2 bg-gray-700 rounded-full">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-2 left-2 p-1.5 text-gray-600" {...dragHandleProps}>
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="absolute top-2 right-2 flex gap-1 z-10">
        <button
          onClick={() => onUpdate({ ...section, visible: section.visible === false ? true : false })}
          className="p-1.5 bg-gray-800 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
          title={section.visible === false ? "Show image" : "Hide image"}
        >
          <Eye className={`w-4 h-4 ${section.visible === false ? 'text-gray-600' : 'text-indigo-500'}`} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 bg-gray-800 hover:bg-gray-750 rounded text-gray-400 hover:text-gray-300 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 h-full">
        <div className="flex flex-col w-full h-full">
          <input
            type="text"
            value={section.name || ''}
            onChange={(e) => {
              onUpdate({ 
                ...section, 
                name: e.target.value 
              });
            }}
            className="text-base font-medium p-1 bg-gray-750 border-b border-transparent hover:border-gray-600 focus:border-gray-500 focus:outline-none text-yellow-400 ml-8"
            placeholder="Enter section title"
          />
          
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            className="hidden"
            id={`image-upload-${section.id}-${Date.now()}`}
            style={{ appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }}
          />
          
          <label
            htmlFor={`image-upload-${section.id}-${Date.now()}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className="block w-full h-full cursor-pointer"
          >
  {section.imageUrl ? (
    <img 
      src={section.imageUrl}
      alt="Uploaded image"
      className="w-full h-full object-contain"
    />
  ) : (
    <img 
      src={isDragging ? UPLOAD_ACTIVE_ICON : UPLOAD_ICON}
      alt="Upload area"
      className="w-full h-full object-contain"
    />
  )}
</label>
        </div>
      </div>
    </div>
  );
}
//Menu Editor Component
export function MenuEditor({ menuData, onUpdate, currentVersion }: MenuEditorProps) {
  // User Manual
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoSrc, setLogoSrc] = useState(logo);
  const [syncProgress, setSyncProgress] = useState<string>('');
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [editingSectionStyles, setEditingSectionStyles] = useState<string | null>(null);
  const [expandedControls, setExpandedControls] = useState<{ [key: string]: boolean }>({});
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>(() => {
    const savedState = localStorage.getItem('expandedSections');
    if (savedState) {
      try {
        return JSON.parse(savedState);
      } catch (e) {
        console.error('Error loading expanded sections state:', e);
      }
    }
    return menuData.sections.reduce((acc, section) => ({
      ...acc,
      [section.id]: true
    }), {});
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [showFindReplace, setShowFindReplace] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [newTemplate, setNewTemplate] = useState<{ s: string; a: string; z: string }>({ s: '', a: '', z: '' });
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [includeDescriptions, setIncludeDescriptions] = useState(true);
  const totalItems = menuData.sections.reduce((total, section) => total + section.items.length, 0);

  // Add this effect to save the expanded sections state to local storage
  useEffect(() => {
    localStorage.setItem('expandedSections', JSON.stringify(expandedSections));
  }, [expandedSections]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleControl = (controlId: string) => {
    setExpandedControls(prev => ({
      ...prev,
      [controlId]: !prev[controlId]
    }));
  };

  const resetSectionTypography = (sectionId: string) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? { ...section, styles: undefined }
          : section
      ),
    });
  };

  const addSection = () => {
    const newSection: MenuSection = {
      id: crypto.randomUUID(),
      name: 'New Section',
      items: [],
      showPlu: true,
      showDescriptions: true,
    };
    onUpdate({
      ...menuData,
      sections: [...menuData.sections, newSection],
    });
    setExpandedSections(prev => ({
      ...prev,
      [newSection.id]: true
    }));
  };

  const duplicateSection = (sectionId: string) => {
    const sectionToDuplicate = menuData.sections.find(section => section.id === sectionId);
    if (!sectionToDuplicate) return;

    const newSection: MenuSection = {
      ...sectionToDuplicate,
      id: crypto.randomUUID(),
      name: `${sectionToDuplicate.name} (Copy)`,
      items: sectionToDuplicate.items.map(item => ({
        ...item,
        id: crypto.randomUUID(),
        plu: generatePLU()
      }))
    };

    onUpdate({
      ...menuData,
      sections: [...menuData.sections, newSection],
    });

    setExpandedSections(prev => ({
      ...prev,
      [newSection.id]: true
    }));
  };

  const addMenuItem = (sectionId: string) => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      plu: generatePLU(),
      name: 'New Item',
      description: 'Description',
      prices: [{ price: 0 }],
    };
    
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section => 
        section.id === sectionId
          ? { ...section, items: [...section.items, newItem] }
          : section
      ),
    });
  };

  const updateSection = (sectionId: string, updates: Partial<MenuSection>) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId ? { ...section, ...updates } : section
      ),
    });
  };

  const updateSectionStyles = (sectionId: string, styles: SectionStyles) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? { ...section, styles }
          : section
      ),
    });
  };

  const updateMenuItem = (sectionId: string, itemId: string, updates: Partial<MenuItem>) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: [...section.items]
                .map(item => item.id === itemId ? { ...item, ...updates } : item)
                .sort((a, b) => {
                  const pluA = parseInt(a.plu) || Infinity;
                  const pluB = parseInt(b.plu) || Infinity;
                  return pluA - pluB;
                })
            }
          : section
      ),
    });
  };

  const addPrice = (sectionId: string, itemId: string) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? { ...item, prices: [...item.prices, { price: 0 }] }
                  : item
              ),
            }
          : section
      ),
    });
  };

  const updateItemPriceAt = (sectionId: string, itemId: string, index: number, updates: Partial<Price>) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      prices: item.prices.map((price, i) => i === index ? {
                          ...price,
                          ...updates,
                          size: updates.size?.replace('.', ',')
                        } : price
                      ),
                    }
                  : item
              ),
            }
          : section
      ),
    });
  };

  const removePrice = (sectionId: string, itemId: string, index: number) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? {
                      ...item,
                      prices: item.prices.filter((_, i) => i !== index),
                    }
                  : item
              ),
            }
          : section
      ),
    });
  };

  const moveMenuItem = (fromSectionId: string, toSectionId: string, itemId: string) => {
    const fromSection = menuData.sections.find(s => s.id === fromSectionId);
    const item = fromSection?.items.find(i => i.id === itemId);
    
    if (!fromSection || !item) return;

    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section => {
        if (section.id === fromSectionId) {
          return {
            ...section,
            items: section.items.filter(i => i.id !== itemId)
          };
        }
        if (section.id === toSectionId) {
          return {
            ...section,
            items: [...section.items, { ...item, plu: generatePLU() }]
          };
        }
        return section;
      })
    });
  };

  const deleteSection = (sectionId: string) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.filter(section => section.id !== sectionId),
    });
    setExpandedSections(prev => {
      const { [sectionId]: _, ...rest } = prev;
      return rest;
    });
    if (editingSectionStyles === sectionId) {
      setEditingSectionStyles(null);
    }
  };

  const deleteMenuItem = (sectionId: string, itemId: string) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? { ...section, items: section.items.filter(item => item.id !== itemId) }
          : section
      ),
    });
  };

  const togglePluVisibility = (sectionId: string) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? { ...section, showPlu: !section.showPlu }
          : section
      ),
    });
  };

  const toggleDescriptionVisibility = (sectionId: string) => {
    onUpdate({
      ...menuData,
      sections: menuData.sections.map(section =>
        section.id === sectionId
          ? { ...section, showDescriptions: !section.showDescriptions }
          : section
      ),
    });
  };
  const addImageSection = () => {
    const newSection = {
      id: crypto.randomUUID(),
      type: 'image',
      name: 'Image Section',
      imageUrl: '',
      items: [],
      forcePageBreak: false
    };
    onUpdate({
      ...menuData,
      sections: [...menuData.sections, newSection],
    });
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = menuData.sections.findIndex((section) => section.id === active.id);
      const newIndex = menuData.sections.findIndex((section) => section.id === over.id);

      onUpdate({
        ...menuData,
        sections: arrayMove(menuData.sections, oldIndex, newIndex),
      });
    }
  };

  const handleDownloadMenu = () => {
    const menuJson = JSON.stringify(menuData, null, 2);
    const blob = new Blob([menuJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = currentVersion?.name 
      ? `${currentVersion.name.toLowerCase().replace(/\s+/g, '-')}.json`
      : `${(menuData.restaurantName || 'menu').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;

    // Create and configure link element
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';  // Add target attribute
    link.rel = 'noopener noreferrer';  // Add security attributes
    
    // Trigger download
    if (navigator.userAgent.indexOf('Mac') !== -1) {
        // Special handling for macOS
        window.location.href = url;
    } else {
        // Standard download for other platforms
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Clean up the URL object
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 100);
};

  const handleSyncMenu = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setShowSyncModal(true);
    setSyncProgress('Initiating sync...');
  
  try {
    const response = await fetch('https://hook.eu2.make.com/4gh8h296gmdx12bzb9do6d6ll7g0cpff', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(menuData),
    });
    
    if (!response.ok) {
      throw new Error('Sync failed');
    }
    
    setSyncProgress('Processing menu data...');
    
    // The webhook will handle the response
    setTimeout(() => {
      setSyncProgress('Sync completed successfully');
      setTimeout(() => {
        setShowSyncModal(false);
        setIsSyncing(false);
      }, 1500);
    }, 2000);
    
  } catch (error) {
    console.error('Error syncing menu:', error);
    setSyncProgress('Failed to sync menu. Please try again.');
    setTimeout(() => {
      setShowSyncModal(false);
      setIsSyncing(false);
    }, 2000);
  }
};

  function handleFindReplace() {
    if (!findText) return;

    const updatedSections = menuData.sections.map(section => ({
      ...section,
      items: section.items.map(item => ({
        ...item,
        name: caseSensitive
          ? item.name.replace(new RegExp(findText, 'g'), replaceText)
          : item.name.replace(new RegExp(findText, 'gi'), replaceText),
        description: includeDescriptions
          ? (caseSensitive
            ? item.description.replace(new RegExp(findText, 'g'), replaceText)
            : item.description.replace(new RegExp(findText, 'gi'), replaceText))
          : item.description
      }))
    }));

    onUpdate({
      ...menuData,
      sections: updatedSections
    });

    setFindText('');
    setReplaceText('');
    setShowFindReplace(false);
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-700">
    <div className="p-4 border-b border-gray-700">
        
        <div className="flex justify-between items-center">
        
        <div className="flex items-center gap-2">
        <div onClick={() => setShowLogoModal(true)} className="cursor-pointer">
              <Logo logo={logo} logoHover={logoHover} />
            </div>
            <h3 className="text-lg font-light text-gray-100 mb-0 ml-3.5 leading-none">
              {menuData.restaurantName || 'Menu (no name set)'}
            </h3>
            <div>
            <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm transform -translate-y-[5px]">
            {totalItems}
      
              
      
      
    </div>

             
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadMenu}
              className="p-1.5 hover:bg-gray-750 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
              title="Download menu as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
  onClick={handleSyncMenu}
  disabled={isSyncing}
  className={`p-1.5 rounded-lg text-gray-400 transition-colors ${
    isSyncing ? 'opacity-50' : ''
  } ${isSyncing ? 'cursor-not-allowed' : 'hover:bg-gray-750 hover:text-gray-300'}`}
  title="Sync menu to Make.com"
  aria-label={isSyncing ? "Syncing menu..." : "Sync menu to Make.com"}
  aria-disabled={isSyncing}
>
  <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
</button>
            <button
              onClick={() => setShowFindReplace(true)}
              className="p-1.5 hover:bg-gray-750 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
              title="Find and replace in item titles"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-1.5 hover:bg-gray-750 rounded-lg text-gray-400 hover:text-gray-300 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {isSettingsOpen && (
                   <>           <div className="mt-4 space-y-4">
                   <div className="space-y-3">
                     <label className="block text-sm font-medium text-gray-300">
                       Restaurant Logo
                     </label>
                     <div className="flex items-center gap-4">
                       <input
                         type="file"
                         accept="image/png"
                         onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                             const reader = new FileReader();
                             reader.onload = (e) => {
                               onUpdate({
                                 ...menuData,
                                 customLogo: e.target?.result as string
                               });
                             };
                             reader.readAsDataURL(file);
                           }
                         }}
                         className="hidden"
                         id="logo-upload"
                       />
                       <label
                         htmlFor="logo-upload"
                         className="px-4 py-2 bg-gray-750 border border-gray-700 rounded-lg text-gray-300 text-sm hover:bg-gray-700 cursor-pointer"
                       >
                         Choose Logo
                       </label>
                       {menuData.customLogo && (
                         <button
                           onClick={() => onUpdate({ ...menuData, customLogo: undefined })}
                           className="text-sm text-red-400 hover:text-red-300"
                         >
                           Remove Custom Logo
                         </button>
                       )}
                     </div>
                     <p className="text-sm text-gray-500">
                       *.png, rgba 1500x800 px
                     </p>
                   </div>
                   <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Restaurant Name
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={menuData.restaurantName}
                    onChange={(e) => onUpdate({ ...menuData, restaurantName: e.target.value })}
                    className="flex-1 p-2 bg-gray-750 border border-gray-700 rounded-lg text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Restaurant Name" />
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input
                      type="checkbox"
                      checked={menuData.showRestaurantName !== false}
                      onChange={(e) => onUpdate({ ...menuData, showRestaurantName: e.target.checked })}
                      className="rounded border-gray-600 bg-gray-750 text-indigo-500 focus:ring-indigo-500" />
                    Show name
                  </label>
                </div>
              </div>
           
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Primary Font
                </label>
                <select
                  value={menuData.styles?.font || ''}
                  onChange={(e) => onUpdate({
                    ...menuData,
                    styles: { 
                      ...menuData.styles,
                      font: e.target.value,
                      fontFamily: e.target.value // Add this line to ensure compatibility
                    }
                  })}
                  className="w-full p-2 bg-gray-750 border border-gray-700 rounded-lg text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Secondary Font
                </label>
                <select
                  value={menuData.styles?.secondaryFont || ''}
                  onChange={(e) => onUpdate({
                    ...menuData,
                    styles: { 
                      ...menuData.styles,
                      secondaryFont: e.target.value
                    }
                  })}
                  className="w-full p-2 bg-gray-750 border border-gray-700 rounded-lg text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                >
                  {AVAILABLE_FONTS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
               
                    <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">S-Templates</h4>
                  <div className="space-y-2">
                  {menuData.sTemplates?.map((template) => (
                      <div key={template.id} className="flex items-center gap-2 bg-gray-750 p-2 rounded-lg">
                        <input
                          type="text"
                          value={template.s}
                          onChange={(e) => {
                            onUpdate({
                              ...menuData,
                              sTemplates: menuData.sTemplates.map(t =>
                                t.id === template.id ? { ...t, s: e.target.value } : t
                              )
                            });
                          }}
                          className="text-gray-300 text-sm bg-transparent border-none focus:ring-0 w-20"
                          placeholder="S value"
                        />
                        <span className="text-gray-400 text-sm">→</span>
                        <input
                          type="text"
                          value={template.a}
                          onChange={(e) => {
                            onUpdate({
                              ...menuData,
                              sTemplates: menuData.sTemplates.map(t =>
                                t.id === template.id ? { ...t, a: e.target.value } : t
                              )
                            });
                          }}
                          className="text-gray-300 text-sm bg-transparent border-none focus:ring-0 w-20"
                          placeholder="A value"
                        />
                        <input
                          type="text"
                          value={template.z}
                          onChange={(e) => {
                            onUpdate({
                              ...menuData,
                              sTemplates: menuData.sTemplates.map(t =>
                                t.id === template.id ? { ...t, z: e.target.value } : t
                              )
                            });
                          }}
                          className="text-gray-300 text-sm bg-transparent border-none focus:ring-0 w-20"
                          placeholder="Z value"
                        />
                        <button
                          onClick={() => {
                            onUpdate({
                              ...menuData,
                              sTemplates: menuData.sTemplates.filter(t => t.id !== template.id)
                            });
                          }}
                          className="ml-auto p-1 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      <button
                       onClick={() => {
                        const updatedSections = menuData.sections.map(section => ({
                          ...section,
                          items: section.items.map(item => {
                            // Find matching template by s value first
                            const template = menuData.sTemplates?.find(t => t.s === item.s);
                            if (template) {
                              return {
                                ...item,
                                a: template.a || item.a,
                                z: template.z || item.z
                              };
                            }
                            // If no match by s, try matching by a and z
                            const templateByAZ = menuData.sTemplates?.find(t => 
                              t.a === item.a && t.z === item.z
                            );
                            return templateByAZ 
                              ? { ...item, s: templateByAZ.s }
                              : item;
                          })
                        }));
                        onUpdate({
                          ...menuData,
                          sections: updatedSections
                        });
                      }}
                      className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
                      title="Refresh all values based on templates"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newTemplate.s}
                        onChange={(e) => setNewTemplate({ ...newTemplate, s: e.target.value })}
                        placeholder="S value"
                        className="flex-1 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm"
                      />
                      <input
                        type="text"
                        value={newTemplate.a}
                        onChange={(e) => setNewTemplate({ ...newTemplate, a: e.target.value })}
                        placeholder="A value"
                        className="flex-1 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm"
                      />
                      <input
                        type="text"
                        value={newTemplate.z}
                        onChange={(e) => setNewTemplate({ ...newTemplate, z: e.target.value })}
                        placeholder="Z value"
                        className="flex-1 p-1.5 bg-gray-750 border border-gray-700 rounded text-gray-300 text-sm"
                      />
                      <button
                        onClick={() => {
                          if (newTemplate.s && (newTemplate.a || newTemplate.z)) {
                            onUpdate({
                              ...menuData,
                              sTemplates: [
                                ...(menuData.sTemplates || []),
                                { ...newTemplate, id: crypto.randomUUID() }
                              ]
                            });
                            setNewTemplate({ s: '', a: '', z: '' });
                          }
                        }}
                        className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-gray-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <TypographyControl
                    label="Section Titles"
                    fontSize={menuData.styles.sectionTitle.fontSize}
                    fontWeight={menuData.styles.sectionTitle.fontWeight}
                    lineHeight={menuData.styles.sectionTitle.lineHeight}
                    letterSpacing={menuData.styles.sectionTitle.letterSpacing}
                    transform={menuData.styles.sectionTitle.transform}
                    onUpdate={(fontSize, fontWeight, lineHeight, letterSpacing, transform) => onUpdate({
                      ...menuData,
                      styles: {
                        ...menuData.styles,
                        sectionTitle: { fontSize, fontWeight, lineHeight, letterSpacing, transform }
                      }
                    })} />
                  <TypographyControl
                    label="PLU Numbers"
                    fontSize={menuData.styles.plu.fontSize}
                    onUpdate={(fontSize) => onUpdate({
                      ...menuData,
                      styles: {
                        ...menuData.styles,
                        plu: {
                          fontSize,
                          fontWeight: '',
                          lineHeight: '',
                          letterSpacing: ''
                        }
                      }
                    })} fontWeight={''} lineHeight={''} letterSpacing={''} />
                  <TypographyControl
                    label="Item Names"
                    fontSize={menuData.styles.itemName.fontSize}
                    fontWeight={menuData.styles.itemName.fontWeight}
                    lineHeight={menuData.styles.itemName.lineHeight}
                    letterSpacing={menuData.styles.itemName.letterSpacing}
                    transform={menuData.styles.itemName.transform}
                    onUpdate={(fontSize, fontWeight, lineHeight, letterSpacing, transform) => onUpdate({
                      ...menuData,
                      styles: {
                        ...menuData.styles,
                        itemName: { 
                          fontSize, 
                          fontWeight, 
                          lineHeight, 
                          letterSpacing, 
                          transform,
                          fontFamily: menuData.styles.secondaryFont || menuData.styles.font // Use secondary font if available, otherwise use primary font
                        }
                      }
                    })} />
                  <TypographyControl
                    label="Descriptions"
                    fontSize={menuData.styles.description.fontSize}
                    fontWeight={menuData.styles.description.fontWeight}
                    lineHeight={menuData.styles.description.lineHeight}
                    letterSpacing={menuData.styles.description.letterSpacing}
                    transform={menuData.styles.description.transform}
                    onUpdate={(fontSize, fontWeight, lineHeight, letterSpacing, transform) => onUpdate({
                      ...menuData,
                      styles: {
                        ...menuData.styles,
                        description: { fontSize, fontWeight, lineHeight, letterSpacing, transform }
                      }
                    })} />
                  <TypographyControl
                    label="Prices"
                    fontSize={menuData.styles.price.fontSize}
                    fontWeight={menuData.styles.price.fontWeight}
                    letterSpacing={menuData.styles.price.letterSpacing}
                    onUpdate={(fontSize, fontWeight, letterSpacing) => onUpdate({
                      ...menuData,
                      styles: {
                        ...menuData.styles,
                        price: {
                          fontSize, fontWeight, letterSpacing,
                          lineHeight: ''
                        }
                      }
                    })} lineHeight={''} />
                </div>
              </div>
            </div></>
        )}

        {showFindReplace && (
          <div className="mt-4 p-4 bg-gray-850 rounded-lg space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Find</label>
              <input
                type="text"
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-full p-2 bg-gray-750 border border-gray-700 rounded-lg text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Text to find"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Replace with</label>
              <input
                type="text"
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full p-2 bg-gray-750 border border-gray-700 rounded-lg text-gray-300 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                placeholder="Replacement text"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="caseSensitive"
                  checked={caseSensitive}
                  onChange={(e) => setCaseSensitive(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-750 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="caseSensitive" className="text-sm text-gray-300">
                  Case sensitive
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeDescriptions"
                  checked={includeDescriptions}
                  onChange={(e) => setIncludeDescriptions(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-750 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="includeDescriptions" className="text-sm text-gray-300">
                  Include descriptions
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFindReplace(false)}
                className="px-3 py-1.5 text-gray-300 hover:bg-gray-750 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleFindReplace}
                disabled={!findText}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Replace All
              </button>
            </div>
          </div>
        )}

{showLogoModal && createPortal(
  <div 
  className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4" 
  style={{ zIndex: 99999 }}
  onClick={() => setShowLogoModal(false)}
>
      <div className="bg-gray-200 rounded-lg p-8 w-[600px]">
      <h3 className="text-lg font-light text-gray-600 mb-4">User Manual SouvlakiBoard</h3>
      <div className="space-y-4">
        <div className="flex justify-center mb-6 shadow-lg">
          <img 
            src="src/assets/sb-1.gif" 
            alt="Tutorial"
            className="rounded-lg w-full max-w-[500px] h-auto"
          />
        </div>
        
      </div>
      
    </div>
  </div>,
  document.body
)}

{showSyncModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-gray-800 rounded-lg p-6 w-96">
      <h3 className="text-lg font-medium text-gray-300 mb-4 text-center">Syncing Menu</h3>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3 text-gray-300">
          <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
          <p>{syncProgress}</p>
        </div>
        <p className="text-sm text-gray-400 text-center">
          Your menu is being synchronized with Make.com. This may take a few moments...
        </p>
      </div>
    </div>
  </div>
)}

<div className="mt-4 space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={menuData.sections.map(section => section.id)}
            strategy={verticalListSortingStrategy}
          >
            {menuData.sections.map((section) => (
              section.type === 'image' ? (
    <SortableImageSection
      key={section.id}
      section={section}
      onUpdate={(updatedSection) => updateSection(section.id, updatedSection)}
      onDelete={() => deleteSection(section.id)}
    />
  ) : (
    <SortableSection
      key={section.id}
      section={section}
      menuData={menuData}
                  expandedSections={expandedSections}
                  expandedControls={expandedControls}
                  editingSectionStyles={editingSectionStyles}
                  toggleSection={(sectionId: string) => {
                    setExpandedSections(prev => ({
                      ...prev,
                      [sectionId]: !prev[sectionId]
                    }));
                  }}
      toggleControl={toggleControl}
      updateSection={updateSection}
      updateSectionStyles={updateSectionStyles}
      togglePluVisibility={togglePluVisibility}
      toggleDescriptionVisibility={toggleDescriptionVisibility}
      setEditingSectionStyles={setEditingSectionStyles}
      addMenuItem={addMenuItem}
      deleteSection={deleteSection}
      duplicateSection={duplicateSection}
      updateMenuItem={updateMenuItem}
      addPrice={addPrice}
      updateItemPriceAt={updateItemPriceAt}
      removePrice={removePrice}
      deleteMenuItem={deleteMenuItem}
      resetSectionTypography={resetSectionTypography}
      moveMenuItem={moveMenuItem}
    />
  )
))}
            </SortableContext>
          </DndContext>

          <button
            onClick={addSection}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" /> Add Section
          </button>
          <button
      onClick={addImageSection}
      className="w-full p-2 bg-gray-800 hover:bg-gray-750 rounded-lg text-gray-400 hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
    >
      <Plus className="w-4 h-4" />
      <span>Add Image Section</span>
    </button>
        </div>
      </div>
    </div>
  );
}
