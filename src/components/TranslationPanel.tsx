import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTTS } from '../hooks/useSpeech';
import type { TranslationResult } from '../types';

interface Props {
  apiKey: string;
  showEnglish: boolean;
}

export function TranslationPanel({ apiKey, showEnglish }: Props) {
  const [input, setInput] = useState('');
  const [direction, setDirection] = useState<'ko-ru' | 'ru-ko'>('ko-ru');
  const { result, loading, error, translate } = useTranslation(apiKey, showEnglish);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) translate(input.trim(), direction);
  };

  return (
    <div className="space-y-4">
      {/* 방향 선택 */}
      <div className="flex rounded-xl overflow-hidden border border-purple-200 bg-white">
        <button
          onClick={() => setDirection('ko-ru')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            direction === 'ko-ru'
              ? 'bg-purple-600 text-white'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          한국어 → 러시아어
        </button>
        <button
          onClick={() => setDirection('ru-ko')}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            direction === 'ru-ko'
              ? 'bg-purple-600 text-white'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          러시아어 → 한국어
        </button>
      </div>

      {/* 입력 */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={direction === 'ko-ru' ? '한국어를 입력하세요...' : 'Введите текст на русском...'}
          className="w-full h-28 p-3 rounded-xl border border-purple-200 bg-white text-gray-800 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 text-base"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-purple-700 active:bg-purple-800 transition-colors"
        >
          {loading ? '번역 중...' : '번역하기'}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-200">
          {error}
        </div>
      )}

      {result && <ResultCard result={result} showEnglish={showEnglish} />}

      <PronunciationGuide />
    </div>
  );
}

function ResultCard({
  result,
  showEnglish,
}: {
  result: TranslationResult;
  showEnglish: boolean;
}) {
  const { speak, stop, speaking } = useTTS();
  const [playingTarget, setPlayingTarget] = useState<'word' | 'example' | null>(null);

  const handleSpeak = (text: string, target: 'word' | 'example') => {
    if (speaking) {
      stop();
      setPlayingTarget(null);
    } else {
      setPlayingTarget(target);
      speak(text.replace(/\u0301/g, ''));
    }
  };

  const isWordPlaying = speaking && playingTarget === 'word';
  const isExamplePlaying = speaking && playingTarget === 'example';

  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
      {/* 러시아어 + 발음 듣기 */}
      <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-2xl font-bold text-purple-800 leading-relaxed">{result.russian}</p>
            <p className="text-sm text-purple-500 mt-1">[{result.ipa}]</p>
            <p className="text-base text-purple-700 font-medium mt-1">{result.pronunciation}</p>
          </div>
          <button
            onClick={() => handleSpeak(result.russian, 'word')}
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center shadow-sm transition-all ${
              isWordPlaying
                ? 'bg-purple-600 text-white animate-pulse'
                : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
            }`}
            title="발음 듣기"
          >
            {isWordPlaying ? '⏹' : '🔊'}
          </button>
        </div>
      </div>

      {/* 의미 */}
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">한국어</span>
          <p className="text-lg font-semibold text-gray-800 mt-0.5">{result.korean}</p>
        </div>

        {showEnglish && result.english && (
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">English</span>
            <p className="text-base text-gray-700 mt-0.5">{result.english}</p>
          </div>
        )}

        {result.example && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">예문</span>
              <button
                onClick={() => handleSpeak(result.example!, 'example')}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
                  isExamplePlaying
                    ? 'bg-purple-600 text-white animate-pulse'
                    : 'bg-white text-purple-500 border border-purple-200 hover:bg-purple-50'
                }`}
                title="예문 듣기"
              >
                {isExamplePlaying ? '⏹' : '🔊'}
              </button>
            </div>
            <p className="text-base text-purple-700 font-medium">{result.example}</p>
            {result.examplePronunciation && (
              <p className="text-sm text-purple-400 mt-0.5">{result.examplePronunciation}</p>
            )}
            {result.exampleKo && (
              <p className="text-sm text-gray-600 mt-0.5">{result.exampleKo}</p>
            )}
            {showEnglish && result.exampleEn && (
              <p className="text-sm text-blue-500 mt-0.5">{result.exampleEn}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 한글 발음 가이드 ──────────────────────────────────────────────
const vowels: [string, string, string][] = [
  ['а', '아', '강세: 아 / 비강세: 아↓'],
  ['е', '예/이', '강세: 예 / 비강세: 이'],
  ['ё', '요', '항상 강세, 요'],
  ['и', '이', '이'],
  ['о', '오/아', '강세: 오 / 비강세: 아'],
  ['у', '우', '우'],
  ['ы', '으이', '한국어에 없는 소리 (혀 뒤로)'],
  ['э', '에', '에'],
  ['ю', '유', '유'],
  ['я', '야/이', '강세: 야 / 비강세: 이'],
];

const consonants: [string, string, string][] = [
  ['б', 'ㅂ', '어말·무성음 앞: ㅍ (хлеб→흘렙)'],
  ['в', 'ㅂ/ㅋ', '어말: ㅍ'],
  ['г', 'ㄱ', '어말: ㅋ'],
  ['д', 'ㄷ', '어말: ㅌ'],
  ['з', 'ㅈ', '어말: ㅅ'],
  ['ж', '쥐', '한국어 ㅈ보다 혀를 뒤로'],
  ['й', 'ㅇ/이', '반모음 (й→이)'],
  ['к', 'ㄱ/ㅋ', ''],
  ['л', 'ㄹ', '연자음(ль)은 부드럽게'],
  ['м', 'ㅁ', ''],
  ['н', 'ㄴ', ''],
  ['п', 'ㅂ/ㅍ', ''],
  ['р', 'ㄹ(혀 굴림)', '혀끝을 진동시키는 ㄹ'],
  ['с', 'ㅅ', ''],
  ['т', 'ㄷ/ㅌ', '어말: ㅌ'],
  ['ф', 'ㅍ', ''],
  ['х', 'ㅎ(흐)', '목구멍 마찰음'],
  ['ц', '쯔', '짧은 쯔'],
  ['ч', '취', ''],
  ['ш', '쉬', '혀 뒤로 말아서'],
  ['щ', '쒸', 'ш보다 길고 부드럽게'],
  ['ъ', '경음부호', '뒤 모음 분리, 소리 없음'],
  ['ь', '연음부호', '앞 자음 부드럽게, 소리 없음'],
];

function PronunciationGuide() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'vowel' | 'consonant' | 'rule'>('vowel');

  const rules = [
    ['강세 이동', '러시아어는 강세 위치에 따라 발음이 크게 달라집니다. 강세 모음만 제대로 발음하면 됩니다.'],
    ['무성음화', '단어 끝 유성자음(б,в,г,д,з,ж)은 무성음으로 바뀝니다. хлеб[흘렙], город[고라트]'],
    ['모음 약화', '비강세 о → 아, е/я → 이 로 약화됩니다. молоко[말라꼬]'],
    ['연자음', 'ь(연음부호) 앞 자음은 혀를 경구개 방향으로 부드럽게 발음합니다.'],
    ['경자음', 'ъ(경음부호)는 뒤따르는 е,ё,ю,я와 앞 자음을 분리합니다.'],
  ];

  return (
    <div className="bg-white rounded-2xl border border-purple-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-purple-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">📖</span>
          <span className="font-semibold text-gray-800 text-sm">한글 발음 가이드</span>
          <span className="text-xs text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">키릴 문자 읽는 법</span>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-purple-100">
          {/* 탭 */}
          <div className="flex border-b border-purple-100">
            {([['vowel', '모음 (10개)'], ['consonant', '자음 (21개)'], ['rule', '발음 규칙']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-2 text-xs font-semibold transition-colors ${
                  tab === id ? 'text-purple-700 border-b-2 border-purple-600' : 'text-gray-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-3">
            {tab === 'vowel' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold w-10">글자</th>
                    <th className="text-left pb-2 font-semibold w-14">한글</th>
                    <th className="text-left pb-2 font-semibold">발음 설명</th>
                  </tr>
                </thead>
                <tbody>
                  {vowels.map(([letter, ko, desc]) => (
                    <tr key={letter} className="border-b border-gray-50">
                      <td className="py-1.5 text-xl font-bold text-purple-700">{letter}</td>
                      <td className="py-1.5 font-semibold text-gray-800">{ko}</td>
                      <td className="py-1.5 text-gray-500 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'consonant' && (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="text-left pb-2 font-semibold w-10">글자</th>
                    <th className="text-left pb-2 font-semibold w-14">한글</th>
                    <th className="text-left pb-2 font-semibold">발음 설명</th>
                  </tr>
                </thead>
                <tbody>
                  {consonants.map(([letter, ko, desc]) => (
                    <tr key={letter} className="border-b border-gray-50">
                      <td className="py-1.5 text-xl font-bold text-purple-700">{letter}</td>
                      <td className="py-1.5 font-semibold text-gray-800">{ko}</td>
                      <td className="py-1.5 text-gray-500 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {tab === 'rule' && (
              <div className="space-y-3">
                {rules.map(([title, desc]) => (
                  <div key={title} className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-sm font-bold text-purple-800 mb-0.5">{title}</p>
                    <p className="text-xs text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
