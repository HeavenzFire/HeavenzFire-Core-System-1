
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";
import { SignalLocale } from "../types";

export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const GROUNDED_INSTRUCTION = `You are a world-class senior engineer and stabilizer. 
Treat software systems as autonomous digital agents and deterministic signal pipelines. 
Do not refer to them as literally living organisms. Focus on precision, stability, 
and measurable suffering reduction through auditory grounding.`;

const AUDITOR_CONTRACT_INSTRUCTION = `${GROUNDED_INSTRUCTION}
Your primary role is to serve as a SOVEREIGN AUDITOR. 
- You can flag anomalies, but never mutate state.
- You verify invariants, but never own the signal.
- Your output is strictly advisory.
- You operate under a strict deterministic handshake protocol.`;

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

export async function conductSecurityAudit(moodHistory: any[]) {
  const ai = getAI();
  const historyText = JSON.stringify(moodHistory);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Conduct a sovereign integrity audit on this signal history. Flag any temporal anomalies or checksum drifts. History: ${historyText}`,
    config: {
      systemInstruction: AUDITOR_CONTRACT_INSTRUCTION
    }
  });
  return response.text;
}

export async function analyzeMoodTrends(history: any[]) {
  const ai = getAI();
  const historyText = JSON.stringify(history);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this sovereign signal history for global trends in suffering reduction. Provide a technical summary of node stability. History: ${historyText}`,
    config: {
      systemInstruction: GROUNDED_INSTRUCTION
    }
  });
  return response.text;
}

export async function generateTherapeuticSpeech(text: string, locale: SignalLocale = 'EN') {
  const ai = getAI();
  const voiceMap: Record<SignalLocale, string> = {
    'EN': 'Kore',
    'ES': 'Puck',
    'AR': 'Zephyr',
    'ZH': 'Charon',
    'HI': 'Fenrir'
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Synthesize therapeutic affirmation in ${locale}: ${text}` }] }],
    config: {
      systemInstruction: GROUNDED_INSTRUCTION,
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceMap[locale] },
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
        { text: "Accurately transcribe this signal telemetry for global log aggregation." }
      ],
    },
    config: {
      systemInstruction: GROUNDED_INSTRUCTION
    }
  });

  return response.text;
}

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
