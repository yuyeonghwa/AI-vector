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
  const coreStyleInstructions = "원본 사진 속 대상의 주요 특징과 특성을 보존하는 것이 중요합니다. 원본의 구도와 포즈를 유지하세요.";

  switch (style) {
    case VectorStyle.CARTOON:
      return `깨끗하고 단색의 선과 평면적인 색상을 가진 생동감 있고 현대적인 만화 스타일. 원본 이미지의 색상 팔레트를 충실하게 반영하여 다채로운 결과물을 만드세요. ${coreStyleInstructions} ${coreInstructions}`;
    case VectorStyle.GHIBLI:
      return `스튜디오 지브리 애니메이션의 서정적인 스타일로 이미지를 변환하세요. 부드러운 색상 팔레트, 섬세한 선, 그리고 감성적인 분위기를 강조하여, 마치 손으로 그린 듯한 따뜻한 느낌을 살려주세요. 인물의 표정은 순수하고 아련하게 표현하여 지브리 특유의 감성을 담아내세요. ${coreStyleInstructions} ${coreInstructions}`;
    case VectorStyle.PIXAR:
      return `픽사 애니메이션 스튜디오의 3D 캐릭터 스타일로 이미지를 변환하세요. 캐릭터의 눈을 크고 표현력 있게 만들고, 재질의 질감을 섬세하게 묘사해주세요. 극적인 조명 효과를 사용하여 입체감과 생동감을 극대화하여 CGI 애니메이션의 느낌을 살려주세요. ${coreStyleInstructions} ${coreInstructions}`;
    case VectorStyle.THREE_D:
      return `생생한 색감과 부드러운 그림자가 특징인 사실적인 3D 렌더링 스타일로 이미지를 변환하세요. 아이소메트릭 뷰(isometric view)를 적용하여 독특한 시점을 표현하고, 매우 정교하고 디테일을 살려주세요. ${coreStyleInstructions} ${coreInstructions}`;
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

const getStickerEffectPrompt = (distance: number): string => {
  const distanceInt = Math.round(distance);
  if (distanceInt === 0) {
    return "스티커 효과를 추가하지 마세요.";
  }

  let prompt = `
주요 대상 주위에 흰색 스티커 배경 효과를 생성하세요. 마치 그래픽 편집 소프트웨어에서 '오프셋 패스(Offset Path)' 효과를 적용하여 흰색 배경을 만드는 것처럼 정교하게 작업해야 합니다.

### **작업 과정 (중요)**
1.  **정밀한 대상 선택**: 먼저, 이미지의 주요 대상을 완벽하게 선택합니다. 마치 '빠른 선택 도구(Quick Selection Tool)'나 '펜 도구(Pen Tool)'를 사용하여 대상의 실루엣을 따라 아주 정밀한 선택 영역을 만드는 것과 같습니다. 대상의 모든 세밀한 굴곡과 형태를 놓치지 않아야 합니다.
2.  **경로 확장**: 그 다음, 생성한 선택 영역의 경로를 바깥쪽으로 균일하게 확장합니다. 아래 '여백 크기 설정'에 지정된 만큼 모든 지점에서 정확히 동일한 거리만큼 확장해야 합니다.
3.  **흰색 배경 생성**: 마지막으로, 확장된 경로의 내부 전체를 채워서 대상 뒤에 위치할 단일의 흰색 모양을 만듭니다.

### **스티커 효과 규칙**
1.  **단일 실루엣 (가장 중요)**: 이미지 속 모든 주요 대상(사람, 동물 등)을 **하나의 단일 그룹**으로 취급하여, 그룹 전체를 감싸는 **하나의 흰색 배경 모양만** 생성해야 합니다. 개별 인물이나 사물 주위에 별도의 흰색 모양을 만들어서는 안 됩니다. 그룹 내부의 작은 공간이나 빈틈(예: 팔과 몸 사이)은 무시하고, 그룹의 가장 바깥쪽 윤곽선만 따라야 합니다. 최종 결과물은 마치 하나의 큰 스티커와 같은 모양이어야 합니다.
2.  **형태**: 배경 모양의 외곽선은 대상의 윤곽을 **단순화하지 않고**(예: 곡선을 직선으로 만들지 않고) **부드럽고 자연스럽게** 따라야 합니다. 최종 외곽선은 날카로운 모서리 없이 매끄러워야 합니다.
3.  **균일한 간격**: 대상과 흰색 배경 모양의 가장자리 사이 간격은 모든 지점에서 **완벽하게 동일**해야 합니다. 배경이 대상에 닿거나, 특정 부분에서 더 가깝거나 멀어져서는 안 됩니다.
4.  **단일 및 연속성**: 대상 주위에 **단 하나의**, 끊김 없는 배경 모양만 생성해야 합니다.
5.  **색상 및 채우기**: 확장된 경로로 만들어진 모양을 **순수한 단색 흰색(#FFFFFF)으로 채웁니다**. 이 흰색 모양의 테두리에는 **어떠한 선도 추가해서는 안 됩니다**. 최종 결과는 마치 아트웍이 깔끔한 흰색 종이 위에 놓인 것처럼 보여야 합니다.

### **피해야 할 결함 (아주 중요)**
아래와 같은 결함이 있는 이미지는 **절대 생성해서는 안 됩니다**.
-   **개별 배경**: 그룹 전체가 아닌, 개별 인물이나 사물 주위에 흰색 배경이 생성되는 것.
-   **내부 공간 침범**: 대상의 외부가 아닌, 내부의 빈 공간(예: 팔과 몸 사이)에 흰색 배경이 채워지는 것.
-   **불규칙한 간격**: 흰색 배경이 대상에 너무 가깝거나, 닿거나, 특정 부분에서 울퉁불퉁하게 변하는 것. 간격은 기계적으로 정밀하고 일정해야 합니다.
-   **각진/직선화된 외곽선**: 배경 모양의 가장자리가 부드러운 곡선 대신 각진 선이나 직선으로 단순화되는 것. 원본 대상의 모든 곡률을 충실히 반영해야 합니다.
-   **끊어진 배경**: 흰색 배경 모양이 여러 조각으로 나뉘는 것. 반드시 하나의 닫힌 모양이어야 합니다.
-   **지저분한 가장자리**: 배경의 가장자리가 흐릿하거나, 얼룩이 있는 것처럼 보이는 것. 가장자리는 깨끗하고 선명해야 합니다.
-   **잘못된 위치**: 배경 모양이 대상을 완전히 감싸지 않거나, 이미지의 일부가 잘려나가는 것.

### **여백 크기 설정**
슬라이더 값(${distanceInt})은 대상과 흰색 배경 모양의 가장자리 사이의 **여백 크기**만을 제어합니다. 값이 클수록 여백이 넓어집니다.

- **요청된 여백 크기**:
`.trim();

  let distanceDescription = "";
  switch (distanceInt) {
    case 1:
      distanceDescription = "**매우 좁은 여백**: 대상의 윤곽선에 매우 가깝지만, 명확하게 분리된 얇고 일관된 흰색 여백을 유지해야 합니다.";
      break;
    case 2:
      distanceDescription = "**좁은 여백**: 대상의 윤곽선으로부터 눈에 띄는 작은 흰색 여백을 일관되게 두고 생성해야 합니다.";
      break;
    case 3:
      distanceDescription = "**중간 여백**: 대상의 윤곽선으로부터 뚜렷한 중간 정도의 흰색 여백을 일관되게 유지해야 합니다.";
      break;
    case 4:
      distanceDescription = "**넓은 여백**: 대상의 윤곽선으로부터 상당한 거리를 둔, 넓은 흰색 여백을 일관되게 생성해야 합니다.";
      break;
    case 5:
      distanceDescription = "**아주 넓은 여백**: 대상의 윤곽선으로부터 매우 멀리 떨어진, 아주 넓은 흰색 여백을 일관되게 생성해야 합니다.";
      break;
    default:
      return "스티커 효과를 추가하지 마세요.";
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
): Promise<string[]> => {
  
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
    const stickerInstruction = getStickerEffectPrompt(outlineDistance);

    prompt = `
주어진 이미지를 다음의 명확한 단계별 프로세스에 따라 변환하세요.

### **1단계: 주요 대상 생성**
먼저, 아래의 '스타일'과 '선 두께' 지침에 따라 이미지의 주요 대상만 벡터 아트로 변환하세요. 이 단계에서는 아래의 '2단계: 최종 스티커 효과 추가' 지침을 완전히 무시하세요.

- **스타일 지침**: ${styleInstruction}
- **선 두께 지침**: ${editInstruction}

### **2단계: 최종 스티커 효과 추가**
1단계에서 생성된 벡터 아트 뒤에, 아래의 '스티커 효과' 지침에 따라 최종 스티커 효과를 추가하세요.

- **스티커 효과 지침**: ${stickerInstruction}

**매우 중요**: 스티커 효과는 주요 대상의 스타일에 영향을 주지 않는, 완전히 독립적이고 별개인 배경 요소입니다. 이 흰색 배경 모양은 항상 깨끗하고 단색이어야 하며, 대상의 스타일(예: '스케치' 또는 '만화')의 영향을 받아서는 안 됩니다.


### 출력 규칙 ###
-   **중요**: 최종 응답은 반드시 생성된 이미지만 포함해야 합니다.
-   텍스트 설명, 제목, 주석 등 어떤 종류의 텍스트도 응답에 포함해서는 안 됩니다.
-   오직 이미지 데이터만 반환하세요.
`.trim();
  }

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