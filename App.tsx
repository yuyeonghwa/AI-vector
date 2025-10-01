
import React, { useState, useCallback, useRef } from 'react';
import { VectorStyle, ShadingLevel, GaussianBlurLevel, OutlineLevel } from './types';
import { generateVectorImage, fileToBase64 } from './services/geminiService';
import ComparisonView from './components/ComparisonView';
import MenuBar from './components/MenuBar';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalMimeType, setOriginalMimeType] = useState<string>('');
  const [generatedImages, setGeneratedImages] = useState<string[] | null>(null);
  const [selectedGeneratedImage, setSelectedGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<VectorStyle | null>(null);
  const [shadingLevel, setShadingLevel] = useState<ShadingLevel>(ShadingLevel.MEDIUM);
  const [gaussianBlurLevel, setGaussianBlurLevel] = useState<GaussianBlurLevel>(GaussianBlurLevel.MEDIUM);
  const [removeBackground, setRemoveBackground] = useState<boolean>(false);
  const [outlineLevel, setOutlineLevel] = useState<OutlineLevel>(OutlineLevel.NONE);


  const triggerGeneration = useCallback(async (
    style: VectorStyle,
    shading: ShadingLevel,
    blur: GaussianBlurLevel,
    removeBg: boolean,
    outline: OutlineLevel,
    imgB64?: string,
    imgMime?: string
  ) => {
    const imageToUse = imgB64 || originalImage;
    const mimeToUse = imgMime || originalMimeType;

    if (!imageToUse || !mimeToUse) {
      setError("먼저 이미지를 업로드해주세요.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImages(null);
    setSelectedGeneratedImage(null);

    try {
      const results = await generateVectorImage(
        imageToUse,
        mimeToUse,
        style,
        3, // Hardcoded line thickness
        shading,
        blur,
        removeBg,
        outline
      );
      setGeneratedImages(results);
      setSelectedGeneratedImage(results?.[0] || null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      setError(`생성에 실패했습니다: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [originalImage, originalMimeType]);

  const handleImageUpload = async (file: File) => {
    try {
      setError(null);
      setGeneratedImages(null);
      setSelectedGeneratedImage(null);
      setSelectedStyle(null);
      setRemoveBackground(false);
      setOutlineLevel(OutlineLevel.NONE);
      const { base64, mimeType } = await fileToBase64(file);
      setOriginalImage(base64);
      setOriginalMimeType(mimeType);
    } catch (err) {
      setError('이미지를 불러오는 데 실패했습니다. 다른 파일을 시도해 주세요.');
      console.error(err);
    }
  };

  const handleStyleSelect = (style: VectorStyle) => {
    setSelectedStyle(style);
    triggerGeneration(style, shadingLevel, gaussianBlurLevel, removeBackground, outlineLevel);
  };
  
  const handleShadingLevelSelect = (level: ShadingLevel) => {
    setShadingLevel(level);
    setSelectedStyle(VectorStyle.SKETCH);
    triggerGeneration(VectorStyle.SKETCH, level, gaussianBlurLevel, removeBackground, outlineLevel);
  };

  const handleGaussianBlurLevelSelect = (level: GaussianBlurLevel) => {
    setGaussianBlurLevel(level);
    setSelectedStyle(VectorStyle.BLACK_AND_WHITE);
    triggerGeneration(VectorStyle.BLACK_AND_WHITE, shadingLevel, level, removeBackground, outlineLevel);
  };

  const handleRemoveBackgroundToggle = () => {
    const newRemoveBackground = !removeBackground;
    setRemoveBackground(newRemoveBackground);
    // 배경 제거를 비활성화하면 스티커 효과도 초기화합니다.
    const newOutlineLevel = !newRemoveBackground ? OutlineLevel.NONE : outlineLevel;
    if (!newRemoveBackground) {
        setOutlineLevel(OutlineLevel.NONE);
    }
    if (originalImage && selectedStyle) {
      triggerGeneration(selectedStyle, shadingLevel, gaussianBlurLevel, newRemoveBackground, newOutlineLevel);
    }
  };

  const handleOutlineLevelSelect = (level: OutlineLevel) => {
    setOutlineLevel(level);
    if (originalImage && selectedStyle && removeBackground) {
      triggerGeneration(selectedStyle, shadingLevel, gaussianBlurLevel, removeBackground, level);
    }
  };

  const handleDownload = useCallback(() => {
    if (!selectedGeneratedImage) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${selectedGeneratedImage}`;
    const filename = `generated-image-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.png`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [selectedGeneratedImage]);

  const handleSelectGeneratedImage = (image: string) => {
    setSelectedGeneratedImage(image);
  };


  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <MenuBar
        onImageUpload={handleImageUpload}
        generatedImage={selectedGeneratedImage}
        isLoading={isLoading}
        originalImage={originalImage}
        selectedStyle={selectedStyle}
        onSelectStyle={handleStyleSelect}
        selectedShadingLevel={shadingLevel}
        onSelectShadingLevel={handleShadingLevelSelect}
        selectedGaussianBlurLevel={gaussianBlurLevel}
        onSelectGaussianBlurLevel={handleGaussianBlurLevelSelect}
        removeBackground={removeBackground}
        onRemoveBackgroundToggle={handleRemoveBackgroundToggle}
        selectedOutlineLevel={outlineLevel}
        onSelectOutlineLevel={handleOutlineLevelSelect}
        onDownload={handleDownload}
      />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl">
           <ComparisonView
            originalImage={originalImage}
            generatedImages={generatedImages}
            selectedGeneratedImage={selectedGeneratedImage}
            isLoading={isLoading}
            error={error}
            onImageDrop={handleImageUpload}
            onDownload={handleDownload}
            onSelectGeneratedImage={handleSelectGeneratedImage}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
