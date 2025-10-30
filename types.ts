export enum VectorStyle {
  GHIBLI = '지브리 스타일',
  PIXAR = '픽사 스타일',
  SKETCH = '스케치 스타일',
  ILLUSTRATION = '일러스트 스타일',
}

export enum ShadingLevel {
  NONE = '없음',
  LIGHT = '약하게',
  MEDIUM = '중간',
  HEAVY = '강하게',
}

export enum BackgroundStyle {
  ORIGINAL = '원본 배경',
  COLOR = '색상 지정',
}

export interface AppState {
  originalImage: string | null;
  originalMimeType: string;
  generatedImages: string[] | null;
  selectedGeneratedImage: string | null;
  isLoading: boolean;
  error: string | null;
  selectedStyle: VectorStyle | null;
  shadingLevel: ShadingLevel;
  backgroundStyle: BackgroundStyle;
  backgroundColor: string;
  isDirty: boolean;
}

export type AppAction =
  | { type: 'SET_IMAGE'; payload: { base64: string; mimeType: string } }
  | { type: 'SET_STYLE'; payload: VectorStyle }
  | { type: 'SET_SHADING_LEVEL'; payload: ShadingLevel }
  | { type: 'SET_BACKGROUND_STYLE'; payload: BackgroundStyle }
  | { type: 'SET_BACKGROUND_COLOR'; payload: string }
  | { type: 'SET_SELECTED_GENERATED_IMAGE'; payload: string }
  | { type: 'GENERATION_START' }
  | { type: 'GENERATION_SUCCESS'; payload: string[] }
  | { type: 'GENERATION_FAILURE'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };
