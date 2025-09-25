import React, { useState, useRef } from 'react';
import Loader from './Loader';
import { UploadIcon } from './icons/UploadIcon';
import { DownloadIcon } from './icons/DownloadIcon';

interface ComparisonViewProps {
  originalImage: string | null;
  generatedImage: string | null;
  isLoading: boolean;
  error: string | null;
  onImageDrop: (file: File) => void;
  onDownload: () => void;
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
        className={`w-full aspect-square relative flex items-center justify-center rounded-lg overflow-hidden bg-dark-bg border transition-colors ${isDraggingOver ? 'border-brand-blue border-dashed border-2' : 'border-dark-border'}`}
      >
        {image ? (
          <img
            src={`data:image/png;base64,${image}`}
            alt={altText}
            className="object-contain max-w-full max-h-full"
          />
        ) : (
          placeholder
        )}
        {children}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-brand-blue/20 flex flex-col items-center justify-center pointer-events-none animate-fade-in">
            <UploadIcon className="w-16 h-16 text-light-text animate-pulse" />
            <p className="mt-4 text-light-text font-bold text-lg">이미지를 놓으세요</p>
          </div>
        )}
      </div>
    </div>
  );

const ComparisonView: React.FC<ComparisonViewProps> = ({ originalImage, generatedImage, isLoading, error, onImageDrop, onDownload }) => {
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const dragCounter = useRef(0);

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
                onImageDrop(files[0]);
            }
        }
    };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 w-full h-full items-start">
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
            <UploadIcon className="w-12 h-12 mb-4 text-dark-border" />
            <p className="font-semibold">여기에 이미지를 드래그 앤 드롭하세요</p>
            <p className="text-sm mt-1">또는 '파일 &gt; 이미지 업로드'를 선택하세요</p>
          </div>
        }
      />
      <div className="w-full flex flex-col gap-3">
        <ImagePanel
          title="생성된 이미지"
          image={generatedImage}
          altText="생성된 벡터 스타일 이미지"
          placeholder={
              <div className="text-center text-medium-text p-4">
                  <p>생성된 이미지가 여기에 표시됩니다</p>
              </div>
          }
        >
          {isLoading && <Loader />}
          {!isLoading && error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-center p-4 rounded-lg">
              <p className="text-red-400 font-semibold">오류</p>
              <p className="text-medium-text text-sm mt-1">{error}</p>
            </div>
          )}
        </ImagePanel>
        {generatedImage && !isLoading && !error && (
            <button
                onClick={onDownload}
                className="w-full flex items-center justify-center gap-2 bg-brand-blue hover:bg-brand-blue/80 text-white font-semibold py-2.5 px-4 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
                disabled={isLoading}
            >
                <DownloadIcon className="w-5 h-5" />
                <span>이미지 다운로드</span>
            </button>
        )}
      </div>
    </div>
  );
};

export default ComparisonView;