
import React, { useReducer, useCallback } from 'react';
import { VectorStyle, ShadingLevel, BackgroundStyle, AppState, AppAction } from './types';
import { generateVectorImage, fileToBase64 } from './services/geminiService';
import ComparisonView from './components/ComparisonView';

const initialState: AppState = {
  originalImage: null,
  originalMimeType: '',
  generatedImages: null,
  selectedGeneratedImage: null,
  isLoading: false,
  error: null,
  selectedStyle: null,
  shadingLevel: ShadingLevel.MEDIUM,
  backgroundStyle: BackgroundStyle.ORIGINAL,
  backgroundColor: '#FFFFFF',
  isDirty: true,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_IMAGE':
      return {
        ...state,
        originalImage: action.payload.base64,
        originalMimeType: action.payload.mimeType,
        generatedImages: null,
        selectedGeneratedImage: null,
        selectedStyle: VectorStyle.GHIBLI, // 기본 스타일 설정
        backgroundStyle: BackgroundStyle.ORIGINAL, // 기본 배경 스타일 설정
        isDirty: true,
        error: null,
      };
    case 'SET_STYLE':
      return { ...state, selectedStyle: action.payload, isDirty: true };
    case 'SET_SHADING_LEVEL':
      return { ...state, shadingLevel: action.payload, selectedStyle: VectorStyle.SKETCH, isDirty: true };
    case 'SET_BACKGROUND_STYLE':
      return { ...state, backgroundStyle: action.payload, isDirty: true };
    case 'SET_BACKGROUND_COLOR':
      return { ...state, backgroundColor: action.payload, isDirty: true };
    case 'SET_SELECTED_GENERATED_IMAGE':
      return { ...state, selectedGeneratedImage: action.payload };
    case 'GENERATION_START':
      return {
        ...state,
        isLoading: true,
        error: null,
        generatedImages: null,
        selectedGeneratedImage: null,
        isDirty: false,
      };
    case 'GENERATION_SUCCESS':
      return {
        ...state,
        isLoading: false,
        generatedImages: action.payload,
        selectedGeneratedImage: action.payload[0] || null,
      };
    case 'GENERATION_FAILURE':
      return { ...state, isLoading: false, error: `생성에 실패했습니다: ${action.payload}` };
    case 'SET_ERROR':
        return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}


const App: React.FC = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const { 
    originalImage, originalMimeType, generatedImages, selectedGeneratedImage,
    isLoading, error, selectedStyle, shadingLevel, backgroundStyle, backgroundColor, isDirty
  } = state;

  const handleImageUpload = async (file: File) => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const { base64, mimeType } = await fileToBase64(file);
      dispatch({ type: 'SET_IMAGE', payload: { base64, mimeType } });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: '이미지를 불러오는 데 실패했습니다. 다른 파일을 시도해 주세요.' });
      console.error(err);
    }
  };

  const handleSelectStyle = useCallback((style: VectorStyle) => {
    dispatch({ type: 'SET_STYLE', payload: style });
  }, []);
  
  const handleShadingLevelSelect = useCallback((level: ShadingLevel) => {
    dispatch({ type: 'SET_SHADING_LEVEL', payload: level });
  }, []);
  
  const handleSelectBackgroundStyle = useCallback((style: BackgroundStyle) => {
    dispatch({ type: 'SET_BACKGROUND_STYLE', payload: style });
  }, []);

  const handleBackgroundColorChange = useCallback((color: string) => {
    dispatch({ type: 'SET_BACKGROUND_COLOR', payload: color });
  }, []);

  const handleGenerateClick = useCallback(async () => {
    if (!originalImage || !originalMimeType) {
      dispatch({ type: 'SET_ERROR', payload: "먼저 이미지를 업로드해주세요." });
      return;
    }
    if (!selectedStyle) {
      dispatch({ type: 'SET_ERROR', payload: "먼저 스타일을 선택해주세요." });
      return;
    }

    dispatch({ type: 'GENERATION_START' });

    try {
      const results = await generateVectorImage(
        originalImage,
        originalMimeType,
        selectedStyle,
        shadingLevel,
        backgroundStyle,
        backgroundColor,
      );
      dispatch({ type: 'GENERATION_SUCCESS', payload: results });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.';
      dispatch({ type: 'GENERATION_FAILURE', payload: errorMessage });
      console.error(err);
    }
  }, [originalImage, originalMimeType, selectedStyle, shadingLevel, backgroundStyle, backgroundColor]);

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

  const handleSelectGeneratedImage = useCallback((image: string) => {
    dispatch({ type: 'SET_SELECTED_GENERATED_IMAGE', payload: image });
  }, []);


  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
       <header className="w-full bg-dark-card border-b border-dark-border px-4 py-3 flex items-center justify-center relative shadow-lg">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            AI 스타일러
        </h1>
      </header>
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-7xl">
           <ComparisonView
            originalImage={originalImage}
            generatedImages={generatedImages}
            selectedGeneratedImage={selectedGeneratedImage}
            isLoading={isLoading}
            error={error}
            onImageUpload={handleImageUpload}
            onDownload={handleDownload}
            onSelectGeneratedImage={handleSelectGeneratedImage}
            onGenerateClick={handleGenerateClick}
            isDirty={isDirty}
            selectedStyle={selectedStyle}
            onSelectStyle={handleSelectStyle}
            selectedShadingLevel={shadingLevel}
            onSelectShadingLevel={handleShadingLevelSelect}
            selectedBackgroundStyle={backgroundStyle}
            onSelectBackgroundStyle={handleSelectBackgroundStyle}
            backgroundColor={backgroundColor}
            onBackgroundColorChange={handleBackgroundColorChange}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
