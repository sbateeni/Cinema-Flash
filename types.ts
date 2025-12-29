
export interface Movie {
  id: string;
  title: string;
  originalTitle: string;
  year: string;
  rating: number;
  poster: string;
  type: 'movie' | 'series';
  languageStatus: 'subtitled' | 'dubbed' | 'original';
  genre: string[];
  description: string;
  quality: string;
  duration?: string;
  sources?: string[];
}

export enum FilterLanguage {
  ALL = 'الكل',
  SUBTITLED = 'مترجم',
  DUBBED = 'مدبلج'
}

export enum FilterType {
  ALL = 'الكل',
  MOVIE = 'أفلام',
  SERIES = 'مسلسلات'
}

export interface SearchParams {
  query: string;
  language: FilterLanguage;
  type: FilterType;
}
