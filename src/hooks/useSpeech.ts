import { useState, useRef, useCallback } from 'react';

// 러시아어 음성 가용 여부 확인
export function hasRussianVoice(): boolean {
  return window.speechSynthesis.getVoices().some(v => v.lang.startsWith('ru'));
}

// Russian TTS
export function useTTS() {
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v => v.lang.startsWith('ru'));
    if (!ruVoice) return; // 음성 없으면 무시 (UI에서 별도 안내)

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ru-RU';
    utterance.voice = ruVoice;
    utterance.rate = 0.8;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { speak, stop, speaking };
}

// 브라우저 SpeechRecognition 타입 (접두어 포함)
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

type SpeechRecognitionCtor = new () => ISpeechRecognition;

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function useSpeechRecognition() {
  const [transcript, setTranscript] = useState('');
  const [recording, setRecording] = useState(false);
  const [supported] = useState(() => getSpeechRecognition() !== null);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);

  const start = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) return;

    const recognition = new SR();
    recognition.lang = 'ru-RU';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setRecording(true);
      setTranscript('');
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const t = Array.from(e.results)
        .map((r: SpeechRecognitionResult) => r[0].transcript)
        .join('');
      setTranscript(t);
    };

    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setRecording(false);
  }, []);

  const reset = useCallback(() => setTranscript(''), []);

  return { transcript, recording, supported, start, stop, reset };
}

// 발음 정확도 계산 (레벤슈타인 거리 기반)
export function calcAccuracy(target: string, spoken: string): number {
  const t = target.toLowerCase().replace(/[^а-яёa-z]/g, '');
  const s = spoken.toLowerCase().replace(/[^а-яёa-z]/g, '');
  if (!t || !s) return 0;

  const dp: number[][] = Array.from({ length: t.length + 1 }, (_, i) =>
    Array.from({ length: s.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= t.length; i++) {
    for (let j = 1; j <= s.length; j++) {
      dp[i][j] = t[i - 1] === s[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  const maxLen = Math.max(t.length, s.length);
  return Math.round((1 - dp[t.length][s.length] / maxLen) * 100);
}
