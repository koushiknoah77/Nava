
import { GoogleGenAI, Type } from "@google/genai";
import { PlanData } from "../types";

// Always use a fresh instance to ensure latest API key
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip Markdown code blocks from JSON responses
const cleanJSON = (text: string): string => {
  if (!text) return "[]";
  return text.replace(/```json\s*|\s*```/g, '').trim();
};

/**
 * Advanced Image Processing: Optimized for high-fidelity vision ingestion.
 * Increased resolution limit for better detection.
 */
const processImage = async (base64Str: string): Promise<string> => {
  if (base64Str.length < 1024 * 512) return base64Str;

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const MAX_SIZE = 1920; // Increased for better detail detection
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
        resolve(canvas.toDataURL('image/jpeg', 0.95)); // Higher quality compression
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
 * Precision Materials Audit: Identifies object with simple, understandable terms.
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
        { text: `
          Look at this image. Identify the main object.
          
          RULES:
          1. Use SIMPLE, EVERYDAY English. (e.g., say "Cardboard Box" instead of "Corrugated Container").
          2. Avoid technical model numbers or scientific names.
          3. Return ONLY the name. Nothing else.
          ` 
        }
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
  parts.push({ text: `I have this item: "${objectName}".` });
  parts.push({ inlineData: { mimeType: scanned.mimeType, data: scanned.data } });

  let systemInstruction = `You are a creative, fun workshop buddy.
  Goal: Suggest 4 cool, distinct project ideas for this item.
  
  DIFFICULTY LEVELS:
  1. Easy (15 mins)
  2. Medium (1 hour)
  3. Hard (Weekend project)
  4. Expert (Tech-integrated)

  LANGUAGE RULES:
  - Use extremely SIMPLE, EXCITING English.
  - No complicated words.
  - Max 5 words per title.
  - Return purely a JSON array of 4 strings.`;

  if (referenceImage) {
    const processedRef = await processImage(referenceImage);
    const ref = parseDataUrl(processedRef);
    parts.push({ text: `I want to make something like this:` });
    parts.push({ inlineData: { mimeType: ref.mimeType, data: ref.data } });
    
    // Override instruction if reference exists
    systemInstruction = `You are a helpful maker.
    The user has a Source Material (first image) and a Target Goal (second image).
    
    1. Look at the Target Goal. What is it?
    2. Suggest 4 creative names for this project using the user's material.
    
    RULES:
    - Use Noun Phrases only (e.g., "Fast Glider").
    - No verbs or instructions in the title.
    - Simple English only.
    - JSON Array of 4 strings.`;
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
    const text = cleanJSON(response.text || "[]");
    const suggestions = JSON.parse(text);
    return suggestions.length > 0 ? suggestions : ["Quick Start", "Skill Builder", "Advanced Build", "Expert Project"];
  } catch (e) {
    console.error("Failed to parse suggestions:", e);
    return ["Quick Fix", "Improvement", "New Project", "Complex Build"];
  }
};

/**
 * Gemini 3 Pro Plan Engine with Thinking Config.
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
    { text: "Here is what I have (Source Material):" },
    { inlineData: { mimeType: scanned.mimeType, data: scanned.data } }
  ];

  if (referenceImage) {
    const processedRef = await processImage(referenceImage);
    const ref = parseDataUrl(processedRef);
    parts.push({ text: "Here is what I want to make (Target Goal):" },
    { inlineData: { mimeType: ref.mimeType, data: ref.data } });
  }

  parts.push({
    text: `My Goal: "${userCommand}"
    
    You are a Master Teacher for beginners.
    Create a step-by-step build plan.

    CRITICAL INSTRUCTIONS:
    1. **LANGUAGE**: Use Simple English (Grade 5 level). Short sentences. No jargon.
    2. **SAFETY**: If the user asks for something dangerous (e.g., modifying mains voltage, weapons), politely refuse in the 'analysis' section and suggest a safe version.
    3. **CLARITY**: Break complex tasks into tiny, easy steps.
    4. **VERIFICATION**: Describe exactly what to look for to know a step is done.

    Your thinking process should plan the physical constraints before generating the JSON.
    `
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [{ parts }],
    config: {
      // Enable thinking for better reasoning about physical tasks
      thinkingConfig: { thinkingBudget: 2048 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          analysis: { type: Type.STRING, description: "Simple explanation of what we will do" },
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
                description: { type: Type.STRING, description: "Step instruction in simple English" },
                verificationCriteria: { type: Type.STRING, description: "Visual check like 'It should look like...'" }
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

  const text = cleanJSON(response.text || "{}");
  return JSON.parse(text) as PlanData;
};

export const verifyStepCompletion = async (
  stepTitle: string,
  stepInstruction: string,
  userImage: string
): Promise<{ success: boolean; feedback: string }> => {
  const ai = getAI();
  const processedImage = await processImage(userImage);
  const { mimeType, data } = parseDataUrl(processedImage);

  const prompt = `Act as a friendly, encouraging teacher.
  
  Goal Step: "${stepTitle}"
  Instruction: "${stepInstruction}"
  
  Look at the photo. Did the user complete this step?
  
  Output Rules:
  1. Use Very Simple English.
  2. Be kind and helpful.
  3. If not done, explain clearly what is missing in one sentence.
  `;

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

  const text = cleanJSON(response.text || '{"success":false, "feedback":"I could not see the work clearly. Please try again."}');
  return JSON.parse(text);
};

export const askStepQuestion = async (project: string, stepTitle: string, stepInstruction: string, question: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [{ text: `
      You are a helper for a DIY project "${project}".
      Current Step: "${stepTitle}" - "${stepInstruction}".
      User Question: "${question}"
      
      Answer in Simple English. Keep it short (max 2 sentences). Be encouraging.
    ` }]
  });
  return response.text?.trim() || "I'm not sure, but try following the instructions carefully.";
};

export const translateContent = async (text: string, targetLang: string): Promise<string> => {
    if (targetLang === 'en') return text;
    const ai = getAI();
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [{ text: `Translate to ${targetLang}. Keep it simple and natural. Text: "${text}"` }]
    });
    return response.text?.trim() || text;
};
