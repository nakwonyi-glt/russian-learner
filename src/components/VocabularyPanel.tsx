import { useState, useMemo } from 'react';
import { vocabulary, categories } from '../data/vocabulary';
import { useTTS } from '../hooks/useSpeech';
import type { VocabWord } from '../types';

interface Props {
  showEnglish: boolean;
}

export function VocabularyPanel({ showEnglish }: Props) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [selectedLevel, setSelectedLevel] = useState('전체');
  const [flipped, setFlipped] = useState<Set<string>>(new Set());
  const { speak } = useTTS();

  const filtered = useMemo(() => {
    return vocabulary.filter(w => {
      const matchCat = selectedCategory === '전체' || w.category === selectedCategory;
      const matchLevel = selectedLevel === '전체' || w.level === selectedLevel;
      const matchSearch = !search ||
        w.russian.includes(search) ||
        w.korean.includes(search) ||
        w.english.toLowerCase().includes(search.toLowerCase()) ||
        w.base.includes(search);
      return matchCat && matchLevel && matchSearch;
    });
  }, [search, selectedCategory, selectedLevel]);

  const toggleFlip = (id: string) => {
    setFlipped(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* 검색 */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="검색: 러시아어, 한국어, 영어..."
        className="w-full px-4 py-3 rounded-xl border border-purple-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
      />

      {/* 필터 */}
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['전체', ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {['전체', 'A1', 'A2', 'B1', 'B2'].map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                selectedLevel === level
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-indigo-700 border border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-gray-500">
        {search ? `${filtered.length}개 단어 · 카드를 탭하면 의미가 표시됩니다` : `총 ${filtered.length}개 단어`}
      </p>

      {/* 검색어 없을 때 안내 */}
      {!search && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-2xl mb-3">🔍</p>
          <p>검색어를 입력하면 단어가 표시됩니다</p>
        </div>
      )}

      {/* 단어 카드 그리드 */}
      {search && (
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(word => (
            <WordCard
              key={word.id}
              word={word}
              showEnglish={showEnglish}
              isFlipped={flipped.has(word.id)}
              onFlip={() => toggleFlip(word.id)}
              onSpeak={() => speak(word.base)}
            />
          ))}
        </div>
      )}

      {search && filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          검색 결과가 없습니다
        </div>
      )}
    </div>
  );
}

function WordCard({
  word,
  showEnglish,
  isFlipped,
  onFlip,
  onSpeak,
}: {
  word: VocabWord;
  showEnglish: boolean;
  isFlipped: boolean;
  onFlip: () => void;
  onSpeak: () => void;
}) {
  const levelColors: Record<string, string> = {
    A1: 'bg-green-100 text-green-700',
    A2: 'bg-blue-100 text-blue-700',
    B1: 'bg-orange-100 text-orange-700',
    B2: 'bg-red-100 text-red-700',
  };

  return (
    <div
      onClick={onFlip}
      className="relative bg-white rounded-2xl border border-purple-100 shadow-sm p-4 cursor-pointer hover:shadow-md hover:border-purple-300 transition-all min-h-[140px] flex flex-col"
    >
      <div className="flex items-start justify-between mb-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${levelColors[word.level]}`}>
          {word.level}
        </span>
        <button
          onClick={e => { e.stopPropagation(); onSpeak(); }}
          className="text-purple-400 hover:text-purple-600 text-lg leading-none"
          title="발음 듣기"
        >
          🔊
        </button>
      </div>

      <div className="flex-1">
        <p className="text-xl font-bold text-purple-800">{word.russian}</p>
        <p className="text-xs text-purple-400 mt-0.5">{word.pronunciation}</p>
      </div>

      {isFlipped ? (
        <div className="mt-2 pt-2 border-t border-purple-100">
          <p className="text-sm font-semibold text-gray-700">{word.korean}</p>
          {showEnglish && (
            <p className="text-xs text-gray-500 mt-0.5">{word.english}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5 italic">{word.ipa}</p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-gray-400">탭하여 의미 보기</p>
      )}
    </div>
  );
}
