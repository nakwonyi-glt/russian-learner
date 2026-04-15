#!/usr/bin/env node
/**
 * fix-pronunciation.mjs
 * 한글 독음 자리에 러시아어가 들어간 항목을 규칙 기반 음사로 교정합니다.
 *
 * 사용법: node fix-pronunciation.mjs
 */

import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VOCAB_PATH = join(__dirname, 'src/data/vocabulary.json');

// ── 한글 음절 조합 유틸 ────────────────────────────────────────────
const CHO_IDX  = { ㄱ:0,ㄲ:1,ㄴ:2,ㄷ:3,ㄸ:4,ㄹ:5,ㅁ:6,ㅂ:7,ㅃ:8,ㅅ:9,ㅆ:10,ㅇ:11,ㅈ:12,ㅉ:13,ㅊ:14,ㅋ:15,ㅌ:16,ㅍ:17,ㅎ:18 };
const JUNG_IDX = { ㅏ:0,ㅐ:1,ㅑ:2,ㅒ:3,ㅓ:4,ㅔ:5,ㅕ:6,ㅖ:7,ㅗ:8,ㅘ:9,ㅙ:10,ㅚ:11,ㅛ:12,ㅜ:13,ㅝ:14,ㅞ:15,ㅟ:16,ㅠ:17,ㅡ:18,ㅢ:19,ㅣ:20 };
const JONG_IDX = { ' ':0,ㄱ:1,ㄲ:2,ㄳ:3,ㄴ:4,ㄵ:5,ㄶ:6,ㄷ:7,ㄹ:8,ㄺ:9,ㄻ:10,ㄼ:11,ㄽ:12,ㄾ:13,ㄿ:14,ㅀ:15,ㅁ:16,ㅂ:17,ㅄ:18,ㅅ:19,ㅆ:20,ㅇ:21,ㅈ:22,ㅊ:23,ㅋ:24,ㅌ:25,ㅍ:26,ㅎ:27 };

function syl(cho, jung, jong = ' ') {
  const c = CHO_IDX[cho], v = JUNG_IDX[jung], f = JONG_IDX[jong];
  if (c === undefined || v === undefined || f === undefined) return '';
  return String.fromCharCode(0xAC00 + (c * 21 + v) * 28 + f);
}

// ── 러시아어 파싱 ──────────────────────────────────────────────────
const VOWELS = new Set('аеёиоуыэюя');
const isVowel = c => VOWELS.has(c);

function parseStressed(str) {
  const chars = [];
  const nfd = (str || '').normalize('NFD');
  for (let i = 0; i < nfd.length; i++) {
    if (nfd[i] === '\u0301') {
      if (chars.length) chars[chars.length - 1].stressed = true;
    } else {
      const ch = nfd[i].normalize('NFC').toLowerCase();
      chars.push({ ch, stressed: false });
    }
  }
  return chars;
}

// ── 모음 → 한글 중성 자모 (자음 뒤) ──────────────────────────────
function vowelJung(v, stressed) {
  switch (v) {
    case 'а': return 'ㅏ';
    case 'е': return stressed ? 'ㅔ' : 'ㅣ';
    case 'ё': return 'ㅛ';
    case 'и': return 'ㅣ';
    case 'о': return stressed ? 'ㅗ' : 'ㅏ';
    case 'у': return 'ㅜ';
    case 'ы': return 'ㅣ';
    case 'э': return 'ㅔ';
    case 'ю': return 'ㅠ';
    case 'я': return stressed ? 'ㅑ' : 'ㅏ';
    default:  return 'ㅡ';
  }
}

// ── 모음 → 한글 독립 음절 (어두 or 모음 뒤) ──────────────────────
function vowelAlone(v, stressed) {
  switch (v) {
    case 'а': return '아';
    case 'е': return '예';
    case 'ё': return '요';
    case 'и': return '이';
    case 'о': return stressed ? '오' : '아';
    case 'у': return '우';
    case 'ы': return '이';
    case 'э': return '에';
    case 'ю': return '유';
    case 'я': return stressed ? '야' : '야';
    default:  return '';
  }
}

// ── 자음 초성 자모 매핑 ────────────────────────────────────────────
// п/т/к → 된소리 (ㅃ/ㄸ/ㄲ)
const INITIAL = {
  б:'ㅂ', в:'ㅂ', г:'ㄱ', д:'ㄷ', ж:'ㅈ', з:'ㅈ', й:'ㅇ',
  к:'ㄲ', л:'ㄹ', м:'ㅁ', н:'ㄴ', п:'ㅃ', р:'ㄹ', с:'ㅅ',
  т:'ㄸ', ф:'ㅍ', х:'ㅎ',
};

// ── 종성 자모 매핑 (어말 자음) ────────────────────────────────────
const FINAL_JONG = {
  б:'ㅂ', в:'ㅂ', г:'ㄱ', д:'ㄷ', з:'ㅅ', й:'ㅇ',
  к:'ㄱ', л:'ㄹ', м:'ㅁ', н:'ㄴ', п:'ㅂ', р:'ㄹ', с:'ㅅ',
  т:'ㅅ', ф:'ㅍ', х:'ㄱ',
};

// ── 특수 자음 + 모음 조합 ─────────────────────────────────────────
const SPECIAL_CV = {
  ш: { ㅏ:'샤', ㅣ:'시', ㅗ:'쇼', ㅜ:'슈', ㅠ:'슈', ㅔ:'셰', ㅛ:'쇼', ㅑ:'샤', ㅡ:'슈' },
  щ: { ㅏ:'샤', ㅣ:'시', ㅗ:'쇼', ㅜ:'슈', ㅠ:'슈', ㅔ:'셰', ㅛ:'쇼', ㅑ:'샤', ㅡ:'시' },
  ч: { ㅏ:'차', ㅣ:'치', ㅗ:'초', ㅜ:'추', ㅠ:'츄', ㅔ:'체', ㅛ:'쵸', ㅑ:'차', ㅡ:'치' },
  ц: { ㅏ:'짜', ㅣ:'치', ㅗ:'쪼', ㅜ:'쭈', ㅠ:'츄', ㅔ:'체', ㅛ:'쪼', ㅑ:'짜', ㅡ:'츠' },
  ж: { ㅏ:'쟈', ㅣ:'지', ㅗ:'줴', ㅜ:'쥬', ㅠ:'쥬', ㅔ:'줴', ㅛ:'줴', ㅑ:'쟈', ㅡ:'즈' },
};
const SPECIAL_ALONE = { ш:'슈', щ:'시', ч:'치', ц:'츠', ж:'즈' };
const SPECIAL_CONS  = new Set(['ш','щ','ч','ц','ж']);

// ── 단어 단위 음사 ────────────────────────────────────────────────
function transliterateWord(chars) {
  // ь / ъ 제거
  const toks = chars.filter(c => c.ch !== 'ь' && c.ch !== 'ъ');
  const n = toks.length;
  if (!n) return '';

  let result = '';
  let i = 0;

  while (i < n) {
    const { ch, stressed } = toks[i];
    const next  = i + 1 < n ? toks[i + 1] : null;
    const nnext = i + 2 < n ? toks[i + 2] : null;
    const isLast = i === n - 1;

    // ── 모음 ───────────────────────────────────────────────────────
    if (isVowel(ch)) {
      result += vowelAlone(ch, stressed);
      i++;
      continue;
    }

    // ── 특수 자음 (ш щ ч ц ж) ──────────────────────────────────
    if (SPECIAL_CONS.has(ch)) {
      if (next && isVowel(next.ch)) {
        const jung = vowelJung(next.ch, next.stressed);
        result += SPECIAL_CV[ch]?.[jung] ?? SPECIAL_ALONE[ch];
        i += 2;
      } else {
        result += SPECIAL_ALONE[ch];
        i++;
      }
      continue;
    }

    // ── 일반 자음 ──────────────────────────────────────────────────
    const initial = INITIAL[ch] ?? 'ㅇ';

    if (next && isVowel(next.ch)) {
      // C + V → 음절
      const jung = vowelJung(next.ch, next.stressed);

      // 다음 다음이 어말 자음이면 받침 추가
      let jong = ' ';
      if (nnext && !isVowel(nnext.ch) && !SPECIAL_CONS.has(nnext.ch)) {
        const isNnextLast = i + 2 === n - 1;
        const nnnext = i + 3 < n ? toks[i + 3] : null;
        // nnext 뒤에 모음이 없으면 받침으로 사용
        if (isNnextLast || !nnnext || !isVowel(nnnext.ch)) {
          jong = FINAL_JONG[nnext.ch] ?? ' ';
          if (jong !== ' ') {
            result += syl(initial, jung, jong);
            i += 3; // C + V + C_final 소비
            continue;
          }
        }
      }

      result += syl(initial, jung);
      i += 2;
    } else {
      // 자음 단독 → ㅡ 음절 (또는 어말 자음이면 이전 음절에 받침으로?)
      // 여기서는 단순히 ㅡ 음절로 처리
      result += syl(initial, 'ㅡ');
      i++;
    }
  }

  return result;
}

// ── 전체 문자열 (복합어 포함) ────────────────────────────────────
function transliterate(russianStr) {
  return russianStr
    .split(/(\s+)/)
    .map(part => /^\s+$/.test(part) ? ' ' : transliterateWord(parseStressed(part)))
    .join('')
    .trim();
}

// ── 한글 여부 판별 ────────────────────────────────────────────────
function hasHangul(str) {
  return /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(str);
}
function hasCyrillic(str) {
  return /[а-яёА-ЯЁ]/.test(str);
}

// ── 메인 ─────────────────────────────────────────────────────────
const vocab = JSON.parse(readFileSync(VOCAB_PATH, 'utf-8'));

let fixed = 0;
let skipped = 0;

const updated = vocab.map(word => {
  const pron = word.pronunciation ?? '';

  // 한글이 없고 키릴이 있는 경우 → 교정 대상
  if (hasCyrillic(pron) && !hasHangul(pron)) {
    const source = word.russian || word.base || '';
    if (!source) { skipped++; return word; }

    const generated = transliterate(source);
    if (!generated) { skipped++; return word; }

    fixed++;
    return { ...word, pronunciation: generated };
  }

  skipped++;
  return word;
});

console.log(`\n📊 교정 결과:`);
console.log(`  ✅ 교정 완료: ${fixed}개`);
console.log(`  ⚪ 유지 (한글 있음 or 비어있음): ${skipped}개`);

// 샘플 확인
const samples = updated.filter(w => {
  const orig = vocab.find(v => v.id === w.id);
  return orig && hasCyrillic(orig.pronunciation ?? '') && !hasHangul(orig.pronunciation ?? '');
}).slice(0, 10);

console.log('\n🔍 교정 샘플 (처음 10개):');
samples.forEach(w => {
  const orig = vocab.find(v => v.id === w.id);
  console.log(`  ${orig.base} : [${orig.pronunciation}] → [${w.pronunciation}]`);
});

writeFileSync(VOCAB_PATH, JSON.stringify(updated, null, 2));
console.log(`\n✅ vocabulary.json 업데이트 완료`);
