import React, { useEffect, useRef, useState } from 'react';
import { MenuData, AVAILABLE_FONTS, SectionStyles } from '../types';
import { ReactSVG } from 'react-svg';

interface PrintableMenuProps {
  data: MenuData;
}

const PrintableMenu = React.forwardRef<HTMLDivElement, PrintableMenuProps>(({ data }, ref) => {
    const rootRef = useRef<HTMLDivElement>(null);
    // Fix: Remove the empty state declaration

    // Sync the forwarded ref with our internal ref
    useEffect(() => {
      if (!ref) return;
      
      if (typeof ref === 'function') {
        ref(rootRef.current);
      } else {
        ref.current = rootRef.current;
      }
    }, [ref]);

    useEffect(() => {
      // Load fonts when they change
      const loadFonts = () => {
        try {
          const primaryFont = AVAILABLE_FONTS.find(f => f.value === (data.styles.primaryFont || data.styles.font));
          const secondaryFont = AVAILABLE_FONTS.find(f => f.value === data.styles.secondaryFont);
        
          const loadFont = (font: typeof AVAILABLE_FONTS[number]) => {
            if (font?.url && !document.querySelector(`link[href="${font.url}"]`)) {
              const link = document.createElement('link');
              link.href = font.url;
              link.rel = 'stylesheet';
              document.head.appendChild(link);
            }
          };

          if (primaryFont) loadFont(primaryFont);
          if (secondaryFont) loadFont(secondaryFont);
        } catch (error) {
          console.error('Error loading fonts:', error);
        }
      };

      loadFonts();
    }, [data.styles.primaryFont, data.styles.secondaryFont, data.styles.font]);


    useEffect(() => {
      // Remove the entire addPageBreakIndicators functionality
      return () => {
        // Clean up only - no page break indicators to add
      };
    }, [data]);


    const sortedSections = data.sections.map(section => {
      if (section.type === 'regular') {
        return {
          ...section,
          items: [...section.items].sort((a, b) => {
            const pluA = parseInt(a.plu) || Infinity;
            const pluB = parseInt(b.plu) || Infinity;
            return pluA - pluB;
          })
        };
      }
      return section;
    });

    const formatSize = (size: string | undefined) => {
      if (!size) return '';
      return size.replace('.', ',');
    };

    const mergeTypography = (sectionStyle: any, globalStyle: any) => {
      if (!sectionStyle) return globalStyle;
      return {
        fontSize: sectionStyle.fontSize || globalStyle.fontSize,
        fontWeight: sectionStyle.fontWeight || globalStyle.fontWeight,
        lineHeight: sectionStyle.lineHeight || globalStyle.lineHeight,
        letterSpacing: sectionStyle.letterSpacing || globalStyle.letterSpacing,
        transform: sectionStyle.transform || globalStyle.transform,
        fontFamily: sectionStyle.fontFamily || globalStyle.fontFamily
      };
    };

    const processText = (text: string): React.ReactNode[] => {
      if (!text) return [];
      
      // Process the text without handling newlines
      return processTextContent(text);
    };
    
    const processTextContent = (text: string): React.ReactNode[] => {
      if (!text) return [];
      
      const parts: React.ReactNode[] = [];
      let currentText = text;  
      while (currentText.length > 0) {
        // Check for asterisks and brackets
        const singleAsteriskStart = currentText.indexOf('*');
        const doubleAsteriskStart = currentText.indexOf('**');
        const singleBracketStart = currentText.indexOf('[');
        
        if (doubleAsteriskStart === -1 && singleBracketStart === -1 && singleAsteriskStart === -1) {
          parts.push(currentText);
          break;
        }
        if (singleAsteriskStart === 0 || (singleAsteriskStart !== -1 && 
          (doubleAsteriskStart === -1 || singleAsteriskStart < doubleAsteriskStart) && 
          (singleBracketStart === -1 || singleAsteriskStart < singleBracketStart))) {
        
        if (singleAsteriskStart > 0) {
          parts.push(currentText.substring(0, singleAsteriskStart));
        }
        
        const singleAsteriskEnd = currentText.indexOf('*', singleAsteriskStart + 1);
        if (singleAsteriskEnd === -1) {
          parts.push(currentText);
          break;
        }
        
        const boldContent = currentText.substring(singleAsteriskStart + 1, singleAsteriskEnd);
        if (boldContent) {
          parts.push(
            <span key={`bold-${singleAsteriskStart}-${boldContent}`} className="font-bold">
              {boldContent}
            </span>
          );
        }
        currentText = currentText.substring(singleAsteriskEnd + 1);
        continue;
      }
        
        if (doubleAsteriskStart === 0 || (doubleAsteriskStart !== -1 && (singleBracketStart === -1 || doubleAsteriskStart < singleBracketStart))) {
          // Add text before double asterisks
          if (doubleAsteriskStart > 0) {
            parts.push(currentText.substring(0, doubleAsteriskStart));
          }
          
          // Handle double asterisks
          const doubleAsteriskEnd = currentText.indexOf('**', doubleAsteriskStart + 2);
          if (doubleAsteriskEnd === -1) {
            parts.push(currentText);
            break;
          }
          
          const asteriskContent = currentText.substring(doubleAsteriskStart + 2, doubleAsteriskEnd);
          if (asteriskContent) {
            parts.push(
              <span key={`double-${doubleAsteriskStart}-${asteriskContent}`} className="text-[#949bab] font-light subpixel-antialiased">
                {asteriskContent}
              </span>
            );
          }
          currentText = currentText.substring(doubleAsteriskEnd + 2);
        } else {
          // Handle single brackets (existing superscript style)
          if (singleBracketStart > 0) {
            parts.push(currentText.substring(0, singleBracketStart));
          }
          
          const bracketEnd = currentText.indexOf(']', singleBracketStart);
          if (bracketEnd === -1) {
            parts.push(currentText.substring(singleBracketStart));
            break;
          }
          
          const bracketContent = currentText.substring(singleBracketStart + 1, bracketEnd);
          if (bracketContent) {
            parts.push(
              <span key={`single-${singleBracketStart}-${bracketContent}`} className="text-gray-800 text-[0.75em] align-super">
                {bracketContent}
              </span>
            );
          }
          currentText = currentText.substring(bracketEnd + 1);
        }
      }
      
      return parts.length > 0 ? parts : [text];
    };

    return (
      <div 
        ref={rootRef}
        className=""
        style={{
          backgroundColor: '#eff0f1'
        }}
      >
        <div className="z-10" style={{ backgroundColor: '#eff0f1' }}>
          

          {/* Add logo position after cover page */}
          {data.customLogo && (
            <div className="fixed top-[0cm] right-[0cm] w-[600px] h-auto print:fixed print:top-[0cm] print:right-[0cm] no-break">
              {/* Logo */}
              {data.customLogo && (
                <div className="logo-container w-[600px] h-auto">
                  <img 
                    src={data.customLogo}
                    alt="Restaurant Logo" 
                    className="w-auto h-auto object-contain print:break-inside-avoid"
                    style={{
                      pageBreakInside: 'avoid',
                      breakInside: 'avoid'
                    }}
                  />
                </div>
              )}
            </div>
          )}

<div className="" style={{ backgroundColor: '#eff0f1' }}>
{sortedSections.map((section) => {
              // Handle image section type
              // Update the image section handling
              if (section.type === 'image') {
                const isSvg = section.imageUrl?.toLowerCase().endsWith('.svg');
                const isPdf = section.imageUrl?.toLowerCase().endsWith('.pdf');
                
                // Check URL type
                const isHttpUrl = section.imageUrl?.startsWith('http');
                const isDataUrl = section.imageUrl?.startsWith('data:');
                const isFilePath = !isHttpUrl && !isDataUrl && section.imageUrl;
                
                // Prepare the source URL
                const getSourceUrl = (url: string | undefined) => {
                  if (!url) return '';
                  
                  // Skip placeholder SVG data URLs that are used as upload indicators
                  if (url.startsWith('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQi')) {
                    return ''; // Return empty string for placeholder icons
                  }
                  
                  // Handle different URL types
                  if (url.startsWith('http://') || url.startsWith('https://')) return url;
                  if (url.startsWith('data:')) return url;
                  if (url.startsWith('blob:')) {
                    // For blob URLs, we need to ensure they're still valid
                    try {
                      new URL(url);
                      return url;
                    } catch (e) {
                      console.error('Invalid blob URL:', url);
                      return '';
                    }
                  }
                  
                  // For file paths, ensure proper formatting
                  return `file:///${url.replace(/\\/g, '/')}`;
                };
                
                // Skip rendering if the image URL is a placeholder or empty
                if (!section.imageUrl || section.imageUrl.startsWith('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQi')) {
                  return null; // Don't render placeholder icons in print view
                }
                
                // Get the image source URL once to avoid inconsistencies
                const imageSourceUrl = getSourceUrl(section.imageUrl);
                
                // Skip rendering if we couldn't get a valid URL
                if (!imageSourceUrl) {
                  return null;
                }
                
                // Check if section is visible
                if (section.visible === false) {
                  return null; // Don't render hidden sections
                }
                
                return (
                  <div 
                  key={section.id} 
                  id={`menu-section-${section.id}`} 
                  className={`${section.forcePageBreak ? 'force-page-break' : ''} break-inside-avoid-page`}
                  style={{
                    pageBreakBefore: section.forcePageBreak ? 'always' : 'auto',
                    breakBefore: section.forcePageBreak ? 'page' : 'auto',
                    breakInside: 'avoid-page',
                    pageBreakInside: 'avoid',
                    margin: '0',           // Remove all margins
                    padding: '0',          // Remove all padding
                    height: '100vh',
                    width: '100%',
                    position: 'relative'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center absolute inset-0">
                    {isSvg ? (
                      <ReactSVG
                        src={imageSourceUrl}
                        beforeInjection={(svg) => {
                          svg.setAttribute('style', 'width: 100%; height: 100vh; display: block;');
                          svg.classList.add('svg-image');
                        }}
                          fallback={() => <span className="error-message p-4 text-red-500">Error loading SVG</span>}
                          loading={() => <span className="loading-message">Loading SVG...</span>}
                          wrapper="div"
                          className="svg-wrapper w-full h-full"
                          evalScripts="never"
                          renumerateIRIElements={false}
                          useRequestCache={true}
                        />
                      ) : (
                        <div className="image-container w-full h-full flex items-center justify-center">
                          <img 
                            src={imageSourceUrl}
                            alt={section.name || "Menu image"}
                            className="max-w-full max-h-full object-contain"
                            style={{
                              imageRendering: 'auto',
                              WebkitPrintColorAdjust: 'exact',
                              printColorAdjust: 'exact'
                            }}
                            loading="eager"
                            decoding="sync"
                            onError={(e) => {
                              console.error("Error loading image:", section.imageUrl);
                              const img = e.currentTarget;
                              img.style.display = 'none';
                              
                              const errorDiv = document.createElement('div');
                              errorDiv.className = 'error-message p-4 bg-red-100 text-red-700 rounded-lg';
                              errorDiv.textContent = `Error loading image`;
                              
                              if (img.parentElement) {
                                img.parentElement.appendChild(errorDiv);
                              }
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              

              // Regular section rendering
              const sectionTitleStyle = mergeTypography(section.styles?.sectionTitle, data.styles.sectionTitle);
              const pluStyle = mergeTypography(section.styles?.plu, data.styles.plu);
              const itemNameStyle = mergeTypography(section.styles?.itemName, data.styles.itemName);
              const descriptionStyle = mergeTypography(section.styles?.description, data.styles.description);
              const priceStyle = mergeTypography(section.styles?.price, data.styles.price);

              return (
                <div 
                  key={section.id} 
                  id={`menu-section-${section.id}`} 
                  className={`${section.forcePageBreak ? 'force-page-break' : ''} break-inside-avoid-page`}
                  style={{
                    pageBreakBefore: section.forcePageBreak ? 'always' : 'auto',
                    breakBefore: section.forcePageBreak ? 'page' : 'auto',
                    breakInside: 'avoid-page',
                    pageBreakInside: 'avoid',
                    marginLeft: '100px',
                    marginRight: '100px',
                    paddingBottom: '25mm',
                    paddingTop: '3em'
                    
                  }}
                >
                   <div className="max-w border-t border-gray-300 opacity-30"/>
                  
                  {/* Section title */}
                  <h2 
                    className={`text-gray-900 antialiased ${sectionTitleStyle.fontSize} ${sectionTitleStyle.fontWeight} ${sectionTitleStyle.lineHeight} ${sectionTitleStyle.letterSpacing} ${sectionTitleStyle.transform || ''}`}
                    style={{
                      fontFamily: `"${data.styles.primaryFont || data.styles.font || 'Crimson Pro'}", serif`,
                      marginTop: '1.5em',
                      marginBottom: '15mm',
                      paddingTop: '0',
                      paddingBottom: '0',
                      WebkitFontSmoothing: 'antialiased',
                      MozOsxFontSmoothing: 'grayscale', 
                      textRendering: 'optimizeLegibility',
                      fontSynthesis: 'none',
                      fontKerning: 'normal',
                      fontFeatureSettings: '"kern" 1',
                      fontOpticalSizing: 'auto',
                      printColorAdjust: 'exact'
                    }}
                  >
                    {processText(section.name)}
                  </h2>
                  
                  {/* Description above items */}
                  {section.descriptionPosition !== 'below' && section.description && section.showDescriptions !== false && (
                    <p 
                      className="block text-gray-600 text-[0.9rem] leading-tight font-normal leading-relaxed mt-[1.5em] mb-[1.5em]"
                      style={{
                        fontFamily: `"${data.styles.secondaryFont || data.styles.primaryFont || data.styles.font || 'Crimson Pro'}", serif`,
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility',
                        letterSpacing: '-0.01em',
                        textWrap: 'balance'
                      }}
                    >
                      {processText(section.description)}
                    </p>
                  )}
                  
                  {/* Items list with proper spacing */}
                  <div className={`${section.showDescriptions === false ? 'space-y-1.5' : 'space-y-3'} mt-[15mm]`}>
                    {section.items.map((item) => (
                      <div key={item.id} className={`grid ${section.showPlu ? 'grid-cols-[55px_1fr_auto]' : 'grid-cols-[1fr_auto]'} gap-2 items-baseline`}>
                        {section.showPlu && (
                          <div 
                          className={`text-gray-900 ${pluStyle.fontSize} ${pluStyle.fontWeight} ${pluStyle.lineHeight} ${pluStyle.letterSpacing} ${pluStyle.transform || ''}`}
                          style={{
                            fontFamily: `"${data.styles.secondaryFont || data.styles.primaryFont || data.styles.font || 'Crimson Pro'}", serif`,
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility',
                            transform: 'translateY(-5px)'
                          }}
                          >
                            {processText(item.plu)}
                          </div>
                        )}
                        <div>
                           <h3 
                             className={`text-gray-900 ${itemNameStyle.fontSize} ${itemNameStyle.fontWeight} ${itemNameStyle.lineHeight} ${itemNameStyle.letterSpacing} ${itemNameStyle.transform || ''}`}
                             style={{
                               fontFamily: `"${data.styles.secondaryFont || data.styles.primaryFont || data.styles.font || 'Crimson Pro'}", serif`,
                               WebkitFontSmoothing: 'antialiased',
                               MozOsxFontSmoothing: 'grayscale',
                               textRendering: 'optimizeLegibility',
                               textWrap: 'balance'
                             }}
                           >
                              {processText(item.name)}
                              <span className="gap-2 ml-1.5 mr-[2mm]">
                                {(item.template?.a || item.a)?.split(',').map((a, index) => (
                                  <span key={`a-${index}`} className="inline-flex justify-center items-center rounded-full bg-[#dfdfe7] text-gray-500 w-[4mm] h-[4mm] text-[2.7mm] font-[100] shadow-lg-100" style={{ transform: 'translateY(-10px) translateX(5px)', fontFamily: "'Times New Roman', serif", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {a.trim().toUpperCase()}
                                  </span>
                                ))}
                                {(item.template?.z || item.z)?.split(',').map((z, index) => (
                                  <span key={`a-${index}`} className="inline-flex justify-center items-center rounded-full bg-[#d1e5d9] w-[5mm] h-[3mm] text-[3.2mm] font-[100] opacity-90" style={{ transform: 'translateY(-10px) translateX(20px)', fontFamily: "'Times New Roman', serif", display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {z.trim().toUpperCase()}
                                  </span>
                                ))}
                              </span>
                              
                            </h3>
                            {section.showDescriptions !== false && (
                              <p className={`text-gray-600 ${descriptionStyle.fontSize} ${descriptionStyle.fontWeight} ${descriptionStyle.lineHeight} ${descriptionStyle.letterSpacing} ${descriptionStyle.transform || ''}`}
                                style={{
                                  fontFamily: `"${data.styles.secondaryFont || data.styles.primaryFont || data.styles.font || 'Crimson Pro'}", serif`,
                                  WebkitFontSmoothing: 'antialiased',
                                  MozOsxFontSmoothing: 'grayscale',
                                  textRendering: 'optimizeLegibility',
                                  hyphens: 'auto',
                                  hyphenateCharacter: 'auto',
                                  wordBreak: 'normal',
                                  overflowWrap: 'break-word',
                                  maxWidth: '100%'
                                }}>
                                {processText(item.description)}
                              </p>
                            )}
                        </div>
                        <div 
                          className={`text-right text-gray-900 flex items-baseline gap-3 ${priceStyle.fontSize} ${priceStyle.fontWeight} ${priceStyle.lineHeight} ${priceStyle.letterSpacing} ${priceStyle.transform || ''}`}
                          style={{
                            fontFamily: `"${data.styles.secondaryFont || data.styles.primaryFont || data.styles.font || 'Crimson Pro'}", serif`,
                            WebkitFontSmoothing: 'antialiased',
                            MozOsxFontSmoothing: 'grayscale',
                            textRendering: 'optimizeLegibility'
                          }}
                        >
                          {item.prices.map((price, index) => (
                            <React.Fragment key={index}>
                              {index > 0 && <span className="text-gray-400 mx-1">·</span>}
                              <div className="whitespace-nowrap flex items-baseline gap-2">
                                {price.size && (
                                  <span 
                                    className="text-gray-600"
                                    style={{
                                      fontFamily: data.styles.secondaryFont || data.styles.primaryFont || data.styles.font || undefined,
                                      WebkitFontSmoothing: 'antialiased',
                                      MozOsxFontSmoothing: 'grayscale',
                                      textRendering: 'optimizeLegibility'
                                    }}
                                  >
                                    {processText(formatSize(price.size))}
                                  </span>
                                )}
                                <span>{price.price.toFixed(1)} €</span>
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Description below items */}
                  {section.descriptionPosition === 'below' && section.description && section.showDescriptions !== false && (
                    <p 
                      className="block text-gray-600 text-[0.9rem] leading-tight font-normal leading-relaxed mt-[1.5em]"
                      style={{
                        fontFamily: `"${data.styles.secondaryFont || data.styles.primaryFont || data.styles.font || 'Crimson Pro'}", serif`,
                        WebkitFontSmoothing: 'antialiased',
                        MozOsxFontSmoothing: 'grayscale',
                        textRendering: 'optimizeLegibility',
                        letterSpacing: '-0.01em',
                        hyphens: 'auto',
                        hyphenateCharacter: 'auto',
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                        maxWidth: '100%'
                      }}
                    >
                  
                      {processText(section.description)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  });

PrintableMenu.displayName = 'PrintableMenu';

export { PrintableMenu }
