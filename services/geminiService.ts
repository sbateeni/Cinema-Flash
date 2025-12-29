
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, FilterLanguage, FilterType } from "../types";

// جلب المفتاح والتأكد من وجوده
const API_KEY = process.env.API_KEY;

export const checkApiStatus = (): boolean => {
  return !!API_KEY && API_KEY.length > 10;
};

export const getApiDiagnostics = () => {
  if (!API_KEY) {
    return {
      status: 'missing',
      message: 'المفتاح غير موجود نهائياً في النظام.',
      details: 'تأكد من إضافة API_KEY أو api في Vercel.'
    };
  }
  
  if (API_KEY.length < 10) {
    return {
      status: 'invalid_length',
      message: 'المفتاح قصير جداً وغير صالح.',
      details: `الطول الحالي: ${API_KEY.length} حرفاً فقط.`
    };
  }

  // إظهار أول 4 حروف وآخر 3 حروف للأمان
  const masked = API_KEY.substring(0, 4) + '...' + API_KEY.substring(API_KEY.length - 3);
  return {
    status: 'detected',
    message: 'تم رصد المفتاح في الكود.',
    details: `المفتاح يبدأ بـ: ${masked} (الطول: ${API_KEY.length} حرفاً).`
  };
};

// وظيفة مساعدة لإنشاء مثيل AI عند الطلب لضمان الحصول على أحدث مفتاح
const getAIInstance = () => {
  if (!checkApiStatus()) return null;
  return new GoogleGenAI({ apiKey: API_KEY! });
};

export const searchMovies = async (query: string, language: FilterLanguage, type: FilterType): Promise<Movie[]> => {
  const ai = getAIInstance();
  if (!ai) {
    throw new Error("API_KEY_MISSING");
  }

  const model = "gemini-3-flash-preview";
  
  const prompt = `
    ابحث عن أفلام أو مسلسلات تطابق الاسم: "${query}".
    التصنيف المطلوب: "${type}"، حالة الترجمة: "${language}".
    أجب بتنسيق JSON فقط كقائمة من 10 عناصر.
    كل عنصر يحتوي على: id, title, originalTitle, year, rating, poster, type, languageStatus, genre, description, quality.
    اجعل البيانات واقعية جداً وكأنك موقع أفلام عربي.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              originalTitle: { type: Type.STRING },
              year: { type: Type.STRING },
              rating: { type: Type.NUMBER },
              poster: { type: Type.STRING },
              type: { type: Type.STRING },
              languageStatus: { type: Type.STRING },
              genre: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              quality: { type: Type.STRING }
            },
            required: ["id", "title", "originalTitle", "year", "rating", "poster", "type", "languageStatus", "genre", "description", "quality"]
          }
        }
      }
    });

    const text = response.text || "[]";
    const cleanJson = text.replace(/```json\n?|\n?```/g, "").trim();
    const results = JSON.parse(cleanJson);

    return results.map((movie: any) => ({
      ...movie,
      sources: ["https://www.google.com/search?q=" + encodeURIComponent(movie.originalTitle + " stream free")]
    }));
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message?.includes("429")) throw new Error("RATE_LIMIT_EXCEEDED");
    if (error.message?.includes("403")) throw new Error("API_KEY_INVALID");
    throw error;
  }
};

export const getFeaturedMovies = async (): Promise<Movie[]> => {
  try {
    return await searchMovies("أفلام تريند 2024", FilterLanguage.ALL, FilterType.ALL);
  } catch {
    return [];
  }
};
