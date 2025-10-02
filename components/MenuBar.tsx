
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VectorStyle, ShadingLevel, OutlineLevel, WatercolorVariant } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SketchIcon } from './icons/SketchIcon';
import { ShadingNoneIcon } from './icons/ShadingNoneIcon';
import { ShadingLightIcon } from './icons/ShadingLightIcon';
import { ShadingMediumIcon } from './icons/ShadingMediumIcon';
import { ShadingHeavyIcon } from './icons/ShadingHeavyIcon';
import { GhibliIcon } from './icons/GhibliIcon';
import { PixarIcon } from './icons/PixarIcon';
import { ThreeDIcon } from './icons/ThreeDIcon';
import { OutlineNoneIcon } from './icons/OutlineNoneIcon';
import { OutlineThinIcon } from './icons/OutlineThinIcon';
import { OutlineMediumIcon } from './icons/OutlineMediumIcon';
import { OutlineThickIcon } from './icons/OutlineThickIcon';
import { WatercolorIcon } from './icons/WatercolorIcon';
import { WatercolorSoftIcon } from './icons/WatercolorSoftIcon';
import { WatercolorVibrantIcon } from './icons/WatercolorVibrantIcon';

// --- Menu Item Components ---

const MenuItem: React.FC<{ onClick: (e?: React.MouseEvent) => void; disabled?: boolean; children: React.ReactNode; className?: string }> = ({ onClick, disabled, children, className = "" }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full text-left px-4 py-2 text-sm text-light-text hover:bg-brand-blue/50 rounded disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between ${className}`}
  >
    {children}
  </button>
);


// --- Dropdown Container ---

const DropdownMenu: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute top-full left-0 mt-2 w-64 bg-dark-card border border-dark-border rounded-md shadow-lg z-20 p-1 animate-fade-in">
    {children}
  </div>
);

// --- Icon Mapping ---
const shadingLevelIcons: { [key in ShadingLevel]: React.FC<{ className?: string }> } = {
  [ShadingLevel.NONE]: ShadingNoneIcon,
  [ShadingLevel.LIGHT]: ShadingLightIcon,
  [ShadingLevel.MEDIUM]: ShadingMediumIcon,
  [ShadingLevel.HEAVY]: ShadingHeavyIcon,
};

const watercolorVariantIcons: { [key in WatercolorVariant]: React.FC<{ className?: string }> } = {
  [WatercolorVariant.SOFT]: WatercolorSoftIcon,
  [WatercolorVariant.VIBRANT]: WatercolorVibrantIcon,
};

const outlineLevelIcons: { [key in OutlineLevel]: React.FC<{ className?: string }> } = {
  [OutlineLevel.NONE]: OutlineNoneIcon,
  [OutlineLevel.THIN]: OutlineThinIcon,
  [OutlineLevel.MEDIUM]: OutlineMediumIcon,
  [OutlineLevel.THICK]: OutlineThickIcon,
};


// --- Main MenuBar Component ---

interface MenuBarProps {
  onImageUpload: (file: File) => void;
  generatedImage: string | null;
  isLoading: boolean;
  originalImage: string | null;
  selectedStyle: VectorStyle | null;
  onSelectStyle: (style: VectorStyle) => void;
  selectedShadingLevel: ShadingLevel;
  onSelectShadingLevel: (level: ShadingLevel) => void;
  selectedWatercolorVariant: WatercolorVariant;
  onSelectWatercolorVariant: (variant: WatercolorVariant) => void;
  removeBackground: boolean;
  onRemoveBackgroundToggle: () => void;
  selectedOutlineLevel: OutlineLevel;
  onSelectOutlineLevel: (level: OutlineLevel) => void;
  onDownload: () => void;
}

const MenuBar: React.FC<MenuBarProps> = (props) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSketchSubMenuOpen, setIsSketchSubMenuOpen] = useState(false);
  const [isWatercolorSubMenuOpen, setIsWatercolorSubMenuOpen] = useState(false);
  const menuBarRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMenuToggle = (menu: string) => {
    setActiveMenu(prev => (prev === menu ? null : menu));
    if (menu !== 'style') {
      setIsSketchSubMenuOpen(false);
      setIsWatercolorSubMenuOpen(false);
    }
  };
  
  const closeMenu = useCallback(() => {
    setActiveMenu(null);
    setIsSketchSubMenuOpen(false);
    setIsWatercolorSubMenuOpen(false);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuBarRef.current && !menuBarRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeMenu]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      props.onImageUpload(file);
      closeMenu();
    }
  };
  
  const handleSelectShading = (level: ShadingLevel) => {
      props.onSelectShadingLevel(level);
      closeMenu();
  }
  
  const handleSelectWatercolorVariant = (variant: WatercolorVariant) => {
    props.onSelectWatercolorVariant(variant);
    closeMenu();
  }
  
  const handleSelectOutline = (level: OutlineLevel) => {
    props.onSelectOutlineLevel(level);
    closeMenu();
  }

  const isControlsDisabled = props.isLoading || !props.originalImage;

  return (
    <header ref={menuBarRef} className="w-full bg-dark-card border-b border-dark-border px-4 py-2 flex items-center justify-between relative z-30">
        <div className="flex items-center">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg"
                className="hidden"
            />

            <nav className="flex items-center space-x-2">
                {/* File Menu */}
                <div className="relative">
                    <button onClick={() => handleMenuToggle('file')} className={`px-3 py-1 text-sm rounded ${activeMenu === 'file' ? 'bg-dark-border' : 'hover:bg-dark-border/50'}`}>파일</button>
                    {activeMenu === 'file' && (
                    <DropdownMenu>
                        <MenuItem onClick={() => fileInputRef.current?.click()} disabled={props.isLoading}>
                            <div className="flex items-center gap-2">
                                <UploadIcon className="w-5 h-5" />
                                <span>이미지 업로드...</span>
                            </div>
                        </MenuItem>
                        <MenuItem onClick={() => { props.onDownload(); closeMenu(); }} disabled={!props.generatedImage || props.isLoading}>
                            <div className="flex items-center gap-2">
                                <DownloadIcon className="w-5 h-5"/>
                                <span>PNG 다운로드</span>
                            </div>
                        </MenuItem>
                    </DropdownMenu>
                    )}
                </div>

                {/* Style Menu */}
                <div className="relative">
                    <button onClick={() => handleMenuToggle('style')} disabled={isControlsDisabled} className={`px-3 py-1 text-sm rounded ${activeMenu === 'style' ? 'bg-dark-border' : 'hover:bg-dark-border/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>스타일</button>
                    {activeMenu === 'style' && (
                    <DropdownMenu>
                        <MenuItem onClick={() => { props.onSelectStyle(VectorStyle.GHIBLI); closeMenu(); }}>
                            <div className="flex items-center gap-2"><GhibliIcon className="w-5 h-5"/><span>{VectorStyle.GHIBLI}</span></div>
                            {props.selectedStyle === VectorStyle.GHIBLI && <CheckIcon />}
                        </MenuItem>
                        <MenuItem onClick={() => { props.onSelectStyle(VectorStyle.PIXAR); closeMenu(); }}>
                            <div className="flex items-center gap-2"><PixarIcon className="w-5 h-5"/><span>{VectorStyle.PIXAR}</span></div>
                            {props.selectedStyle === VectorStyle.PIXAR && <CheckIcon />}
                        </MenuItem>
                        <MenuItem onClick={() => { props.onSelectStyle(VectorStyle.THREE_D); closeMenu(); }}>
                            <div className="flex items-center gap-2"><ThreeDIcon className="w-5 h-5"/><span>{VectorStyle.THREE_D}</span></div>
                            {props.selectedStyle === VectorStyle.THREE_D && <CheckIcon />}
                        </MenuItem>

                        <div className="h-px bg-dark-border my-1" />

                        <MenuItem onClick={(e) => { e.stopPropagation(); setIsWatercolorSubMenuOpen(false); setIsSketchSubMenuOpen(p => !p); }}>
                            <div className="flex items-center gap-2"><SketchIcon className="w-5 h-5"/><span>{VectorStyle.SKETCH}</span></div>
                            {props.selectedStyle === VectorStyle.SKETCH && <CheckIcon />}
                        </MenuItem>
                        {isSketchSubMenuOpen && (
                            <div className="pl-6 animate-fade-in">
                                <div className="h-px bg-dark-border my-1"/>
                                <span className="block text-xs font-medium text-medium-text mb-1 px-4 pt-1">음영 단계</span>
                                {Object.values(ShadingLevel).map(level => {
                                    const Icon = shadingLevelIcons[level];
                                    return (
                                        <MenuItem key={level} onClick={() => handleSelectShading(level)}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-5 h-5" />
                                                <span>{level}</span>
                                            </div>
                                            {props.selectedShadingLevel === level && props.selectedStyle === VectorStyle.SKETCH && <CheckIcon />}
                                        </MenuItem>
                                    );
                                })}
                            </div>
                        )}
                        <MenuItem onClick={(e) => { e.stopPropagation(); setIsSketchSubMenuOpen(false); setIsWatercolorSubMenuOpen(p => !p); }}>
                            <div className="flex items-center gap-2"><WatercolorIcon className="w-5 h-5"/><span>{VectorStyle.WATERCOLOR}</span></div>
                            {props.selectedStyle === VectorStyle.WATERCOLOR && <CheckIcon />}
                        </MenuItem>
                        {isWatercolorSubMenuOpen && (
                            <div className="pl-6 animate-fade-in">
                                <div className="h-px bg-dark-border my-1"/>
                                <span className="block text-xs font-medium text-medium-text mb-1 px-4 pt-1">수채화 종류</span>
                                {Object.values(WatercolorVariant).map(variant => {
                                    const Icon = watercolorVariantIcons[variant];
                                    return (
                                        <MenuItem key={variant} onClick={() => handleSelectWatercolorVariant(variant)}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-5 h-5" />
                                                <span>{variant}</span>
                                            </div>
                                            {props.selectedWatercolorVariant === variant && props.selectedStyle === VectorStyle.WATERCOLOR && <CheckIcon />}
                                        </MenuItem>
                                    );
                                })}
                            </div>
                        )}
                    </DropdownMenu>
                    )}
                </div>

                {/* Effects Menu */}
                <div className="relative">
                    <button onClick={() => handleMenuToggle('effects')} disabled={isControlsDisabled} className={`px-3 py-1 text-sm rounded ${activeMenu === 'effects' ? 'bg-dark-border' : 'hover:bg-dark-border/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>효과</button>
                    {activeMenu === 'effects' && (
                    <DropdownMenu>
                        <MenuItem onClick={props.onRemoveBackgroundToggle}>
                            <span>배경 제거</span>
                            {props.removeBackground && <CheckIcon />}
                        </MenuItem>
                        
                        {props.removeBackground && (
                            <div className="animate-fade-in">
                                <div className="h-px bg-dark-border my-1"/>
                                <span className="block text-xs font-medium text-medium-text mb-1 px-4 pt-1">스티커 효과</span>
                                {Object.values(OutlineLevel).map(level => {
                                    const Icon = outlineLevelIcons[level];
                                    return (
                                        <MenuItem key={level} onClick={() => handleSelectOutline(level)}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-5 h-5" />
                                                <span>{level}</span>
                                            </div>
                                            {props.selectedOutlineLevel === level && <CheckIcon />}
                                        </MenuItem>
                                    );
                                })}
                            </div>
                        )}
                    </DropdownMenu>
                    )}
                </div>

            </nav>
        </div>
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple">
            AI 벡터 변환기
        </h1>
    </header>
  );
};

export default MenuBar;
