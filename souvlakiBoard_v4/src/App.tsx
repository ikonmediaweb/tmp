import { Flame } from 'lucide-react';
import { ref, uploadString, getDownloadURL, listAll, deleteObject, getBytes } from "firebase/storage";
import { storage } from "./firebaseConfig";
import React, { useRef, useState, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { MenuEditor } from './components/MenuEditor';
import { PrintableMenu } from './components/PrintableMenu';
import { MenuData, RawMenuData } from './types';
import { Printer, FileJson, X, Undo, Redo, Plus, ChevronDown, Copy} from 'lucide-react';

// Then modify your handleDownloadMenu function:
const handleDownloadMenu = async () => {
  const menuJson = JSON.stringify(menuData, null, 2);
  const filename = currentVersion?.name 
    ? `${currentVersion.name.toLowerCase().replace(/\s+/g, '-')}.json`
    : `${(menuData.restaurantName || 'menu').toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;

  try {
    // Upload to Firebase Storage
    const storageRef = ref(storage, `menus/${filename}`);
    await uploadString(storageRef, menuJson, 'raw');
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    
    // Create a link to download the file
    const link = document.createElement('a');
    link.href = downloadURL;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Show success message
    alert(`Menu saved to cloud storage. You can access it at: ${downloadURL}`);
    
  } catch (error) {
    console.error('Error saving to Firebase:', error);
    alert('Failed to save to cloud storage. Check console for details.');
    
    // Fall back to local download
    const blob = new Blob([menuJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  }
};

const listSavedMenus = async () => {
  try {
    const listRef = ref(storage, 'menus');
    const { items } = await listAll(listRef);
    
    const menuFiles = await Promise.all(
      items.map(async (item) => {
        const url = await getDownloadURL(item);
        return {
          name: item.name,
          url: url,
          fullPath: item.fullPath
        };
      })
    );
    
    return menuFiles;
  } catch (error) {
    console.error('Error listing saved menus:', error);
    return [];
  }
};


const defaultStyles = {
  font: '',
  sectionTitle: {
    fontSize: 'text-xl',
    fontWeight: 'font-semibold',
    lineHeight: 'leading-normal',
    letterSpacing: 'tracking-normal',
    transform: ''
  },
  plu: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    lineHeight: 'leading-normal',
    letterSpacing: 'tracking-normal',
    transform: ''
  },
  itemName: {
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
    letterSpacing: 'tracking-normal',
    transform: ''
  },
  description: {
    fontSize: 'text-sm',
    fontWeight: 'font-normal',
    lineHeight: 'leading-normal',
    letterSpacing: 'tracking-normal',
    transform: ''
  },
  price: {
    fontSize: 'text-base',
    fontWeight: 'font-medium',
    lineHeight: 'leading-normal',
    letterSpacing: 'tracking-normal',
    transform: ''
  },
  letterA: {
    fontSize: '24pt'
  }
};

let pluCounter = 1000;

function generatePLU(): string {
  return (pluCounter++).toString();
}

// Add this function after the generatePLU function
const findDuplicatePLUs = (sections: MenuData['sections']) => {
  const pluCounts = new Map<string, number>();
  sections.forEach(section => {
    section.items.forEach(item => {
      if (item.plu) {
        pluCounts.set(item.plu, (pluCounts.get(item.plu) || 0) + 1);
      }
    });
  });
  return new Set([...pluCounts.entries()]
    .filter(([_, count]) => count > 1)
    .map(([plu]) => plu));
};

function transformRawMenuData(data: RawMenuData): MenuData {
  return {
    background: '',
    styles: defaultStyles,
    restaurantName: 'Restaurant Menu',
    showRestaurantName: true,
    sections: Object.entries(data).map(([sectionName, items]) => ({
      id: crypto.randomUUID(),
      type: 'regular',
      name: sectionName,
      showPlu: true,
      items: items.map(item => ({
        id: crypto.randomUUID(),
        plu: item.plu || generatePLU(),
        name: item.article.trim(),
        description: item.description.trim() || 'Klassischer Spirituose aus traditioneller Herstellung',
        prices: item.prices,
      })),
    }))
  };
}

interface SavedVersion {
  name: string;
  data: MenuData;
  timestamp: number;
}

function App() {
    const [menuData, setMenuData] = useState<MenuData>(() => {
      // Default initial state
      return {
        styles: defaultStyles,
        restaurantName: 'New Restaurant',
        showRestaurantName: true,
        sTemplates: [],
        sections: []
      };
    });

  // Load menu data from Firebase on component mount
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        const menuRef = ref(storage, 'current-menu/menu-data.json');
        const bytes = await getBytes(menuRef);
        const text = new TextDecoder().decode(bytes);
        const parsed = JSON.parse(text);
        setMenuData({
          ...parsed,
          styles: { ...defaultStyles, ...parsed.styles },
        });
      } catch (e) {
        console.error('Error loading menu data from Firebase:', e);
        // If Firebase fails, try to load from localStorage as fallback
        const savedData = localStorage.getItem('menuData');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            setMenuData({
              ...parsed,
              styles: { ...defaultStyles, ...parsed.styles },
            });
          } catch (e) {
            console.error('Error loading saved menu data:', e);
          }
        }
        
        // Create the file in Firebase if it doesn't exist
        if (e.code === 'storage/object-not-found') {
          try {
            // Save current default state to Firebase
            const menuRef = ref(storage, 'current-menu/menu-data.json');
            await uploadString(menuRef, JSON.stringify(menuData), 'raw');
            console.log('Created initial menu data in Firebase');
          } catch (saveError) {
            console.error('Failed to create initial menu data in Firebase:', saveError);
          }
        }
      }
    };
    
    loadMenuData();
  }, []);

  const [savedVersions, setSavedVersions] = useState<SavedVersion[]>(() => {
    const saved = localStorage.getItem('savedVersions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved versions:', e);
        return [];
      }
    }
    return [];
  });

  const [currentVersion, setCurrentVersion] = useState<SavedVersion | null>(null);
  const [showVersionInput, setShowVersionInput] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [showVersions, setShowVersions] = useState(false);
  const [history, setHistory] = useState<MenuData[]>([menuData]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [jsonInput, setJsonInput] = useState('');
  const [jsonError, setJsonError] = useState('');
  const versionInputRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncMenu = async () => {
    if (isSyncing) return;
    
    // Create array of individual items
    const items = [];
    
    for (const section of menuData.sections) {
      for (const item of section.items) {
        items.push({
          id: item.id,
          'item-name': item.name,
          description: item.description,
          plu: item.plu,
          'section-name': section.name,
          prizes_array: item.prices.map(p => p.price),
          sizes_array: item.prices.map(p => p.size || ''),
          a_array: [item.a || ''],
          z_array: [item.z || '']
        });
      }
    }
    
    setIsSyncing(true);
    try {
      const response = await fetch('https://hook.eu2.make.com/4gh8h296gmdx12bzb9do6d6ll7g0cpff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(items),
      });
      
      if (!response.ok) {
        throw new Error('Sync failed');
      }
     } catch (error) {
      console.error('Sync failed:', error);
     } finally {
       setIsSyncing(false);
     }
  };
  useEffect(() => {
    if (showVersionInput && versionInputRef.current) {
      versionInputRef.current.focus();
    }
  }, [showVersionInput]);
  
  useEffect(() => {
    loadVersionsFromFirebase();
  }, []);

  useEffect(() => {
    localStorage.setItem('savedVersions', JSON.stringify(savedVersions));
  }, [savedVersions]);

  useEffect(() => {
    if (JSON.stringify(history[currentIndex]) !== JSON.stringify(menuData)) {
      const newHistory = history.slice(0, currentIndex + 1);
      newHistory.push(menuData);
      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);
      saveMenuData();
    }
  }, [menuData]);

  // Add the saveMenuData function here
  const saveMenuData = async () => {
    try {
      const menuRef = ref(storage, 'current-menu/menu-data.json');
      await uploadString(menuRef, JSON.stringify(menuData), 'raw');
      // Also save to localStorage as backup
      localStorage.setItem('menuData', JSON.stringify(menuData));
    } catch (error) {
      console.error('Error saving menu data to Firebase:', error);
      // Fallback to localStorage
      localStorage.setItem('menuData', JSON.stringify(menuData));
    }
  };

  // Add the saveVersion function here
  const saveVersion = async () => {
    if (!versionName.trim()) return;
  
    const newVersion: SavedVersion = {
      name: versionName.trim(),
      data: menuData,
      timestamp: Date.now()
    };
  
    try {
      // Upload version to Firebase Storage
      const storageRef = ref(storage, `versions/${newVersion.timestamp}_${newVersion.name}.json`);
      await uploadString(storageRef, JSON.stringify(newVersion), 'raw');
      
      // Update local state
      setSavedVersions(prev => [...prev, newVersion]);
      setCurrentVersion(newVersion);
      setVersionName('');
      setShowVersionInput(false);
    } catch (error) {
      console.error('Error saving version:', error);
      alert('Failed to save version. Please try again.');
    }
  };

  const loadVersionsFromFirebase = async () => {
    try {
      const versionsRef = ref(storage, 'versions');
      const { items } = await listAll(versionsRef);
      
      const processedFiles = new Set();
      
      const versions = await Promise.all(
        items.map(async (item) => {
          try {
            const fileName = decodeURIComponent(item.name);
            if (processedFiles.has(fileName)) {
              return null;
            }
            processedFiles.add(fileName);

            const bytes = await getBytes(item);
            const text = new TextDecoder().decode(bytes);
            const version = JSON.parse(text);
            
            return version as SavedVersion;
          } catch (itemError) {
            console.error(`Error loading version ${item.name}:`, itemError);
            return null;
          }
        })
      );
      
      const validVersions = versions
        .filter((v): v is SavedVersion => v !== null)
        .sort((a, b) => b.timestamp - a.timestamp);
      
      setSavedVersions(validVersions);
    } catch (error) {
      console.error('Error loading versions:', error);
      setSavedVersions([]);
    }
  };

  const loadVersion = (version: SavedVersion) => {
    if (version) {
      setMenuData(version.data);
      setCurrentVersion(version);
      setShowVersions(false);
    }
  };
  
  const deleteVersion = async (timestamp: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const versionToDelete = savedVersions.find(v => v.timestamp === timestamp);
      if (versionToDelete) {
        const storageRef = ref(storage, `versions/${timestamp}_${versionToDelete.name}.json`);
        await deleteObject(storageRef);
        
        setSavedVersions(prev => {
          const newVersions = prev.filter(v => v.timestamp !== timestamp);
          if (currentVersion?.timestamp === timestamp) {
            setCurrentVersion(null);
          }
          return newVersions;
        });
      }
    } catch (error) {
      console.error('Error deleting version:', error);
      alert('Failed to delete version. Please try again.');
    }
  };

  const handleUndo = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setMenuData(history[currentIndex - 1]);
    }
  };

  const handleRedo = () => {
    if (currentIndex < history.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setMenuData(history[currentIndex + 1]);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true
  });

  const cleanJsonInput = (input: string): string => {
    return input
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/\n/g, ' ')
      .replace(/\r/g, ' ')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/"{2,}/g, '"')
      .replace(/,\s*}/g, '}')
      .replace(/,\s*]/g, ']')
      .replace(/([{,]\s*)(['"])?([a-zA-Z0-9_]+)(['"])?\s*:/g, '$1"$3":')
      .trim();
  };

  const handleJsonPaste = () => {
    if (!jsonInput.trim()) {
      setJsonError('Please enter some JSON data');
      return;
    }

    try {
      let parsedJson;
      try {
        parsedJson = JSON.parse(jsonInput);
      } catch (e) {
        const cleanedInput = cleanJsonInput(jsonInput);
        try {
          parsedJson = JSON.parse(cleanedInput);
        } catch (innerError) {
          const fixedInput = cleanedInput
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
            .replace(/'/g, '"')
            .replace(/,(\s*[}\]])/g, '$1');
          try {
            parsedJson = JSON.parse(fixedInput);
          } catch (finalError) {
            throw new Error('Could not parse JSON after multiple attempts');
          }
        }
      }

      const result = processMenuData(parsedJson);
      if (result === true) {
        setJsonError('');
        setShowPasteModal(false);
        setJsonInput('');
      } else {
        setJsonError(result);
      }
    } catch (error) {
      console.error('JSON Parse Error:', error);
      setJsonError(
        'Invalid JSON format.'
      );
    }
  };

  const processMenuData = (data: any) => {
    const validation = { isValid: true, error: '' }; // Default validation assuming data is valid
    if (validation.isValid) {
      if (!data.restaurantName) {
        setMenuData(transformRawMenuData(data));
      } else {
        if (!data.styles) {
          data.styles = defaultStyles;
        }
        setMenuData(data);
      }
      return true;
    }
    return validation.error;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const result = processMenuData(json);
          if (result !== true) {
            alert(result);
          }
        } catch (error) {
          alert('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleExampleJson = () => {
    const exampleJson = {
      "Kalte Vorspeisen": [
        {
          "plu": "1",
          "article": "Zaziki",
          "description": "Cremiger Joghurt mit frischen Gurken und aromatischem Knoblauch",
          "prices": [
            {
              "price": 6
            }
          ]
        }
      ]
    };
    setJsonInput(JSON.stringify(exampleJson, null, 2));
  };

  return (
    <>
      <div className="min-h-screen bg-white">
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleUndo}
                  disabled={currentIndex === 0}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentIndex === 0 
                      ? 'text-gray-300 cursor-not-allowed' 
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Undo className="w-4 h-4" />
                </button>
                <button
                  onClick={handleRedo}
                  disabled={currentIndex === history.length - 1}
                  className={`p-1.5 rounded-lg transition-colors ${
                    currentIndex === history.length - 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Redo className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowVersionInput(true)}
                  className="p-1.5 rounded-lg text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex gap-3">
            <div 
    className="flex items-center px-2 text-orange-500" 
    title="Firebase storage connected"
  >
    <Flame className="w-4 h-4" />
  </div>
              
              <div className="relative">
                <div className="flex">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(menuData, null, 2));
                    }}
                    className="px-3 py-2 bg-white text-gray-600 border border-gray-200 rounded-l-lg hover:border-gray-300 hover:text-gray-800 transition-colors"
                    title="copy current state into clipboard"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowVersions(!showVersions)}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 border border-l-0 border-gray-200 rounded-r-lg hover:border-gray-300 hover:text-gray-800 transition-colors text-sm min-w-[120px]"
                  >
                    <span className="truncate">{currentVersion ? currentVersion.name : 'Unsaved version'}</span>
                    <ChevronDown className="w-4 h-4 flex-shrink-0" />
                  </button>
                </div>
                {showVersions && savedVersions.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    {savedVersions.map((version) => (
                      <div
                        key={version.timestamp}
                        onClick={() => loadVersion(version)}
                        className={`flex items-center justify-between px-3 py-2 hover:bg-gray-50 cursor-pointer ${
                          currentVersion?.timestamp === version.timestamp ? 'bg-gray-50' : ''
                        }`}
                      >
                        <span className="text-sm text-gray-700">{version.name}</span>
                        <button
                          onClick={(e) => deleteVersion(version.timestamp, e)}
                          className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowPasteModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:border-gray-300 hover:text-gray-800 transition-colors text-sm"
              >
                <FileJson className="w-4 h-4" />
                Paste
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                Preview
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-6 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(600px,1fr)_1.5fr] gap-8">
          <div className="lg:sticky lg:top-[5.5rem] lg:h-[calc(100vh-7rem)] overflow-y-auto">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <MenuEditor
                menuData={menuData}
                onUpdate={setMenuData}
                currentVersion={currentVersion}
                duplicatePLUs={findDuplicatePLUs(menuData.sections)}
              />
            </div>
          </div>
          <div className="hidden lg:block bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <PrintableMenu ref={printRef} data={menuData} />
          </div>
        </div>
      </div>

      {showVersionInput && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Save Version</h3>
            <input
              ref={versionInputRef}
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              placeholder="Enter version name"
              className="w-full p-2 border border-gray-300 rounded-lg mb-4"
              onKeyDown={(e) => {
                if (e.key === 'Enter') saveVersion();
                if (e.key === 'Escape') {
                  setShowVersionInput(false);
                  setVersionName('');
                }
              }}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowVersionInput(false);
                  setVersionName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveVersion}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Paste JSON Data</h2>
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setJsonInput('');
                  setJsonError('');
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-4">
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-64 p-4 border rounded-lg font-mono text-sm resize-none"
                placeholder="Paste your JSON data here..."
              />
              <button
                onClick={handleExampleJson}
                className="mt-2 text-sm text-blue-500 hover:text-blue-600"
              >
                Load example format
              </button>
            </div>
            {jsonError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg whitespace-pre-line">
                <p className="text-red-600 text-sm">{jsonError}</p>
              </div>
            )}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowPasteModal(false);
                  setJsonInput('');
                  setJsonError('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleJsonPaste}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>

    </>
  );
};   


export default App;