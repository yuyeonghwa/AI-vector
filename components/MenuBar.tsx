
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';

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
  <div className="absolute top-full left-0 mt-2 w-72 bg-dark-card border border-dark-border rounded-md shadow-lg z-20 p-1 animate-fade-in">
    {children}
  </div>
);

// --- Main MenuBar Component ---

interface MenuBarProps {
  onImageUpload: (file: File) => void;
  generatedImage: string | null;
  isLoading: boolean;
  onDownload: () => void;
}

const MenuBar: React.FC<MenuBarProps> = (props) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuBarRef = useRef<HTMLElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleMenuToggle = (menu: string) => {
    setActiveMenu(prev => (prev === menu ? null : menu));
  };

  const closeMenu = useCallback(() => {
    setActiveMenu(null);
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
                                <span>생성된 아트웍 다운로드</span>
                            </div>
                        </MenuItem>
                    </DropdownMenu>
                    )}
                </div>
            </nav>
        </div>
        <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-purple hidden sm:block">
            AI 스타일로
        </h1>
    </header>
  );
};

export default MenuBar;
