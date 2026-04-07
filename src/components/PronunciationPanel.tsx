import { useState } from 'react';
import { vocabulary } from '../data/vocabulary';
import { useTTS, useSpeechRecognition, calcAccuracy } from '../hooks/useSpeech';

export function PronunciationPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [mode, setMode] = useState<'practice' | 'result'>('practice');
  const { speak, speaking } = useTTS();
  const { transcript, recording, supported, error, start, stop, reset } = useSpeechRecognition();

  const current = vocabulary[currentIndex % vocabulary.length];

  const handleRecord = () => {
    if (recording) {
      stop();
      // 잠깐 대기 후 정확도 계산
      setTimeout(() => {
        if (transcript) {
          const acc = calcAccuracy(current.base, transcript);
          setAccuracy(acc);
          setMode('result');
        }
      }, 300);
    } else {
      reset();
      setAccuracy(null);
      setMode('practice');
      start();
    }
  };

  const next = () => {
    setCurrentIndex(i => i + 1);
    setAccuracy(null);
    setMode('practice');
    reset();
  };

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return 'text-green-600';
    if (acc >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyBg = (acc: number) => {
    if (acc >= 80) return 'bg-green-50 border-green-200';
    if (acc >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const getAccuracyMessage = (acc: number) => {
    if (acc >= 90) return '완벽해요! 네이티브 수준입니다 🎉';
    if (acc >= 80) return '훌륭해요! 조금만 더 연습하면 완벽해요 👍';
    if (acc >= 60) return '좋아요! 계속 연습해 보세요 💪';
    if (acc >= 40) return '조금 더 연습이 필요해요. 발음을 들어보세요 🎧';
    return '처음엔 어렵지만 괜찮아요! 다시 들어보고 따라해 보세요 😊';
  };

  return (
    <div className="space-y-4">
      {/* 현재 단어 카드 */}
      <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white text-center shadow-lg">
        <div className="text-xs font-semibold uppercase tracking-widest mb-2 opacity-75">
          {current.category} · {current.level}
        </div>
        <div className="text-4xl font-bold mb-2">{current.russian}</div>
        <div className="text-purple-200 text-sm mb-1">[{current.ipa}]</div>
        <div className="text-purple-100 text-base">{current.pronunciation}</div>
        <div className="text-white/80 text-sm mt-2">{current.korean}</div>
      </div>

      {/* 발음 듣기 */}
      <button
        onClick={() => speak(current.base)}
        disabled={speaking}
        className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
          speaking
            ? 'bg-purple-100 text-purple-400'
            : 'bg-white text-purple-700 border border-purple-200 hover:bg-purple-50'
        }`}
      >
        <span className="text-xl">{speaking ? '🔈' : '🔊'}</span>
        {speaking ? '재생 중...' : '발음 듣기'}
      </button>

      {/* 녹음 */}
      {supported ? (
        <div className="space-y-3">
          <button
            onClick={handleRecord}
            className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-sm ${
              recording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {recording ? (
              <>
                <span className="inline-block w-3 h-3 bg-white rounded-sm" />
                녹음 중지 (클릭하여 분석)
              </>
            ) : (
              <>
                <span className="text-xl">🎤</span>
                발음 따라하기
              </>
            )}
          </button>

          {/* 오류 메시지 */}
          {error && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* 인식된 텍스트 */}
          {(transcript || recording) && (
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">인식된 발음</p>
              <p className="text-base font-medium text-gray-800">
                {transcript || <span className="text-gray-400 animate-pulse">듣는 중...</span>}
              </p>
            </div>
          )}

          {/* 정확도 결과 */}
          {mode === 'result' && accuracy !== null && (
            <div className={`p-4 rounded-2xl border ${getAccuracyBg(accuracy)}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-600">발음 정확도</span>
                <span className={`text-3xl font-black ${getAccuracyColor(accuracy)}`}>
                  {accuracy}%
                </span>
              </div>

              {/* 진행 바 */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    accuracy >= 80 ? 'bg-green-500' : accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${accuracy}%` }}
                />
              </div>

              <p className="text-sm text-gray-700">{getAccuracyMessage(accuracy)}</p>

              {/* 비교 */}
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/70 rounded-lg p-2">
                  <p className="text-xs text-gray-400">목표</p>
                  <p className="font-semibold text-purple-700">{current.base}</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2">
                  <p className="text-xs text-gray-400">내 발음</p>
                  <p className="font-semibold text-gray-700">{transcript}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
          <p className="text-yellow-800 text-sm">
            이 브라우저는 음성 인식을 지원하지 않습니다.<br />
            Chrome 브라우저에서 사용해 주세요.
          </p>
        </div>
      )}

      {/* 다음 단어 */}
      <button
        onClick={next}
        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
      >
        다음 단어 →
      </button>

      {/* 랜덤 이동 */}
      <div className="flex gap-2">
        <button
          onClick={() => {
            const i = Math.floor(Math.random() * vocabulary.length);
            setCurrentIndex(i);
            setAccuracy(null);
            setMode('practice');
            reset();
          }}
          className="flex-1 py-2.5 text-sm bg-white text-purple-700 border border-purple-200 rounded-xl hover:bg-purple-50 transition-colors font-medium"
        >
          🎲 랜덤 단어
        </button>
        <button
          onClick={() => {
            setAccuracy(null);
            setMode('practice');
            reset();
          }}
          className="flex-1 py-2.5 text-sm bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-medium"
        >
          🔄 다시 시도
        </button>
      </div>
    </div>
  );
}
