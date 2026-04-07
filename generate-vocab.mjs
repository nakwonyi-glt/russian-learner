#!/usr/bin/env node
/**
 * Russian Vocabulary Generator — ~5000 words
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... node generate-vocab.mjs
 *
 * - 중간에 끊겨도 .vocab-progress.json 에서 이어서 실행됩니다.
 * - 완료 후 src/data/vocabulary.ts 를 덮어씁니다.
 */

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROGRESS_FILE = join(__dirname, '.vocab-progress.json');
const OUTPUT_FILE = join(__dirname, 'src/data/vocabulary.ts');

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY 환경변수가 필요합니다.');
  console.error('   실행 방법: ANTHROPIC_API_KEY=sk-ant-... node generate-vocab.mjs');
  process.exit(1);
}

const client = new Anthropic({ apiKey });

// ── 배치 목록 (총 ~5100단어) ─────────────────────────────────────
const batches = [
  // ── A1 (~550) ──
  { level: 'A1', category: '인사',     topic: '인사말, 감사, 사과, 부탁, 기본 표현',           count: 40 },
  { level: 'A1', category: '숫자',     topic: '기수 1~1000, 서수 1~10, 0, 분수, 퍼센트',        count: 40 },
  { level: 'A1', category: '가족',     topic: '가족 구성원, 친척 명칭, 세대',                   count: 35 },
  { level: 'A1', category: '신체',     topic: '신체 부위, 얼굴, 손발, 내장 기초',               count: 40 },
  { level: 'A1', category: '음식',     topic: '기본 식품, 채소, 과일, 음료, 맛',                count: 50 },
  { level: 'A1', category: '색상',     topic: '색상, 기본 형태, 크기 형용사',                   count: 30 },
  { level: 'A1', category: '집',       topic: '집, 방, 가구, 생활용품 기초',                    count: 40 },
  { level: 'A1', category: '동물',     topic: '반려동물, 농장동물, 야생동물 기초',              count: 45 },
  { level: 'A1', category: '자연',     topic: '날씨, 계절, 자연 기초',                          count: 35 },
  { level: 'A1', category: '기본동사', topic: '기초 동사: 있다/없다, 먹다, 가다, 오다 등',      count: 50 },
  { level: 'A1', category: '형용사',   topic: '기본 형용사: 크다/작다, 좋다/나쁘다 등',         count: 40 },
  { level: 'A1', category: '기본',     topic: '대명사, 지시어, 의문사, 기본 부사',              count: 45 },

  // ── A2 (~950) ──
  { level: 'A2', category: '시간',     topic: '시각, 요일, 월, 연도, 시간 표현, 기간',          count: 50 },
  { level: 'A2', category: '교통',     topic: '교통수단, 방향, 위치, 이동 표현',                count: 50 },
  { level: 'A2', category: '쇼핑',     topic: '쇼핑, 시장, 가격, 상점, 계산',                  count: 45 },
  { level: 'A2', category: '옷',       topic: '의류, 신발, 액세서리, 착용 표현',                count: 45 },
  { level: 'A2', category: '직업',     topic: '직업 종류, 직장, 업무 기초',                     count: 50 },
  { level: 'A2', category: '교육',     topic: '학교, 수업, 과목, 교육 기초',                    count: 50 },
  { level: 'A2', category: '건강',     topic: '신체 증상, 병원, 의약품, 건강 기초',              count: 50 },
  { level: 'A2', category: '스포츠',   topic: '스포츠, 운동, 취미 기초',                        count: 45 },
  { level: 'A2', category: '장소',     topic: '도시 장소, 건물, 시설, 주소',                    count: 50 },
  { level: 'A2', category: '감정',     topic: '감정, 기분, 성격 기초',                          count: 45 },
  { level: 'A2', category: '여행',     topic: '여행, 관광, 숙박, 공항, 비자',                   count: 50 },
  { level: 'A2', category: '요리',     topic: '요리, 레스토랑, 식사, 조리법',                   count: 50 },
  { level: 'A2', category: '통신',     topic: '전화, 인터넷, SNS, 미디어 기초',                 count: 40 },
  { level: 'A2', category: '자연',     topic: '자연, 환경, 지형, 식물 기초',                    count: 45 },
  { level: 'A2', category: '동사',     topic: 'A2 동사 확장: 일상 동사 50개',                   count: 50 },
  { level: 'A2', category: '형용사',   topic: 'A2 형용사 확장: 묘사/평가 형용사',               count: 50 },
  { level: 'A2', category: '부사',     topic: '부사, 접속사, 전치사 A2 확장',                   count: 45 },
  { level: 'A2', category: '일상',     topic: '일상생활, 루틴, 집안일, 생활 표현',              count: 45 },
  { level: 'A2', category: '사람',     topic: '외모 묘사, 성격, 인간관계 표현',                 count: 45 },

  // ── B1 (~1500) ──
  { level: 'B1', category: '교육',     topic: '대학, 학문, 연구, 시험, 학위',                   count: 50 },
  { level: 'B1', category: '과학',     topic: '기초 과학: 수학, 물리, 화학, 생물 용어',         count: 50 },
  { level: 'B1', category: '기술',     topic: '컴퓨터, IT, 인터넷, 소프트웨어',                 count: 50 },
  { level: 'B1', category: '문화',     topic: '문화, 예술, 미술, 박물관, 전시',                 count: 50 },
  { level: 'B1', category: '음악',     topic: '음악, 악기, 장르, 공연, 음악가',                 count: 45 },
  { level: 'B1', category: '문학',     topic: '문학, 독서, 책, 장르, 문학 용어',                count: 45 },
  { level: 'B1', category: '역사',     topic: '역사, 문명, 시대, 사건, 인물',                   count: 50 },
  { level: 'B1', category: '지리',     topic: '지리, 국가, 도시, 지형 상세',                    count: 50 },
  { level: 'B1', category: '경제',     topic: '경제 기초, 금융, 은행, 무역',                    count: 50 },
  { level: 'B1', category: '사회',     topic: '사회, 공동체, 복지, 사회문제',                   count: 50 },
  { level: 'B1', category: '의료',     topic: '의료, 질병, 치료, 의약품 상세',                  count: 50 },
  { level: 'B1', category: '환경',     topic: '환경, 생태, 기후변화, 자연보호',                 count: 50 },
  { level: 'B1', category: '법률',     topic: '법률, 권리, 법원, 범죄 기초',                    count: 45 },
  { level: 'B1', category: '스포츠',   topic: '스포츠 상세, 경기, 선수, 규칙',                  count: 45 },
  { level: 'B1', category: '심리',     topic: '감정 심화, 심리, 행동, 성격 상세',               count: 50 },
  { level: 'B1', category: '비즈니스', topic: '비즈니스, 업무, 회의, 계약, 직장',               count: 50 },
  { level: 'B1', category: '동사',     topic: 'B1 핵심 동사 (완료상/불완료상 쌍 포함)',         count: 60 },
  { level: 'B1', category: '동사',     topic: '이동동사 (идти/ходить류), 접두사 동사',           count: 55 },
  { level: 'B1', category: '형용사',   topic: 'B1 형용사 상세, 단어 파생 형용사',               count: 55 },
  { level: 'B1', category: '숙어',     topic: '관용구, 자주 쓰이는 숙어 표현',                  count: 50 },
  { level: 'B1', category: '정치',     topic: '정치, 정부, 선거, 민주주의 기초',                count: 45 },
  { level: 'B1', category: '미디어',   topic: '미디어, 언론, 뉴스, 방송, SNS',                  count: 45 },
  { level: 'B1', category: '종교',     topic: '종교, 신앙, 러시아 정교회, 의식',                count: 40 },
  { level: 'B1', category: '자연',     topic: '자연재해, 기상 현상, 기후 상세',                 count: 45 },
  { level: 'B1', category: '건축',     topic: '건축, 도시, 건물, 건설',                         count: 45 },
  { level: 'B1', category: '식물',     topic: '식물, 꽃, 나무, 농업',                           count: 45 },
  { level: 'B1', category: '음식',     topic: '러시아 전통 음식, 식재료 상세',                  count: 50 },
  { level: 'B1', category: '여행',     topic: '여행 심화, 문화 체험, 관광지',                   count: 45 },
  { level: 'B1', category: '부사',     topic: 'B1 접속사, 부사, 전치사구 확장',                 count: 50 },
  { level: 'B1', category: '일상',     topic: '일상 표현 심화, 격식/비격식 구분',               count: 45 },

  // ── B2 (~2100) ──
  { level: 'B2', category: '학문',     topic: '학술 용어, 연구방법론, 논문 관련',               count: 50 },
  { level: 'B2', category: '철학',     topic: '철학, 윤리, 논리학, 사상 용어',                  count: 50 },
  { level: 'B2', category: '과학',     topic: '과학 심화: 생물, 화학, 물리, 천문',              count: 55 },
  { level: 'B2', category: '기술',     topic: 'IT 심화, AI, 프로그래밍, 테크놀로지',            count: 50 },
  { level: 'B2', category: '경제',     topic: '경제 심화, 투자, 금융시장, 거시경제',            count: 55 },
  { level: 'B2', category: '정치',     topic: '정치 심화, 외교, 국제관계, 지정학',              count: 55 },
  { level: 'B2', category: '법률',     topic: '법률 심화, 계약, 소송, 형법, 민법',              count: 50 },
  { level: 'B2', category: '의료',     topic: '의학 용어 심화, 수술, 진단, 약학',               count: 50 },
  { level: 'B2', category: '환경',     topic: '환경 심화, 지속가능성, 에너지, 기후협약',        count: 50 },
  { level: 'B2', category: '심리',     topic: '심리학, 정신의학, 인지과학, 행동과학',           count: 50 },
  { level: 'B2', category: '사회',     topic: '사회학, 인구학, 사회운동, 계층',                 count: 50 },
  { level: 'B2', category: '문화',     topic: '문화 심화, 예술비평, 미학, 문화유산',            count: 50 },
  { level: 'B2', category: '문학',     topic: '문학 심화, 비평, 러시아 문학 특수 용어',         count: 55 },
  { level: 'B2', category: '역사',     topic: '러시아 역사, 소련, 현대사 특수 용어',            count: 55 },
  { level: 'B2', category: '언어',     topic: '언어학, 문법 용어, 러시아어 특징',               count: 50 },
  { level: 'B2', category: '동사',     topic: 'B2 고급 동사, 완료/불완료상 심화, 희귀 동사',    count: 65 },
  { level: 'B2', category: '동사',     topic: '접두사 동사 패턴 (вы-, за-, пере-, при- 등)',     count: 60 },
  { level: 'B2', category: '형용사',   topic: 'B2 고급 형용사, 분사형 형용사, 파생 형용사',     count: 60 },
  { level: 'B2', category: '부사',     topic: 'B2 고급 부사, 담화표지, 접속어',                 count: 55 },
  { level: 'B2', category: '숙어',     topic: '고급 숙어, 속담, 격언, 문학적 표현',             count: 55 },
  { level: 'B2', category: '비즈니스', topic: '비즈니스 심화, 마케팅, 기업경영, 협상',          count: 50 },
  { level: 'B2', category: '미디어',   topic: '미디어 심화, 저널리즘, 광고, 프로파간다',        count: 45 },
  { level: 'B2', category: '스포츠',   topic: '스포츠 전문 용어, 전술, 심판, 기록',             count: 45 },
  { level: 'B2', category: '건강',     topic: '건강 심화, 영양학, 피트니스, 예방의학',          count: 45 },
  { level: 'B2', category: '교육',     topic: '교육학, 교수법, 커리큘럼, 교육제도',             count: 45 },
  { level: 'B2', category: '지리',     topic: '지리 심화, 지역학, 러시아 지역',                 count: 45 },
  { level: 'B2', category: '종교',     topic: '신학, 종교철학, 러시아 정교회 심화',             count: 45 },
  { level: 'B2', category: '음악',     topic: '음악 이론, 클래식, 러시아 음악 전통',            count: 45 },
  { level: 'B2', category: '건축',     topic: '건축 심화, 러시아 건축 양식, 설계',              count: 45 },
  { level: 'B2', category: '자연',     topic: '자연과학, 생태학, 지질학, 해양학',               count: 50 },
  { level: 'B2', category: '수사학',   topic: '수사학, 논증, 설득, 담론, 레토릭',               count: 45 },
  { level: 'B2', category: '감정',     topic: '복잡한 감정, 미묘한 심리 상태, 관계 뉘앙스',     count: 50 },
  { level: 'B2', category: '파생어',   topic: '접두사 파생어 패턴 (вы-, пере-, раз- 등)',        count: 55 },
  { level: 'B2', category: '파생어',   topic: '접미사 파생어 패턴, 명사화, 형용사화',           count: 55 },
  { level: 'B2', category: '구어체',   topic: '구어체, 비격식 표현, 속어, 감탄사',              count: 50 },
  { level: 'B2', category: '문체',     topic: '문어체, 공문서, 학술 문체 특수 표현',            count: 50 },
  { level: 'B2', category: '과학',     topic: '수학 심화, 통계, 컴퓨터 과학 용어',              count: 50 },
  { level: 'B2', category: '정치',     topic: '행정, 관료제, 공공정책, 시민권',                 count: 50 },
  { level: 'B2', category: '일상',     topic: '고급 일상 표현, 뉘앙스, 품위 있는 표현',         count: 50 },
  { level: 'B2', category: '국제',     topic: '국제관계, 외교, 글로벌 이슈 어휘',               count: 50 },
];

// ── 배치 생성 함수 ────────────────────────────────────────────────
async function generateBatch(batch, attempt = 1) {
  const prompt = `러시아어 어휘 학습 데이터를 JSON 배열로 생성하세요.
레벨: ${batch.level} | 카테고리: ${batch.category} | 주제: ${batch.topic}
정확히 ${batch.count}개의 서로 다른 단어/표현을 생성하세요.

각 항목 형식:
{
  "russian": "강세 포함 러시아어 원형 (U+0301 사용, 예: приве́т, шко́ла)",
  "base": "강세 없는 기본형 (TTS용, 예: привет, школа)",
  "pronunciation": "한글 독음 (실제 발음에 가깝게, п/т/к는 된소리 ㅃ/ㄸ/ㄲ 사용)",
  "ipa": "IPA 발음기호",
  "korean": "한국어 뜻 (간결하게, 필요시 복수의미 포함)",
  "english": "English meaning (concise)"
}

발음 규칙:
- 강세 없는 о → 아 발음, е/я → 이 발음
- 어말 유성음 무성화: б→ф, в→ф, г→к, д→т, з→с
- п/т/к는 한국어 된소리(ㅃ/ㄸ/ㄲ)에 가깝게

JSON 배열만 응답 (다른 텍스트 없이):`;

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('JSON 배열을 찾을 수 없음');

    const words = JSON.parse(jsonMatch[0]);
    return words.map(w => ({ ...w, category: batch.category, level: batch.level }));
  } catch (err) {
    if (attempt < 3) {
      console.warn(`  재시도 ${attempt}/3: ${err.message}`);
      await sleep(2000 * attempt);
      return generateBatch(batch, attempt + 1);
    }
    console.error(`  실패: ${err.message}`);
    return [];
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ── TypeScript 파일 생성 ──────────────────────────────────────────
function escapeStr(s) {
  return String(s ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function generateTS(words) {
  const lines = words.map((w, i) =>
    `  { id: '${i + 1}', russian: '${escapeStr(w.russian)}', base: '${escapeStr(w.base)}', pronunciation: '${escapeStr(w.pronunciation)}', ipa: '${escapeStr(w.ipa)}', korean: '${escapeStr(w.korean)}', english: '${escapeStr(w.english)}', category: '${escapeStr(w.category)}', level: '${w.level}' }`
  );

  return `import type { VocabWord } from '../types';

export const vocabulary: VocabWord[] = [
${lines.join(',\n')},
];

export const categories = [...new Set(vocabulary.map(w => w.category))];
export const levels = ['A1', 'A2', 'B1', 'B2'] as const;
`;
}

// ── 메인 ─────────────────────────────────────────────────────────
async function main() {
  // 진행 상황 불러오기
  let progress = { completed: [], words: [] };
  if (existsSync(PROGRESS_FILE)) {
    try {
      progress = JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'));
      console.log(`⏩ 이어서 실행: 완료 ${progress.completed.length}배치, 단어 ${progress.words.length}개`);
    } catch {
      console.warn('진행 파일 손상, 처음부터 시작');
    }
  }

  const completedSet = new Set(progress.completed);
  let allWords = [...progress.words];

  const total = batches.length;
  let done = progress.completed.length;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const key = `${batch.level}:${batch.category}:${batch.topic}`;
    if (completedSet.has(key)) continue;

    process.stdout.write(`[${++done}/${total}] ${batch.level} ${batch.category} — ${batch.topic} `);

    const words = await generateBatch(batch);
    allWords.push(...words);
    progress.completed.push(key);
    progress.words = allWords;

    writeFileSync(PROGRESS_FILE, JSON.stringify(progress));
    console.log(`→ ${words.length}개 (누적: ${allWords.length})`);

    // 요청 간격 (속도 제한 방지)
    if (i < batches.length - 1) await sleep(600);
  }

  // 중복 제거 (base 기준)
  const seen = new Set();
  const deduped = allWords.filter(w => {
    const key = (w.base || w.russian || '').toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  console.log(`\n📊 생성: ${allWords.length}개 → 중복 제거 후: ${deduped.length}개`);

  // 레벨 순 정렬
  const levelOrder = { A1: 0, A2: 1, B1: 2, B2: 3 };
  deduped.sort((a, b) => (levelOrder[a.level] ?? 9) - (levelOrder[b.level] ?? 9));

  writeFileSync(OUTPUT_FILE, generateTS(deduped));
  console.log(`✅ 완료: ${OUTPUT_FILE}`);

  try { unlinkSync(PROGRESS_FILE); } catch {}
}

main().catch(err => {
  console.error('오류:', err.message);
  process.exit(1);
});
