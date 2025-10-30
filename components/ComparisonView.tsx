
import React, { useState, useRef } from 'react';
import Loader from './Loader';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { VectorStyle, ShadingLevel, BackgroundStyle } from '../types';
import GenerationControls from './GenerationControls';

interface ThumbnailGalleryProps {
  images: string[];
  selectedImage: string | null;
  onSelect: (image: string) => void;
}

const ThumbnailGallery: React.FC<ThumbnailGalleryProps> = ({ images, selectedImage, onSelect }) => {
  return (
    <div className="mt-3 animate-fade-in">
        <h4 className="text-sm font-semibold text-medium-text mb-2 text-center">생성된 아트웍</h4>
        <div className="flex justify-center items-center gap-2 p-2 bg-dark-bg rounded-lg">
            {images.map((img, index) => (
                <button
                    key={index}
                    onClick={() => onSelect(img)}
                    className={`rounded-md overflow-hidden transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-dark-card ${selectedImage === img ? 'ring-2 ring-primary' : 'ring-2 ring-transparent hover:ring-dark-border'}`}
                    aria-label={`생성된 이미지 ${index + 1} 선택`}
                >
                    <img
                        src={`data:image/png;base64,${img}`}
                        alt={`생성된 이미지 ${index + 1}`}
                        className="w-20 h-20 object-cover"
                    />
                </button>
            ))}
        </div>
    </div>
  );
};


interface ComparisonViewProps {
  originalImage: string | null;
  generatedImages: string[] | null;
  selectedGeneratedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onImageUpload: (file: File) => void;
  onDownload: () => void;
  onSelectGeneratedImage: (image: string) => void;
  onGenerateClick: () => void;
  isDirty: boolean;
  selectedStyle: VectorStyle | null;
  onSelectStyle: (style: VectorStyle) => void;
  selectedShadingLevel: ShadingLevel;
  onSelectShadingLevel: (level: ShadingLevel) => void;
  selectedBackgroundStyle: BackgroundStyle;
  onSelectBackgroundStyle: (style: BackgroundStyle) => void;
  backgroundColor: string;
  onBackgroundColorChange: (color: string) => void;
}

interface ImagePanelProps {
  title: string;
  image: string | null;
  altText: string;
  placeholder: React.ReactNode;
  children?: React.ReactNode;
  onDragOver?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnter?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop?: (e: React.DragEvent<HTMLDivElement>) => void;
  isDraggingOver?: boolean;
}

const ImagePanel: React.FC<ImagePanelProps> = ({ title, image, altText, placeholder, children, onDragOver, onDragEnter, onDragLeave, onDrop, isDraggingOver }) => (
    <div className="w-full flex flex-col">
      <h3 className="text-center text-lg font-semibold text-medium-text mb-3">{title}</h3>
      <div
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full aspect-[4/3] relative flex items-center justify-center rounded-lg overflow-hidden border transition-colors bg-dark-card shadow-md ${isDraggingOver ? 'border-primary border-dashed border-2' : 'border-dark-border'}`}
      >
        {image ? (
          <img
            src={`data:image/png;base64,${image}`}
            alt={altText}
            className="relative object-contain max-w-full max-h-full"
          />
        ) : (
          <div className="relative">{placeholder}</div>
        )}
        {children}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-primary/20 flex flex-col items-center justify-center pointer-events-none animate-fade-in z-20">
            <UploadIcon className="w-16 h-16 text-light-text animate-pulse" />
            <p className="mt-4 text-light-text font-bold text-lg">이미지를 놓으세요</p>
          </div>
        )}
      </div>
    </div>
  );

const ComparisonView: React.FC<ComparisonViewProps> = ({ 
    originalImage, 
    generatedImages, 
    selectedGeneratedImage, 
    isLoading, 
    error, 
    onImageUpload, 
    onDownload,
    onSelectGeneratedImage,
    onGenerateClick,
    isDirty,
    selectedStyle,
    onSelectStyle,
    selectedShadingLevel,
    onSelectShadingLevel,
    selectedBackgroundStyle,
    onSelectBackgroundStyle,
    backgroundColor,
    onBackgroundColorChange,
}) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const dragCounter = useRef(0);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
        // Reset file input to allow uploading the same file again
        event.target.value = '';
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current++;
        if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
            setIsDraggingOver(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        dragCounter.current--;
        if (dragCounter.current === 0) {
            setIsDraggingOver(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDraggingOver(false);
        dragCounter.current = 0;
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            if (files[0].type.startsWith('image/')) {
                onImageUpload(files[0]);
            }
        }
    };

    const canGenerate = originalImage && selectedStyle;
    const isGenerateButtonDisabled = isLoading || !canGenerate || (!isDirty && !!generatedImages && generatedImages.length > 0);
    const generateButtonText = isLoading ? '생성 중...' : (generatedImages && generatedImages.length > 0 ? '다시 생성' : '생성하기');

    const getTooltipText = () => {
      if (!isGenerateButtonDisabled || isLoading) {
          return null;
      }
  
      if (!originalImage) {
        return '먼저 이미지를 업로드해주세요.';
      }
      if (!selectedStyle) {
        return '스타일을 선택해주세요.';
      }
      if (!isDirty && generatedImages && generatedImages.length > 0) {
        return '새로운 아트를 생성하려면 설정을 변경해주세요.';
      }
  
      return null; 
    };
  
  const tooltipText = getTooltipText();

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full h-full items-start">
        <div className="w-full flex flex-col">
          <ImagePanel
            title="원본 이미지"
            image={originalImage}
            altText="업로드된 원본 이미지"
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            isDraggingOver={isDraggingOver}
            placeholder={
              <div className="text-center text-medium-text p-4 flex flex-col items-center justify-center h-full">
                 <input
                    type="file"
                    id="image-upload-input"
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg"
                    className="hidden"
                  />
                <UploadIcon className="w-12 h-12 mb-4 text-dark-border" />
                <p className="font-semibold">여기에 이미지를 드래그 앤 드롭하세요</p>
                <p className="text-sm my-2 text-dark-border">또는</p>
                <label
                    htmlFor="image-upload-input"
                    className="bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-md transition-all duration-200 cursor-pointer"
                >
                    컴퓨터에서 찾아보기
                </label>
              </div>
            }
          />
        </div>
        <div className="w-full flex flex-col gap-3">
          <ImagePanel
            title="생성된 이미지"
            image={selectedGeneratedImage}
            altText="생성된 벡터 스타일 이미지"
            placeholder={
                <div className="text-center text-medium-text p-4">
                    <p>생성된 이미지가 여기에 표시됩니다</p>
                </div>
            }
          >
            {isLoading && <Loader />}
            {!isLoading && error && (
              <div 
                className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-center p-4 rounded-lg"
                role="alert"
                aria-live="assertive"
              >
                <p className="text-red-400 font-semibold">오류</p>
                <p className="text-medium-text text-sm mt-1">{error}</p>
              </div>
            )}
          </ImagePanel>
          
          {originalImage && (
            <div className="space-y-4 mt-1 animate-fade-in">
              <GenerationControls
                selectedStyle={selectedStyle}
                onSelectStyle={onSelectStyle}
                selectedShadingLevel={selectedShadingLevel}
                onSelectShadingLevel={onSelectShadingLevel}
                selectedBackgroundStyle={selectedBackgroundStyle}
                onSelectBackgroundStyle={onSelectBackgroundStyle}
                backgroundColor={backgroundColor}
                onBackgroundColorChange={onBackgroundColorChange}
              />
              <div className="relative w-full group">
                <button
                  onClick={onGenerateClick}
                  disabled={isGenerateButtonDisabled}
                  className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2.5 px-4 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md-glow"
                  aria-describedby={tooltipText ? 'generate-tooltip' : undefined}
                >
                  <MagicWandIcon className="w-5 h-5" />
                  <span>{generateButtonText}</span>
                </button>
                 {tooltipText && (
                  <div 
                    id="generate-tooltip"
                    role="tooltip"
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 text-sm font-semibold text-light-text bg-dark-card rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-300 pointer-events-none z-10 ring-1 ring-dark-border"
                  >
                    {tooltipText}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {generatedImages && generatedImages.length > 0 && !isLoading && !error && (
              <ThumbnailGallery 
                  images={generatedImages}
                  selectedImage={selectedGeneratedImage}
                  onSelect={onSelectGeneratedImage}
              />
          )}
          
          {selectedGeneratedImage && !isLoading && !error && (
              <button
                  onClick={onDownload}
                  className="w-full flex items-center justify-center gap-2 bg-dark-card border-2 border-dark-border hover:bg-dark-border text-light-text font-semibold py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1 animate-fade-in"
                  disabled={isLoading}
              >
                  <DownloadIcon className="w-5 h-5" />
                  <span>선택된 이미지 다운로드</span>
              </button>
          )}
        </div>
      </div>
    </>
  );
};

export default ComparisonView;
