export interface TranslationResult {
  russian: string;         // 러시아어 번역 (강세 포함, e.g. при́вет)
  pronunciation: string;   // 발음 표기 (한글 독음)
  ipa: string;             // IPA 발음기호
  korean: string;          // 한국어 의미
  english?: string;        // 영어 의미 (옵션)
  example?: string;              // 예문 (러시아어)
  examplePronunciation?: string; // 예문 한글 독음
  exampleKo?: string;            // 예문 번역 (한국어)
  exampleEn?: string;            // 예문 번역 (영어)
}

export interface VocabWord {
  id: string;
  russian: string;         // 강세 포함
  base: string;            // 강세 없는 원형 (TTS용)
  pronunciation: string;   // 한글 독음
  ipa: string;
  korean: string;
  english: string;
  category: string;
  level: 'A1' | 'A2' | 'B1' | 'B2';
}

export type TabType = 'translate' | 'vocabulary' | 'pronunciation';
