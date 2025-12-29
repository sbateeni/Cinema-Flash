
import { GoogleGenAI, Type } from "@google/genai";
import { Movie, FilterLanguage, FilterType } from "../types";

const API_KEY = process.env.API_KEY;

export const checkApiStatus = (): boolean => {
  return !!API_KEY && API_KEY.length > 10;
};

// Add the missing getApiDiagnostics function to fix the import error in App.tsx
export const getApiDiagnostics = () => {
  const hasKey = !!API_KEY;
  const keyLength = API_KEY?.length || 0;
  const isValidFormat = API_KEY?.startsWith("AIza");

  if (!hasKey) {
    return { message: "مفتاح API مفقود", details: "لم يتم العثور على متغير البيئة API_KEY في إعدادات المشروع." };
  }
  if (!isValidFormat) {
    return { message: "تنسيق المفتاح غير صحيح", details: "يجب أن يبدأ مفتاح Gemini بـ 'AIza'. يرجى التأكد من صحة المفتاح المستخدم." };
  }
  if (keyLength < 20) {
    return { message: "المفتاح قصير جداً", details: "يبدو أن المفتاح غير مكتمل أو غير صحيح." };
  }
  return { message: "المفتاح يبدو سليماً من الناحية التقنية", details: "إذا استمرت المشكلة، يرجى التأكد من تفعيل Gemini API في Google AI Studio والتأكد من عدم تجاوز حصة الاستخدام." };
};

const getAIInstance = () => {
  if (!checkApiStatus()) return null;
  // Create a new instance right before use to ensure the latest API key is used
  return new GoogleGenAI({ apiKey: API_KEY! });
};

export const searchMovies = async (query: string, language: FilterLanguage, type: FilterType): Promise<Movie[]> => {
  const ai = getAIInstance();
  if (!ai) throw new Error("API_KEY_MISSING");

  const model = "gemini-3-flash-preview";
  
  // برومبت مكثف لاستخراج روابط المشاهدة النهائية فقط
  const prompt = `
    ACT AS: A Movie Link Scraper.
    SEARCH: Find direct streaming pages for the movie: "${query}".
    TARGET WEBSITES: (cimawbas.tv, mycima.io, akwam.net, egybest.run, faselhd.com, wecima.show, hi-cima.com).
    CRITICAL RULES:
    1. Extract the FULL URL of the page where the movie is played.
    2. Look for patterns like /watch/, /video/, watch.php?vid=, /play/.
    3. DO NOT return search result pages (e.g., google.com/search).
    4. NO YouTube, NO trailers, NO news.
    5. Language: ${language}.
    
    OUTPUT: Return a JSON array of movies with metadata and an array of extracted "sources" (the direct links).
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // استخدام جوجل للبحث الفعلي
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

    // اقتناص الروابط من Grounding Metadata التي يوفرها Gemini Search
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const rawUrls = groundingChunks
      .filter((chunk: any) => chunk.web && chunk.web.uri)
      .map((chunk: any) => chunk.web.uri);

    const movies = JSON.parse(response.text || "[]");

    return movies.map((movie: any) => {
      // فلترة وتدقيق الروابط لتكون خاصة بالفيلم المختار تحديداً
      const movieSlug = movie.originalTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
      const relevantLinks = rawUrls.filter((url: string) => {
        const u = url.toLowerCase();
        // التحقق من أن الرابط يحتوي على كلمة من العنوان وأنها ليست صفحة بحث عامة
        const isRelevant = u.includes(movieSlug) || movie.originalTitle.toLowerCase().split(' ').some(word => word.length > 3 && u.includes(word));
        const isStream = u.includes('watch') || u.includes('video') || u.includes('.php') || u.includes('play') || u.includes('movie');
        const isNotSocial = !u.includes('youtube') && !u.includes('facebook') && !u.includes('google');
        
        return isRelevant && isStream && isNotSocial;
      });

      // إزالة الروابط المكررة وترتيبها
      const uniqueLinks = Array.from(new Set(relevantLinks));

      return {
        ...movie,
        sources: uniqueLinks.length > 0 ? uniqueLinks : [
          `https://www.google.com/search?q=مشاهدة+${encodeURIComponent(movie.title)}+مترجم+كامل+اون+لاين`
        ]
      };
    });
  } catch (error) {
    console.error("Link Extraction Error:", error);
    throw error;
  }
};

export const getFeaturedMovies = async (): Promise<Movie[]> => {
  try {
    return await searchMovies("أفلام 2024 مترجمة", FilterLanguage.ALL, FilterType.ALL);
  } catch {
    return [];
  }
};
