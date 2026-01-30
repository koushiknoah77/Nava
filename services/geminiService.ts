
import { GoogleGenAI, Type } from "@google/genai";
import { PlanData, Difficulty } from "../types";

// Always use a fresh instance to ensure latest API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Advanced Image Processing: Optimized for high-fidelity vision ingestion.
 */
const processImage = async (base64Str: string): Promise<string> => {
  if (base64Str.length < 1024 * 512) return base64Str;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 1600; 
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > MAX_SIZE) {
          height = Math.round(height * (MAX_SIZE / width));
          width = MAX_SIZE;
        }
      } else {
        if (height > MAX_SIZE) {
            width = Math.round(width * (MAX_SIZE / height));
            height = MAX_SIZE;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      } else {
        resolve(base64Str);
      }
    };
    img.src = base64Str;
  });
};

const parseDataUrl = (dataUrl: string) => {
  const parts = dataUrl.split(',');
  const header = parts[0];
  const data = parts[1];
  const mimeMatch = header.match(/:(.*?);/);
  return { mimeType: mimeMatch ? mimeMatch[1] : 'image/jpeg', data };
};

/**
 * Precision Materials Audit: Identifies object with simple terms.
 */
export const identifyObject = async (imageSrc: string): Promise<string> => {
  const ai = getAI();
  const processedImage = await processImage(imageSrc);
  const { mimeType, data } = parseDataUrl(processedImage);
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        { inlineData: { mimeType, data } },
        { text: "Identify the main item in this photo. Is it a material (like Paper, Wood), an electronic component, code on a screen, or a UI design? Return ONLY the specific name (e.g., 'Notebook Paper', 'React Code', 'Arduino Uno', 'Website Design')." }
      ]
    }]
  });

  return response.text?.trim() || "Object";
};

/**
 * Categorical Feasibility-First Pathway Generation.
 */
export const generateSuggestions = async (objectName: string, scannedImage: string, referenceImage?: string): Promise<string[]> => {
  const ai = getAI();
  const parts: any[] = [];
  
  const processedScanned = await processImage(scannedImage);
  const scanned = parseDataUrl(processedScanned);
  
  // Contextual prompt setup
  parts.push({ text: `I have scanned this: "${objectName}".` });
  parts.push({ inlineData: { mimeType: scanned.mimeType, data: scanned.data } });

  let systemInstruction = `You are a Master Maker and Creative Engineer.
  Your goal is to suggest 4 distinct project ideas based on the scanned item.
  
  Create suggestions that span 4 difficulty levels:
  1. Easy / Quick Start
  2. Medium / Skill Builder
  3. Hard / Advanced
  4. Expert / Tech-Integrated

  Output Requirements:
  - Use simple, exciting English.
  - Max 5 words per suggestion.
  - Return purely a JSON array of 4 strings.`;

  if (referenceImage) {
    const processedRef = await processImage(referenceImage);
    const ref = parseDataUrl(processedRef);
    parts.push({ text: `Target Goal Reference Image:` });
    parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } });
    
    // Override instruction if reference exists
    systemInstruction = `You are a Creative Technologist.
    The user has a Source Material (first image) and a Target Goal (second image).
    
    1. ANALYZE the Target Goal image. What object is it? (e.g. Paper Airplane).
    2. GENERATE 4 distinct, creative Project Names for this object.
    
    RULES:
    - RETURN ONLY NOUN PHRASES (e.g. "Supersonic Glider").
    - DO NOT return verbs or instructions (e.g. "Fold the paper" is BANNED).
    - If it looks like steps, you failed.
    - Max 4 words per title.
    
    Example Output:
    ["Delta Wing Interceptor", "Long-Range Glider", "Stunt Plane Mark IV", "Classic Dart"]`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ parts }],
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING }
      }
    }
  });

  try {
    const suggestions = JSON.parse(response.text || "[]");
    return suggestions.length > 0 ? suggestions : ["Quick Start", "Skill Builder", "Advanced Build", "Expert Project"];
  } catch (e) {
    return ["Quick Fix", "Improvement", "New Project", "Complex Build"];
  }
};

/**
 * Gemini 3 Pro Plan Engine.
 */
export const generateCustomPlan = async (
  scannedImage: string,
  userCommand: string,
  referenceImage?: string
): Promise<PlanData> => {
  const ai = getAI();
  const processedScanned = await processImage(scannedImage);
  const scanned = parseDataUrl(processedScanned);
  
  const parts: any[] = [
    { text: "Source material what I have now:" },
    { inlineData: { mimeType: scanned.mimeType, data: scanned.data } }
  ];

  if (referenceImage) {
    const processedRef = await processImage(referenceImage);
    const ref = parseDataUrl(processedRef);
    parts.push({ text: "Reference Target Goal:" });
    parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } });
  }

  parts.push({
    text: `Command: "${userCommand}"
    
    You are a Master Maker. Build a highly detailed step-by-step plan.
    
    CRITICAL INSTRUCTION GUIDELINES:
    1. Break down steps so a beginner cannot fail. If a step involves complex folding or wiring, split it.
    2. Physical Accuracy: Be extremely precise about where to fold, cut, or connect.
    3. Use simple, direct English. No fluff.
    4. Verification: For every step, describe exactly what the user should visually see to know they did it right.
    
    Context:
    - If code/software: Focus on logic, UI, and testing steps.
    - If design/UI: Focus on layout, colors, and assets.
    - If electronics/hardware: Focus on wiring, components, and code.
    - If physical: Focus on tools, measuring, and assembly.
    `
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          analysis: { type: Type.STRING },
          feasibility: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ["Yes", "Partially", "Not Safe", "No"] },
              explanation: { type: Type.STRING }
            },
            required: ["status", "explanation"]
          },
          changes: {
            type: Type.OBJECT,
            properties: {
              add: { type: Type.ARRAY, items: { type: Type.STRING } },
              remove: { type: Type.ARRAY, items: { type: Type.STRING } },
              modify: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["add", "remove", "modify"]
          },
          steps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING, description: "Detailed instruction for this step" },
                verificationCriteria: { type: Type.STRING, description: "Visual check to confirm step completion" }
              },
              required: ["title", "description", "verificationCriteria"]
            }
          },
          safetyWarning: { type: Type.ARRAY, items: { type: Type.STRING } },
          alternatives: { type: Type.ARRAY, items: { type: Type.STRING } },
          estimatedTime: { type: Type.STRING },
          difficulty: { type: Type.STRING, enum: ["Easy", "Medium", "Hard"] }
        },
        required: ["title", "description", "analysis", "feasibility", "changes", "steps", "safetyWarning", "estimatedTime", "difficulty"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as PlanData;
};

export const verifyStepCompletion = async (
  stepTitle: string,
  stepInstruction: string,
  userImage: string
): Promise<{ success: boolean; feedback: string }> => {
  const ai = getAI();
  const processedImage = await processImage(userImage);
  const { mimeType, data } = parseDataUrl(processedImage);

  const prompt = `Act as a helpful project checker.
  Goal: "${stepTitle}"
  Instruction: "${stepInstruction}"
  
  Check the photo. Are they done?
  Use VERY SIMPLE English. 
  If done, say: "Perfect! Ready for next step."
  If not done, say why in 1 simple sentence.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{
      parts: [
        { text: prompt },
        { inlineData: { mimeType, data } }
      ]
    }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          success: { type: Type.BOOLEAN },
          feedback: { type: Type.STRING }
        },
        required: ["success", "feedback"]
      }
    }
  });

  return JSON.parse(response.text || '{"success":false, "feedback":"Please show me the work clearly."}');
};

export const getTroubleshootingHelp = async (project: string, step: string, issue: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ text: `Project: "${project}". Step: "${step}". User Issue: "${issue}". Provide a direct, actionable fix in 2 sentences max.` }]
  });
  return response.text?.trim() || "Try it again carefully.";
};

export const askStepQuestion = async (project: string, stepTitle: string, stepInstruction: string, question: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ text: `
      Context: User is building "${project}".
      Current Step: "${stepTitle}" - "${stepInstruction}".
      User Question: "${question}"
      
      Answer the user's question specifically about this step. Keep it encouraging, conversational, short, and helpful. Max 3 sentences.
    ` }]
  });
  return response.text?.trim() || "I'm not sure, but try following the instructions carefully.";
};

export const translateContent = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en') return text;
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: `Translate the following text to ${targetLang}. Return ONLY the translation, no explanation. Text: "${text}"` }]
    });
    return response.text?.trim() || text;
};
