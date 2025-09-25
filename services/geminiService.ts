
import { GoogleGenAI, Modality } from "@google/genai";
import { VectorStyle, ShadingLevel, GaussianBlurLevel } from '../types';

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

const getGaussianBlurPrompt = (level: GaussianBlurLevel): string => {
  switch (level) {
    case GaussianBlurLevel.LIGHT: return "피사체에 미묘하고 부드러운 가우시안 블러를 적용하여 은은하게 부드러운 효과를 줍니다.";
    case GaussianBlurLevel.MEDIUM: return "피사체에 중간 강도의 가우시안 블러를 적용하여 디테일을 부드럽게 하고 몽환적인 느낌을 줍니다.";
    case GaussianBlurLevel.HEAVY: return "피사체에 강하고 확산되는 가우시안 블러를 적용하여 영묘하고 추상적인 분위기를 연출합니다.";
    default: return "";
  }
};

const getStylePrompt = (style: VectorStyle, shadingLevel: ShadingLevel, gaussianBlurLevel: GaussianBlurLevel): string => {
  const coreInstructions = "오직 이미지의 주요 대상에만 집중하세요. 대상 자체만 변환하고, 배경, 주변 물체, 또는 무의미한 장식적 패턴을 추가하지 마세요. 최종 결과물 이미지는 반드시 단색의 흰색 배경이어야 합니다.";

  switch (style) {
    case VectorStyle.CARTOON:
      return `깨끗하고 단색의 선과 평면적인 색상을 가진 생동감 있고 현대적인 만화 스타일. 원본 이미지의 색상 팔레트를 충실하게 반영하여 다채로운 결과물을 만드세요. 원본 사진 속 대상의 주요 특징과 특성을 보존하는 것이 중요합니다. 원본의 구도와 포즈를 유지하세요. ${coreInstructions}`;
    case VectorStyle.SKETCH: {
      const baseSketchPrompt = `대상의 깨끗한 흑백 라인 아트 스케치. 대상의 주요 특징과 형태를 정확하게 보존하세요.`;
      return `${baseSketchPrompt} ${getShadingPrompt(shadingLevel)} ${coreInstructions}`;
    }
    case VectorStyle.BLACK_AND_WHITE: {
      const basePrompt = "이미지를 톤이 반전되고 채도가 없는 초현실적인 흑백 예술 작품으로 변환하세요.";
      return `${basePrompt} ${getGaussianBlurPrompt(gaussianBlurLevel)} ${coreInstructions}`;
    }
    default:
      return `벡터 스타일 이미지. ${coreInstructions}`;
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
      if (style === VectorStyle.CARTOON) {
        prompt += "대상체의 형태가 왜곡되지 않도록 주의하세요. ";
      }
      break;
    default:
      prompt += " 중간 두께의 선을 사용하세요. ";
  }
  return prompt;
};

const getOutlinePrompt = (distance: number): string => {
  const distanceInt = Math.round(distance);
  if (distanceInt === 0) {
    return "외곽선을 추가하지 마세요.";
  }

  let prompt = `
주요 대상 주위에 외곽선을 생성하세요.

### **외곽선 규칙**
1.  **단 하나의 외곽선**: 대상 주위에 **단 하나의**, 연속적인 외곽선만 생성해야 합니다.
2.  **색상**: 외곽선은 **단색 검은색**이어야 합니다.
3.  **두께**: 외곽선 자체의 두께는 **'중간' 두께로 일정**해야 합니다. 이 두께는 아래의 '오프셋 거리' 설정에 영향을 받지 않습니다.
4.  **가장 중요한 규칙: 균일한 오프셋(간격) 거리**:
    -   이것이 가장 중요한 지침입니다. 외곽선은 대상의 모든 윤곽선에서 **정확히 동일한 거리만큼 떨어져** 있어야 합니다.
    -   대상과 외곽선 사이의 빈 공간(간격)은 전체 둘레에 걸쳐 완벽하게 균일해야 합니다.
    -   외곽선은 대상의 원래 윤곽선과 절대 겹치거나 닿아서는 안 됩니다.
    -   외곽선은 대상의 실제 형태(모든 곡선, 모서리 등)를 세심하게 따라야 하며, 형태를 단순화해서는 안 됩니다.

### **오프셋 거리 설정**
슬라이더 값(${distanceInt})은 대상과 외곽선 사이의 **간격의 크기**만을 제어합니다. 값이 클수록 간격이 넓어집니다.

- **요청된 오프셋 거리**:
`.trim();

  let distanceDescription = "";
  switch (distanceInt) {
    case 1:
      distanceDescription = "**매우 가까운 거리**: 대상의 윤곽선에 매우 가깝지만, 명확하게 분리된 얇고 일관된 간격을 유지해야 합니다.";
      break;
    case 2:
      distanceDescription = "**가까운 거리**: 대상의 윤곽선으로부터 눈에 띄는 작은 간격을 일관되게 두고 그려야 합니다.";
      break;
    case 3:
      distanceDescription = "**중간 거리**: 대상의 윤곽선으로부터 뚜렷한 중간 정도의 거리를 일관되게 유지해야 합니다.";
      break;
    case 4:
      distanceDescription = "**먼 거리**: 대상의 윤곽선으로부터 상당한 거리를 둔, 넓은 간격을 일관되게 그려야 합니다.";
      break;
    case 5:
      distanceDescription = "**아주 먼 거리**: 대상의 윤곽선으로부터 매우 멀리 떨어진, 아주 넓은 간격을 일관되게 그려야 합니다.";
      break;
    default:
      return "외곽선을 추가하지 마세요.";
  }
  return `${prompt} ${distanceDescription}`;
};


export const generateVectorImage = async (
  base64ImageData: string,
  mimeType: string,
  style: VectorStyle,
  thickness: number,
  shadingLevel: ShadingLevel,
  outlineDistance: number,
  gaussianBlurLevel: GaussianBlurLevel
): Promise<string> => {
  
  const styleInstruction = getStylePrompt(style, shadingLevel, gaussianBlurLevel);
  let prompt: string;

  if (style === VectorStyle.BLACK_AND_WHITE) {
    prompt = `
주어진 이미지를 다음 지침에 따라 변환하세요.

### **스타일 지침**
${styleInstruction}

### 출력 규칙 ###
-   **중요**: 최종 응답은 반드시 생성된 이미지만 포함해야 합니다.
-   텍스트 설명, 제목, 주석 등 어떤 종류의 텍스트도 응답에 포함해서는 안 됩니다.
-   오직 이미지 데이터만 반환하세요.
`.trim();
  } else {
    const editInstruction = getEditPrompt(style, thickness);
    const outlineInstruction = getOutlinePrompt(outlineDistance);

    prompt = `
주어진 이미지를 다음의 명확한 단계별 프로세스에 따라 변환하세요.

### **1단계: 주요 대상 생성**
먼저, 아래의 '스타일'과 '선 두께' 지침에 따라 이미지의 주요 대상만 벡터 아트로 변환하세요. 이 단계에서는 아래의 '2단계: 최종 외곽선 추가' 지침을 완전히 무시하세요.

- **스타일 지침**: ${styleInstruction}
- **선 두께 지침**: ${editInstruction}

### **2단계: 최종 외곽선 추가**
1단계에서 생성된 벡터 아트 주위에, 아래의 '외곽선' 지침에 따라 최종 외곽선을 추가하세요.

- **외곽선 지침**: ${outlineInstruction}

**매우 중요**: 외곽선은 주요 대상의 스타일에 영향을 주지 않는, 완전히 독립적이고 별개인 요소입니다. 예를 들어, '스케치' 스타일을 생성할 때 외곽선 자체는 스케치처럼 그려져서는 안 되며, '만화' 스타일을 생성할 때 외곽선이 만화의 일부처럼 보여서도 안 됩니다. 외곽선은 항상 지침에 명시된 대로 깨끗하고 일정한 단색 선이어야 합니다.


### 출력 규칙 ###
-   **중요**: 최종 응답은 반드시 생성된 이미지만 포함해야 합니다.
-   텍스트 설명, 제목, 주석 등 어떤 종류의 텍스트도 응답에 포함해서는 안 됩니다.
-   오직 이미지 데이터만 반환하세요.
`.trim();
  }


  const response = await ai.models.generateContent({
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
  });

  const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

  if (imagePart?.inlineData) {
    return imagePart.inlineData.data;
  }
  
  const textReason = response.text;
  if (textReason) {
    throw new Error(textReason);
  }

  const candidate = response.candidates?.[0];
  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
    throw new Error(`생성 실패 원인: ${candidate.finishReason}.`);
  }

  throw new Error("이미지가 생성되지 않았습니다. 모델이 요청을 거부했을 수 있습니다.");
};