
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VectorStyle, ShadingLevel, GaussianBlurLevel } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { CartoonIcon } from './icons/CartoonIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';
import { SketchIcon } from './icons/SketchIcon';
import { ShadingNoneIcon } from './icons/ShadingNoneIcon';
import { ShadingLightIcon } from './icons/ShadingLightIcon';
import { ShadingMediumIcon } from './icons/ShadingMediumIcon';
import { ShadingHeavyIcon } from './icons/ShadingHeavyIcon';
import { BlackAndWhiteIcon } from './icons/BlackAndWhiteIcon';
import { GaussianBlurLightIcon } from './icons/GaussianBlurLightIcon';
import { GaussianBlurMediumIcon } from './icons/GaussianBlurMediumIcon';
import { GaussianBlurHeavyIcon } from './icons/GaussianBlurHeavyIcon';


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

const gaussianBlurLevelIcons: { [key in GaussianBlurLevel]: React.FC<{ className?: string }> } = {
  [GaussianBlurLevel.LIGHT]: GaussianBlurLightIcon,
  [GaussianBlurLevel.MEDIUM]: GaussianBlurMediumIcon,
  [GaussianBlurLevel.HEAVY]: GaussianBlurHeavyIcon,
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
  selectedGaussianBlurLevel: GaussianBlurLevel;
  onSelectGaussianBlurLevel: (level: GaussianBlurLevel) => void;
  lineThickness: number;
  onLineThicknessChange: (thickness: number) => void;
  outlineDistance: number;
  onOutlineDistanceChange: (distance: number) => void;
  onEditEnd: () => void;
  onDownload: () => void;
}

const MenuBar: React.FC<MenuBarProps> = (props) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSketchSubMenuOpen, setIsSketchSubMenuOpen] = useState(false);
  const [isBlackAndWhiteSubMenuOpen, setIsBlackAndWhiteSubMenuOpen] = useState(false);
  const menuBarRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMenuToggle = (menu: string) => {
    setActiveMenu(prev => (prev === menu ? null : menu));
    if (menu !== 'style') {
      setIsSketchSubMenuOpen(false);
      setIsBlackAndWhiteSubMenuOpen(false);
    }
  };
  
  const closeMenu = useCallback(() => {
    setActiveMenu(null);
    setIsSketchSubMenuOpen(false);
    setIsBlackAndWhiteSubMenuOpen(false);
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
  
  const handleSelectGaussianBlur = (level: GaussianBlurLevel) => {
    props.onSelectGaussianBlurLevel(level);
    closeMenu();
  }

  const handleApplyEdit = () => {
    props.onEditEnd();
    closeMenu();
  };

  const isControlsDisabled = props.isLoading || !props.originalImage;
  const isLineControlsDisabled = isControlsDisabled || props.selectedStyle === VectorStyle.BLACK_AND_WHITE;

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
                        <MenuItem onClick={() => { props.onSelectStyle(VectorStyle.CARTOON); closeMenu(); }}>
                            <div className="flex items-center gap-2"><CartoonIcon className="w-5 h-5"/><span>{VectorStyle.CARTOON}</span></div>
                            {props.selectedStyle === VectorStyle.CARTOON && <CheckIcon />}
                        </MenuItem>
                        
                        <div className="h-px bg-dark-border my-1" />

                        <MenuItem onClick={(e) => { e.stopPropagation(); setIsSketchSubMenuOpen(prev => !prev); setIsBlackAndWhiteSubMenuOpen(false);}}>
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
                        <div className="h-px bg-dark-border my-1" />
                        <MenuItem onClick={(e) => { e.stopPropagation(); setIsBlackAndWhiteSubMenuOpen(prev => !prev); setIsSketchSubMenuOpen(false); }}>
                            <div className="flex items-center gap-2"><BlackAndWhiteIcon className="w-5 h-5"/><span>{VectorStyle.BLACK_AND_WHITE}</span></div>
                            {props.selectedStyle === VectorStyle.BLACK_AND_WHITE && <CheckIcon />}
                        </MenuItem>
                        {isBlackAndWhiteSubMenuOpen && (
                            <div className="pl-6 animate-fade-in">
                                <div className="h-px bg-dark-border my-1"/>
                                <span className="block text-xs font-medium text-medium-text mb-1 px-4 pt-1">가우시안 블러 단계</span>
                                {Object.values(GaussianBlurLevel).map(level => {
                                    const Icon = gaussianBlurLevelIcons[level];
                                    return (
                                        <MenuItem key={level} onClick={() => handleSelectGaussianBlur(level)}>
                                            <div className="flex items-center gap-2">
                                                <Icon className="w-5 h-5" />
                                                <span>{level}</span>
                                            </div>
                                            {props.selectedGaussianBlurLevel === level && props.selectedStyle === VectorStyle.BLACK_AND_WHITE && <CheckIcon />}
                                        </MenuItem>
                                    );
                                })}
                            </div>
                        )}
                    </DropdownMenu>
                    )}
                </div>

                {/* Outline Menu */}
                <div className="relative">
                    <button onClick={() => handleMenuToggle('outline')} disabled={isLineControlsDisabled} className={`px-3 py-1 text-sm rounded ${activeMenu === 'outline' ? 'bg-dark-border' : 'hover:bg-dark-border/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>외곽선</button>
                    {activeMenu === 'outline' && (
                        <DropdownMenu>
                            <div className="p-2">
                                <div className="px-2">
                                    <div className="flex justify-between items-center text-sm font-medium text-medium-text mb-2">
                                        <span>거리 값</span>
                                        <span className="text-light-text font-semibold bg-dark-bg px-2 py-0.5 rounded">
                                            {props.outlineDistance === 0 ? '없음' : props.outlineDistance}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-xs whitespace-nowrap">없음</span>
                                        <input
                                            id="outline-distance"
                                            type="range"
                                            min="0"
                                            max="5"
                                            step="1"
                                            value={props.outlineDistance}
                                            onChange={(e) => props.onOutlineDistanceChange(e.target.valueAsNumber)}
                                            className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer accent-brand-blue"
                                        />
                                        <span className="text-xs whitespace-nowrap">멀게</span>
                                    </div>
                                </div>
                                <div className="mt-4 px-2">
                                    <button
                                        onClick={handleApplyEdit}
                                        className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold py-2 rounded-md transition-colors"
                                    >
                                        적용
                                    </button>
                                </div>
                            </div>
                        </DropdownMenu>
                    )}
                </div>

                {/* Line Thickness Menu */}
                <div className="relative">
                    <button onClick={() => handleMenuToggle('thickness')} disabled={isLineControlsDisabled} className={`px-3 py-1 text-sm rounded ${activeMenu === 'thickness' ? 'bg-dark-border' : 'hover:bg-dark-border/50'} disabled:opacity-50 disabled:cursor-not-allowed`}>윤곽선</button>
                    {activeMenu === 'thickness' && (
                    <DropdownMenu>
                        <div className="p-2">
                            <div className="px-2">
                                <div className="flex justify-between items-center text-sm font-medium text-medium-text mb-2">
                                    <span>두께 값</span>
                                    <span className="text-light-text font-semibold bg-dark-bg px-2 py-0.5 rounded">{props.lineThickness}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-xs whitespace-nowrap">얇게</span>
                                    <input
                                    id="line-thickness"
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={props.lineThickness}
                                    onChange={(e) => props.onLineThicknessChange(e.target.valueAsNumber)}
                                    className="w-full h-2 bg-dark-border rounded-lg appearance-none cursor-pointer accent-brand-blue"
                                    />
                                    <span className="text-xs whitespace-nowrap">두껍게</span>
                                </div>
                            </div>
                            <div className="mt-4 px-2">
                                <button
                                    onClick={handleApplyEdit}
                                    className="w-full bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold py-2 rounded-md transition-colors"
                                >
                                    적용
                                </button>
                            </div>
                        </div>
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
