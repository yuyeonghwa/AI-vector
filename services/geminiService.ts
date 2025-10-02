
import { GoogleGenAI, Modality } from "@google/genai";
import { VectorStyle, ShadingLevel, OutlineLevel, WatercolorVariant } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fileToBase64 = (file: File): Promise<{ base64: string, mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = (error) => reject(error);
  });
};

const getShadingPrompt = (level: ShadingLevel): string => {
  switch (level) {
    case ShadingLevel.NONE: return "음영이나 크로스해칭 없이 깔끔한 선을 사용하세요.";
    case ShadingLevel.LIGHT: return "형태를 암시하고 약간의 깊이를 더하기 위해 가볍고 미묘한 음영을 적용하세요.";
    case ShadingLevel.MEDIUM: return "적당한 음영과 크로스해칭을 사용하여 명확한 깊이감과 볼륨감을 만드세요.";
    case ShadingLevel.HEAVY: return "강한 대비와 대담한 느낌을 만들기 위해 깊은 그림자와 함께 무겁고 드라마틱한 음영을 적용하세요.";
    default: return "";
  }
};

const getWatercolorPromptPiece = (variant: WatercolorVariant): string => {
  switch (variant) {
    case WatercolorVariant.SOFT:
      return `주어진 이미지를 섬세한 수채화 그림으로 변환하세요. 부드러운 파스텔 색상과 매끄럽게 혼합되는 유동적인 물감을 사용하세요. 붓 터치는 부드럽게 표현하고 수채화 용지의 질감이 보이도록 하세요.`;
    case WatercolorVariant.VIBRANT:
      return `업로드된 이미지를 생동감 넘치는 수채화 그림으로 변환하세요. 대담한 붓 터치, 풍부하고 채도가 높은 색상, 역동적인 색상 혼합을 강조하세요. 예술적인 물감 방울과 튀는 효과를 추가하세요.`;
    default:
      return '';
  }
};

const getStickerEffectPrompt = (level: OutlineLevel): string => {
  switch (level) {
    case OutlineLevel.THIN: return "주 피사체 주위에 얇고 일정한 흰색 윤곽선을 추가하여 스티커처럼 보이게 만드세요.";
    case OutlineLevel.MEDIUM: return "주 피사체 주위에 중간 두께의 일정한 흰색 윤곽선을 추가하여 스티커처럼 보이게 만드세요.";
    case OutlineLevel.THICK: return "주 피사체 주위에 두껍고 굵은 흰색 윤곽선을 추가하여 스티커처럼 보이게 만드세요.";
    case OutlineLevel.NONE:
    default:
      return "";
  }
};

const getStylePrompt = (style: VectorStyle, shadingLevel: ShadingLevel, removeBackground: boolean, watercolorVariant: WatercolorVariant): string => {
  const backgroundInstruction = removeBackground 
    ? "이미지의 주 피사체만 변환하고 배경을 완전히 제거하여 투명하게 만드세요."
    : "이미지 전체(배경 포함)를 요청된 스타일로 변환하세요. 원본 이미지의 구도와 내용을 충실히 재현해야 합니다. 배경을 제거하거나 단색으로 만들지 마세요.";
  const coreStyleInstructions = "원본 사진 속 대상의 주요 특징과 특성을 보존하는 것이 중요합니다. 원본의 구도와 포즈를 유지하세요.";

  switch (style) {
    case VectorStyle.GHIBLI:
      return `스튜디오 지브리 애니메이션의 서정적인 스타일로 이미지를 변환하세요. 부드러운 색상 팔레트, 섬세한 선, 그리고 감성적인 분위기를 강조하여, 마치 손으로 그린 듯한 따뜻한 느낌을 살려주세요. 인물의 표정은 순수하고 아련하게 표현하여 지브리 특유의 감성을 담아내세요. ${coreStyleInstructions} ${backgroundInstruction}`;
    case VectorStyle.PIXAR:
      return `"Pixar-like character" 스타일로 이미지를 변환하세요. "expressive eyes"(표현력이 풍부한 눈)를 강조하고, "cinematic lighting"(영화적인 조명)과 "soft lighting"(부드러운 조명)을 조화롭게 사용하여 깊이와 감성을 더해주세요. "high detail"(높은 디테일)로 재질의 질감을 살려 렌더링하세요. ${coreStyleInstructions} ${backgroundInstruction}`;
    case VectorStyle.THREE_D:
      return `생생한 색감과 부드러운 그림자가 특징인 사실적인 3D 렌더링 스타일로 이미지를 변환하세요. 아이소메트릭 뷰(isometric view)를 적용하여 독특한 시점을 표현하고, 매우 정교하고 디테일을 살려주세요. ${coreStyleInstructions} ${backgroundInstruction}`;
    case VectorStyle.SKETCH: {
      const baseSketchPrompt = `대상의 깨끗한 흑백 라인 아트 스케치. 대상의 주요 특징과 형태를 정확하게 보존하세요.`;
      return `${baseSketchPrompt} ${getShadingPrompt(shadingLevel)} ${backgroundInstruction}`;
    }
    case VectorStyle.WATERCOLOR: {
      return `${getWatercolorPromptPiece(watercolorVariant)} ${coreStyleInstructions} ${backgroundInstruction}`;
    }
    default:
      return `벡터 스타일 이미지. ${backgroundInstruction}`;
  }
};

const getEditPrompt = (style: VectorStyle, thickness: number): string => {
  let prompt = "";
  const thicknessInt = Math.round(thickness);
  switch (thicknessInt) {
    case 1:
      prompt += " 매우 얇은 선을 사용하세요. ";
      break;
    case 2:
      prompt += " 얇은 선을 사용하세요. ";
      break;
    case 3:
      prompt += " 중간 두께의 선을 사용하세요. ";
      break;
    case 4:
      prompt += " 두꺼운 선을 사용하세요. ";
      break;
    case 5:
      prompt += " 매우 두껍고 굵은 선을 사용하세요. ";
      break;
    default:
      prompt += " 중간 두께의 선을 사용하세요. ";
  }
  return prompt;
};

export const generateVectorImage = async (
  base64ImageData: string,
  mimeType: string,
  style: VectorStyle,
  thickness: number,
  shadingLevel: ShadingLevel,
  removeBackground: boolean,
  outlineLevel: OutlineLevel,
  watercolorVariant: WatercolorVariant
): Promise<string[]> => {
  
  const styleInstruction = getStylePrompt(style, shadingLevel, removeBackground, watercolorVariant);
  const stickerInstruction = removeBackground ? getStickerEffectPrompt(outlineLevel) : "";

  const promptSections = [
    "주어진 이미지를 다음 지침에 따라 변환하세요.",
    `### **스타일 지침**\n${styleInstruction}`
  ];

  const editInstruction = getEditPrompt(style, thickness);
  promptSections.push(`### **선 두께 지침**\n${editInstruction}`);

  if (stickerInstruction) {
    promptSections.push(`### **효과 지침**\n${stickerInstruction}`);
  }

  if (style === VectorStyle.WATERCOLOR) {
    promptSections.push(`### **제외할 스타일**\n결과물은 절대 사실적인 사진(photorealistic, photo)이거나 3D 렌더링(3D render)이어서는 안 됩니다.`);
  }

  const outputRules = [
    "-   **중요**: 최종 응답은 반드시 생성된 이미지만 포함해야 합니다.",
    "-   텍스트 설명, 제목, 주석 등 어떤 종류의 텍스트도 응답에 포함해서는 안 됩니다.",
    "-   오직 이미지 데이터만 반환하세요."
  ];

  if (removeBackground) {
    outputRules.push("- 배경은 반드시 투명해야 합니다.");
  }

  promptSections.push(`### 출력 규칙 ###\n${outputRules.join('\n')}`);
  
  const prompt = promptSections.join('\n\n').trim();

  const generationConfig = {
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
          },
        },
        {
          text: prompt,
        },
      ],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  };

  const imageDatas: string[] = [];
  let firstError: Error | null = null;

  for (let i = 0; i < 4; i++) {
    try {
      const response = await ai.models.generateContent(generationConfig);
      const candidates = response.candidates;

      if (candidates && candidates.length > 0) {
        const candidate = candidates[0];
        if (candidate.finishReason === 'STOP' || !candidate.finishReason) {
          const imagePart = candidate.content?.parts?.find(p => p.inlineData);
          if (imagePart?.inlineData?.data) {
            imageDatas.push(imagePart.inlineData.data);
            continue; // Go to the next iteration of the loop
          }
        }
        if (!firstError && candidate.finishReason) {
          firstError = new Error(`생성 실패 원인: ${candidate.finishReason}.`);
        }
      }
      if (!firstError && response.text) {
        firstError = new Error(response.text);
      }
    } catch (err) {
      if (!firstError) {
        firstError = err instanceof Error ? err : new Error(String(err));
      }
    }
  }

  if (imageDatas.length > 0) {
    return imageDatas;
  }
  
  if (firstError) {
      throw firstError;
  }

  throw new Error("이미지가 생성되지 않았습니다. 모델이 요청을 거부했을 수 있습니다.");
};