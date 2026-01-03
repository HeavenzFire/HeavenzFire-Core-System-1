
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const GROUNDED_INSTRUCTION = `You are a world-class senior engineer and stabilizer. 
Treat software systems as autonomous digital agents and deterministic signal pipelines. 
Do not refer to them as literally living organisms. Focus on precision, stability, 
and measurable suffering reduction through auditory grounding.`;

export async function performResearch(prompt: string, useThinking: boolean = false) {
  const ai = getAI();
  const model = useThinking ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';
  
  const config: any = {
    systemInstruction: GROUNDED_INSTRUCTION
  };
  
  if (useThinking) {
    config.thinkingConfig = { thinkingBudget: 32768 };
  } else {
    config.tools = [{ googleSearch: {} }];
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
    ?.map((chunk: any) => ({
      title: chunk.web?.title,
      uri: chunk.web?.uri,
    }))
    .filter((s: any) => s.uri) || [];

  return { text, sources };
}

export async function analyzeMoodTrends(history: any[]) {
  const ai = getAI();
  const historyText = JSON.stringify(history);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this sovereign signal history for trends in suffering reduction. Provide a technical, stabilizing summary of progress. Treat the data as telemetry from a deterministic signal pipeline. History: ${historyText}`,
    config: {
      systemInstruction: GROUNDED_INSTRUCTION
    }
  });
  return response.text;
}

export async function generateTherapeuticSpeech(text: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Synthesize signal with deep calm and therapeutic precision: ${text}` }] }],
    config: {
      systemInstruction: GROUNDED_INSTRUCTION,
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  return base64Audio;
}

export async function transcribeAudio(base64Data: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'audio/wav',
            data: base64Data,
          },
        },
        { text: "Accurately transcribe this signal telemetry. Capture observations about mental state or magnitude of suffering precisely." }
      ],
    },
    config: {
      systemInstruction: GROUNDED_INSTRUCTION
    }
  });

  return response.text;
}

// Audio Decoding Utility
export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
