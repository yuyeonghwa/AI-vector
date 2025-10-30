
import React, { memo } from 'react';
import { VectorStyle, ShadingLevel, BackgroundStyle } from '../types';
import { GhibliIcon } from './icons/GhibliIcon';
import { PixarIcon } from './icons/PixarIcon';
import { IllustrationIcon } from './icons/IllustrationIcon';
import { SketchIcon } from './icons/SketchIcon';
import { ShadingNoneIcon } from './icons/ShadingNoneIcon';
import { ShadingLightIcon } from './icons/ShadingLightIcon';
import { ShadingMediumIcon } from './icons/ShadingMediumIcon';
import { ShadingHeavyIcon } from './icons/ShadingHeavyIcon';
import { OriginalBackgroundIcon } from './icons/OriginalBackgroundIcon';
import { ColorPaletteIcon } from './icons/ColorPaletteIcon';


interface ControlButtonProps {
  label: string;
  icon: React.ReactNode;
  isSelected: boolean;
  onClick: () => void;
  selectedClassName?: string;
  baseClassName?: string;
}

const ControlButton: React.FC<ControlButtonProps> = memo(({ 
    label, icon, isSelected, onClick,
    selectedClassName = 'bg-primary text-white border-primary shadow-md',
    baseClassName = 'border-dark-border bg-dark-card hover:border-primary/50 text-medium-text'
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center text-center gap-2 p-2 rounded-lg border-2 w-full h-24 transition-all duration-200 ${
      isSelected ? selectedClassName : baseClassName
    }`}
    aria-pressed={isSelected}
  >
    {icon}
    <span className="text-xs font-semibold mt-1">{label}</span>
  </button>
));


interface GenerationControlsProps {
  selectedStyle: VectorStyle | null;
  onSelectStyle: (style: VectorStyle) => void;
  selectedShadingLevel: ShadingLevel;
  onSelectShadingLevel: (level: ShadingLevel) => void;
  selectedBackgroundStyle: BackgroundStyle;
  onSelectBackgroundStyle: (style: BackgroundStyle) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
}

const styleOptions = [
  { style: VectorStyle.GHIBLI, icon: <GhibliIcon className="w-9 h-9" /> },
  { style: VectorStyle.PIXAR, icon: <PixarIcon className="w-9 h-9" /> },
  { style: VectorStyle.ILLUSTRATION, icon: <IllustrationIcon className="w-9 h-9" /> },
  { style: VectorStyle.SKETCH, icon: <SketchIcon className="w-9 h-9" /> },
];

const shadingOptions = [
    { level: ShadingLevel.NONE, icon: <ShadingNoneIcon className="w-9 h-9" /> },
    { level: ShadingLevel.LIGHT, icon: <ShadingLightIcon className="w-9 h-9" /> },
    { level: ShadingLevel.MEDIUM, icon: <ShadingMediumIcon className="w-9 h-9" /> },
    { level: ShadingLevel.HEAVY, icon: <ShadingHeavyIcon className="w-9 h-9" /> },
];

const GenerationControls: React.FC<GenerationControlsProps> = ({
  selectedStyle,
  onSelectStyle,
  selectedShadingLevel,
  onSelectShadingLevel,
  selectedBackgroundStyle,
  onSelectBackgroundStyle,
  backgroundColor,
  onBackgroundColorChange,
}) => {
  return (
    <div className="w-full space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-medium-text mb-2">1. 스타일 선택</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {styleOptions.map(({ style, icon }) => (
            <ControlButton
              key={style}
              label={style}
              icon={icon}
              isSelected={selectedStyle === style}
              onClick={() => onSelectStyle(style)}
            />
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-medium-text mb-2">2. 배경 선택</h4>
        <div className="grid grid-cols-2 gap-3">
            <ControlButton
              label={BackgroundStyle.ORIGINAL}
              icon={<OriginalBackgroundIcon className="w-9 h-9" />}
              isSelected={selectedBackgroundStyle === BackgroundStyle.ORIGINAL}
              onClick={() => onSelectBackgroundStyle(BackgroundStyle.ORIGINAL)}
            />
            <ControlButton
              label={BackgroundStyle.COLOR}
              icon={<ColorPaletteIcon className="w-9 h-9" />}
              isSelected={selectedBackgroundStyle === BackgroundStyle.COLOR}
              onClick={() => onSelectBackgroundStyle(BackgroundStyle.COLOR)}
            />
        </div>
        {selectedBackgroundStyle === BackgroundStyle.COLOR && (
          <div className="mt-3 flex items-center justify-center gap-3 p-2 bg-dark-card rounded-lg animate-fade-in border border-dark-border">
            <label htmlFor="bg-color-picker" className="text-sm font-medium text-medium-text">배경색:</label>
            <div className="relative w-8 h-8 rounded-md overflow-hidden border-2 border-dark-border">
              <input
                id="bg-color-picker"
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="absolute top-[-2px] left-[-2px] w-[calc(100%+4px)] h-[calc(100%+4px)] p-0 border-none cursor-pointer"
              />
            </div>
            <span className="font-mono text-sm text-light-text">{backgroundColor.toUpperCase()}</span>
          </div>
        )}
      </div>
      
      {selectedStyle === VectorStyle.SKETCH && (
        <div className="animate-fade-in">
          <h4 className="text-sm font-semibold text-medium-text mb-2">3. 음영 단계 (스케치)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {shadingOptions.map(({ level, icon }) => (
              <ControlButton
                key={level}
                label={level}
                icon={icon}
                isSelected={selectedShadingLevel === level}
                onClick={() => onSelectShadingLevel(level)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerationControls;
