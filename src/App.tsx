import { useState, useEffect } from 'react';
import { TranslationPanel } from './components/TranslationPanel';
import { VocabularyPanel } from './components/VocabularyPanel';
import { PronunciationPanel } from './components/PronunciationPanel';
import { hasRussianVoice } from './hooks/useSpeech';
import type { TabType } from './types';
import './index.css';

const tabs: { id: TabType; label: string; icon: string }[] = [
  { id: 'translate', label: '번역', icon: '🔤' },
  { id: 'vocabulary', label: '단어장', icon: '📚' },
  { id: 'pronunciation', label: '발음', icon: '🎤' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('translate');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('anthropic_key') || '');
  const [showApiSetup, setShowApiSetup] = useState(!localStorage.getItem('anthropic_key'));
  const [showEnglish, setShowEnglish] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [noRuVoice, setNoRuVoice] = useState(false);

  useEffect(() => {
    // 음성 목록은 비동기로 로드됨
    const check = () => setNoRuVoice(!hasRussianVoice());
    check();
    window.speechSynthesis.addEventListener('voiceschanged', check);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', check);
  }, []);

  const saveApiKey = () => {
    localStorage.setItem('anthropic_key', tempKey);
    setApiKey(tempKey);
    setShowApiSetup(false);
  };

  return (
    <div style={{ minHeight: '100svh', background: 'linear-gradient(to bottom, #f5f3ff, #ffffff)' }}>
      {/* 헤더 */}
      <header style={{
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e9d5ff',
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}>
        <div style={{ maxWidth: 512, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 28 }}>🇷🇺</span>
            <div>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>러시아어 학습</h1>
              <p style={{ margin: 0, fontSize: 12, color: '#9333ea' }}>Русский язык</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setShowEnglish(v => !v)}
              style={{
                padding: '6px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                border: showEnglish ? 'none' : '1px solid #bfdbfe',
                background: showEnglish ? '#2563eb' : '#ffffff',
                color: showEnglish ? '#ffffff' : '#2563eb',
                transition: 'all 0.2s',
              }}
            >
              🇬🇧 {showEnglish ? 'ENG ON' : 'ENG'}
            </button>
            <button
              onClick={() => { setTempKey(apiKey); setShowApiSetup(true); }}
              style={{ fontSize: 20, cursor: 'pointer', background: 'none', border: 'none', padding: 4 }}
              title="API 키 설정"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* API 키 설정 모달 */}
      {showApiSetup && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          padding: 16, background: 'rgba(0,0,0,0.5)',
        }}>
          <div style={{
            background: '#fff', borderRadius: 20, padding: 24,
            width: '100%', maxWidth: 448, boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
          }}>
            <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Anthropic API 키 설정</h2>
            <p style={{ margin: '0 0 16px', fontSize: 14, color: '#6b7280' }}>
              번역 기능을 사용하려면 API 키가 필요합니다.<br />
              키는 이 기기에만 저장됩니다.
            </p>
            <input
              type="password"
              value={tempKey}
              onChange={e => setTempKey(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && tempKey.trim() && saveApiKey()}
              placeholder="sk-ant-..."
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1px solid #e5e7eb', fontSize: 14,
                fontFamily: 'monospace', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={saveApiKey}
                disabled={!tempKey.trim()}
                style={{
                  flex: 1, padding: '10px', borderRadius: 12,
                  background: tempKey.trim() ? '#9333ea' : '#e5e7eb',
                  color: '#fff', fontWeight: 600, fontSize: 15,
                  border: 'none', cursor: tempKey.trim() ? 'pointer' : 'default',
                }}
              >
                저장
              </button>
              {apiKey && (
                <button
                  onClick={() => setShowApiSetup(false)}
                  style={{
                    flex: 1, padding: '10px', borderRadius: 12,
                    background: '#f3f4f6', color: '#374151',
                    fontWeight: 600, fontSize: 15, border: 'none', cursor: 'pointer',
                  }}
                >
                  취소
                </button>
              )}
            </div>
            <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
              API 키는{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
                style={{ color: '#9333ea' }}>
                console.anthropic.com
              </a>
              에서 발급
            </p>
          </div>
        </div>
      )}

      {/* 러시아어 음성 없음 경고 */}
      {noRuVoice && (
        <div style={{
          background: '#fefce8', borderBottom: '1px solid #fde047',
          padding: '10px 16px', fontSize: 13, color: '#713f12',
          display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
        }}>
          <span>⚠️ 러시아어 음성이 없어 발음 듣기가 작동하지 않습니다.</span>
          <span style={{ color: '#78350f' }}>
            <b>Edge 브라우저</b>로 열거나,{' '}
            <a
              href="ms-settings:speech"
              style={{ color: '#92400e', textDecoration: 'underline' }}
            >
              Windows 음성 설정
            </a>
            에서 러시아어를 추가하세요.
          </span>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main style={{ maxWidth: 512, margin: '0 auto', padding: '16px 16px 100px' }}>
        {activeTab === 'translate' && <TranslationPanel apiKey={apiKey} showEnglish={showEnglish} />}
        {activeTab === 'vocabulary' && <VocabularyPanel showEnglish={showEnglish} />}
        {activeTab === 'pronunciation' && <PronunciationPanel />}
      </main>

      {/* 하단 탭 바 */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 20,
        background: '#fff', borderTop: '1px solid #e9d5ff',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        <div style={{ maxWidth: 512, margin: '0 auto', display: 'flex' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 2, padding: '10px 0',
                border: 'none', background: 'none', cursor: 'pointer',
                color: activeTab === tab.id ? '#7c3aed' : '#9ca3af',
                position: 'relative',
              }}
            >
              <span style={{ fontSize: 22 }}>{tab.icon}</span>
              <span style={{ fontSize: 11, fontWeight: activeTab === tab.id ? 700 : 500 }}>
                {tab.label}
              </span>
              {activeTab === tab.id && (
                <div style={{
                  position: 'absolute', bottom: 0, width: 40,
                  height: 3, background: '#7c3aed', borderRadius: '2px 2px 0 0',
                }} />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
