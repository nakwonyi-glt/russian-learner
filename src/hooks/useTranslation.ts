import { useState } from 'react';
import Anthropic from '@anthropic-ai/sdk';
import type { TranslationResult } from '../types';

export function useTranslation(apiKey: string, showEnglish: boolean) {
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const translate = async (text: string, direction: 'ko-ru' | 'ru-ko') => {
    if (!apiKey.trim()) {
      setError('API 키를 먼저 입력해주세요.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

    const systemPrompt = `당신은 러시아어 전문 언어 교수입니다. 번역 요청에 반드시 다음 JSON 형식으로만 응답하세요.
강세 표시: 러시아어 단어의 강세 모음 위에 ́ (combining acute accent, U+0301)를 사용하세요.
예: привет → приве́т, школа → шко́ла

JSON 형식:
{
  "russian": "강세 포함 러시아어",
  "pronunciation": "한글 독음 (러시아어 실제 발음에 가깝게)",
  "ipa": "IPA 발음기호",
  "korean": "한국어 의미",
  "english": "English meaning"${showEnglish ? '' : ' (포함)'},
  "example": "러시아어 예문 (강세 포함)",
  "examplePronunciation": "예문의 한글 독음",
  "exampleKo": "예문의 한국어 번역",
  "exampleEn": "English translation of the example"
}

한글 독음 규칙:
- р = ㄹ/ㄹㄹ, л = ㄹ, м = ㅁ, н = ㄴ, п = ㅂ/ㅍ, б = ㅂ, т = ㄷ/ㅌ, д = ㄷ
- к = ㄱ/ㅋ, г = ㄱ, с = ㅅ/ㅆ, з = ㅈ, ф = ㅍ, в = ㅂ/ㅋ(어말)
- ш = 쉬, щ = 쒸, ж = 쥐, ч = 취, ц = 쯔, х = ㅎ(흐)
- а = 아, о = 아(비강세)/오(강세), е = 예/이, ё = 요, и = 이, у = 우, ы = 으이, э = 에
- 어말 유성음 무성화: б→ㅍ, в→ㅍ, г→ㅋ, д→ㅌ, з→ㅅ`;

    const userPrompt = direction === 'ko-ru'
      ? `다음 한국어를 러시아어로 번역해주세요: "${text}"`
      : `다음 러시아어를 한국어로 번역하고 분석해주세요: "${text}"`;

    try {
      let fullText = '';
      const stream = await client.messages.stream({
        model: 'claude-haiku-4-5',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      });

      for await (const chunk of stream) {
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          fullText += chunk.delta.text;
        }
      }

      // JSON 파싱
      const jsonMatch = fullText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('응답 파싱 실패');
      const parsed = JSON.parse(jsonMatch[0]);
      setResult(parsed);
    } catch (e) {
      setError(e instanceof Error ? e.message : '번역 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, translate };
}
