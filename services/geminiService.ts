
// FIX: Import `GenerateContentResponse` for typing API responses.
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { VectorStyle, ShadingLevel, BackgroundStyle } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Retries an API call with exponential backoff if a rate limit error occurs.
 * @param apiCall The async function to call.
 * @param maxRetries The maximum number of retries.
 * @param initialDelay The initial delay in milliseconds.
 * @returns The result of the API call.
 */
const withRetry = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 2000 // 2 seconds
): Promise<T> => {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await apiCall();
    } catch (error) {
      attempt++;
      const isRateLimitError =
        error instanceof Error &&
        (error.message.includes('429') ||
         error.message.includes('RESOURCE_EXHAUStED') ||
         error.message.includes('rate limit'));

      if (isRateLimitError && attempt < maxRetries) {
        const delay = initialDelay * Math.pow(2, attempt - 1);
        console.warn(`Rate limit exceeded. Retrying in ${delay / 1000}s... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // Not a rate limit error, or max retries reached, so re-throw.
        throw error;
      }
    }
  }
  // This line should not be reachable if the logic is correct, but it satisfies TypeScript.
  throw new Error("Max retries reached. Could not complete the request.");
};


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

const getStylePrompt = (style: VectorStyle, shadingLevel: ShadingLevel, backgroundStyle: BackgroundStyle, backgroundColor: string): string => {
  let backgroundInstruction: string;
  if (backgroundStyle === BackgroundStyle.COLOR) {
      backgroundInstruction = `원본 이미지의 배경을 제거하고, 지정된 단색 배경(${backgroundColor})으로 교체해주세요. 주 피사체는 중심에 선명하게 유지되어야 합니다. 원본의 구도는 유지하되, 배경만 단색으로 변경해주세요. 매우 중요: 최종 이미지에는 색상표, 색상 견본, UI 요소, 텍스트, 숫자 등이 절대로 포함되어서는 안 됩니다. 오직 스타일이 적용된 피사체와 단색 배경만 있어야 합니다. 만약 원본 이미지의 배경이 이미 투명하다면, 주 피사체에만 스타일을 적용하고 배경은 ${backgroundColor} 색상으로 채워주세요.`;
  } else { // BackgroundStyle.ORIGINAL
      backgroundInstruction = "만약 원본 이미지에 배경이 있다면, 이미지 전체(배경 포함)를 요청된 스타일로 변환하세요. 원본 이미지의 구도와 전체적인 분위기는 유지하되, 모든 요소를 선택된 스타일로 재해석해주세요. 배경을 제거하거나 단색으로 만들지 마세요. 만약 원본 이미지의 배경이 투명하다면, 주 피사체에만 스타일을 적용하고 투명 배경은 그대로 유지해주세요. 새로운 배경을 추가하지 마세요.";
  }

  switch (style) {
    case VectorStyle.GHIBLI:
      return `원본 사진을 단순 모방하는 것이 아니라, 스튜디오 지브리 애니메이션의 한 장면으로 완전히 재창조해주세요. 지브리 특유의 손으로 그린 듯한 질감, 부드럽고 따뜻한 색감, 서정적이고 꿈꾸는 듯한 분위기를 살려야 합니다. 인물은 감정이 풍부하게 표현되어야 합니다. 만약 원본에 배경이 있다면, 그 배경 또한 디테일이 살아있는 아름다운 수채화 스타일로 그려주세요. 원본의 구도는 참고하되, 사실적인 묘사는 피하고 예술적인 해석을 극대화해주세요. 결과물은 사진이 아닌, 아름다운 애니메이션 아트워크여야 합니다. ${backgroundInstruction}`;
    case VectorStyle.PIXAR:
      return `원본 이미지를 픽사 애니메이션 영화에 등장할 법한 매력적인 3D 캐릭터 아트로 완전히 재창조해주세요. 사실적인 묘사는 피하고, 픽사 특유의 과장되고 감정이 풍부한 표현, 크고 생동감 있는 눈, 부드럽고 둥근 형태를 강조해야 합니다. 피부, 머리카락, 의상의 질감은 사실적이기보다는 만지고 싶을 만큼 매력적이고 스타일리시하게 표현해주세요. 따뜻하고 생생한 색감과 영화적인 조명을 사용하여 캐릭터에 생명력을 불어넣으세요. 최종 결과물은 사진이 아닌, 사랑스러운 3D 애니메이션 캐릭터 아트여야 합니다. ${backgroundInstruction}`;
    case VectorStyle.SKETCH: {
      const baseSketchPrompt = `대상의 깨끗한 흑백 라인 아트 스케치. 대상의 주요 특징과 형태를 정확하게 보존하세요.`;
      return `${baseSketchPrompt} ${getShadingPrompt(shadingLevel)} ${backgroundInstruction}`;
    }
    case VectorStyle.ILLUSTRATION:
        return `원본 이미지를 현대적인 벡터 초상화 일러스트레이션으로 변환해주세요. 이 스타일은 명확하고 깔끔한 라인, 플랫한 셀 셰이딩(단색 그림자), 그리고 분리된 색상 블록을 특징으로 합니다. 그라데이션 효과는 절대 사용하지 마세요. 가장 중요한 것은 원본 이미지의 주요 형태와 구조를 변경하지 않고 그대로 유지하는 것입니다. 최종 결과물은 세련되고 미니멀한 벡터 아트여야 합니다. ${backgroundInstruction}`;
    default:
      return `벡터 스타일 이미지. ${backgroundInstruction}`;
  }
};

export const generateVectorImage = async (
  base64ImageData: string,
  mimeType: string,
  style: VectorStyle,
  shadingLevel: ShadingLevel,
  backgroundStyle: BackgroundStyle,
  backgroundColor: string,
): Promise<string[]> => {
  
  const styleInstruction = getStylePrompt(style, shadingLevel, backgroundStyle, backgroundColor);
  
  const promptSections = [
    "주어진 이미지를 다음 지침에 따라 변환하세요.",
    `### **스타일 지침**\n${styleInstruction}`
  ];

  if (style !== VectorStyle.SKETCH) {
    promptSections.push(`### **선 두께 지침**\n중간 두께의 선을 사용하세요.`);
  }

  if (style === VectorStyle.GHIBLI || style === VectorStyle.PIXAR) {
    promptSections.push(`### **제외할 스타일**\n결과물은 절대 사실적인 사진(photorealistic, photo)이거나 3D 렌더링(3D render)이어서는 안 됩니다.`);
  }

  const outputRules = [
    "-   **중요**: 최종 응답은 반드시 생성된 이미지만 포함해야 합니다.",
    "-   텍스트 설명, 제목, 주석 등 어떤 종류의 텍스트도 응답에 포함해서는 안 됩니다.",
    "-   오직 이미지 데이터만 반환하세요."
  ];

  promptSections.push(`### 출력 규칙 ###\n${outputRules.join('\n')}`);
  
  const prompt = promptSections.join('\n\n').trim();

  // The 'gemini-2.5-flash-image' model does not support multiple candidates.
  // To generate 4 images, we will make 4 parallel API calls.
  const generationRequestPayload = {
    model: 'gemini-2.5-flash-image',
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
      responseModalities: [Modality.IMAGE],
    },
  };

  const apiCall = () => ai.models.generateContent(generationRequestPayload);
  // FIX: Explicitly set the generic type for the `withRetry` function to ensure the response object is correctly typed.
  const imagePromises = Array(4).fill(null).map(() => withRetry<GenerateContentResponse>(apiCall));

  try {
    const responses = await Promise.all(imagePromises);

    const images = responses
      .map(response => {
        const candidate = response.candidates?.[0];
        if (candidate && (candidate.finishReason === 'STOP' || !candidate.finishReason)) {
          const imagePart = candidate.content?.parts?.find(p => p.inlineData);
          return imagePart?.inlineData?.data || null;
        }
        if (candidate?.finishReason) {
            console.warn(`A candidate failed with reason: ${candidate.finishReason}`);
        } else if (response.text) {
             console.warn(`Image generation failed with text response: ${response.text}`);
        }
        return null;
      })
      .filter((image): image is string => image !== null);

    if (images.length > 0) {
      return images;
    }
    
    // If no images were successfully generated, throw an error based on the first response
    const firstResponse = responses[0];
    if (firstResponse) {
        if (firstResponse.candidates?.[0]?.finishReason) {
          throw new Error(`생성 실패 원인: ${firstResponse.candidates[0].finishReason}.`);
        }
        if (firstResponse.text) {
          throw new Error(firstResponse.text);
        }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("이미지 생성 중 알 수 없는 오류가 발생했습니다.");
  }

  throw new Error("이미지가 생성되지 않았습니다. 모델이 요청을 거부했을 수 있습니다.");
};
