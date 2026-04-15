#!/usr/bin/env node
/**
 * Russian Stress Corrector
 * OpenRussian 오픈소스 사전 DB를 사용해 vocabulary.json의 강세 표시를 교정합니다.
 *
 * 사용법: node fix-stress.mjs
 *
 * 데이터 출처: https://github.com/Badestrand/russian-dictionary (CC BY-SA 4.0)
 */

import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const VOCAB_PATH = join(__dirname, 'src/data/vocabulary.json');
const BACKUP_PATH = join(__dirname, 'src/data/vocabulary.backup.json');

const BASE_URL = 'https://raw.githubusercontent.com/Badestrand/russian-dictionary/master/';
const CSV_FILES = ['nouns.csv', 'adjectives.csv', 'verbs.csv', 'others.csv'];

// OpenRussian 강세 형식: 강세 모음 뒤에 ' 삽입 (예: приве'т)
// → 유니코드 결합 강세 형식으로 변환 (예: приве́т = е + U+0301)
function convertOpenRussianAccent(str) {
  if (!str || str === 'null') return null;
  const VOWELS = 'аеёиоуыэюяАЕЁИОУЫЭЮЯ';
  let result = '';
  for (let i = 0; i < str.length; i++) {
    result += str[i];
    if (VOWELS.includes(str[i]) && str[i + 1] === "'") {
      result += '\u0301'; // combining acute accent
      i++;               // ' 건너뜀
    }
  }
  return result;
}

// 기존 강세 표시 제거 (base 비교용)
function stripAccent(str) {
  return str ? str.normalize('NFD').replace(/\u0301/g, '').normalize('NFC') : '';
}

function parseCSVIntoMap(csvText, map) {
  const lines = csvText.split('\n');
  if (!lines.length) return 0;

  const headers     = lines[0].split('\t').map(h => h.trim());
  const bareIdx     = headers.indexOf('bare');
  const accentedIdx = headers.indexOf('accented');
  if (bareIdx < 0 || accentedIdx < 0) return 0;

  let loaded = 0;
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split('\t');
    if (cols.length <= Math.max(bareIdx, accentedIdx)) continue;

    const bare     = cols[bareIdx]?.trim().toLowerCase();
    const accented = cols[accentedIdx]?.trim();
    if (!bare || !accented || accented === 'null' || accented === '') continue;

    const unicode = convertOpenRussianAccent(accented);
    if (unicode && !map.has(bare)) {
      map.set(bare, unicode);
      loaded++;
    }
  }
  return loaded;
}

async function buildStressMap() {
  const map = new Map();
  for (const file of CSV_FILES) {
    process.stdout.write(`  📥 ${file} 다운로드 중... `);
    const res = await fetch(BASE_URL + file);
    if (!res.ok) { console.log(`❌ ${res.status}`); continue; }
    const text = await res.text();
    const count = parseCSVIntoMap(text, map);
    console.log(`${count.toLocaleString()}개`);
  }
  console.log(`✅ 총 ${map.size.toLocaleString()}개 단어 로드됨`);
  return map;
}

// 복합 단어 (공백 포함) 처리: 각 단어별로 개별 조회 후 재조합
function fixMultiWord(base, stressMap) {
  const words = base.split(' ');
  const fixed = words.map(w => {
    const key = w.toLowerCase();
    return stressMap.get(key) ?? w; // 없으면 원형 유지
  });
  // 전체 단어 중 적어도 하나라도 교정됐으면 반환
  const changed = fixed.some((w, i) => stripAccent(w) !== words[i].toLowerCase() || w.includes('\u0301'));
  return changed ? fixed.join(' ') : null;
}

async function main() {
  // 1) 백업
  if (!existsSync(BACKUP_PATH)) {
    const original = readFileSync(VOCAB_PATH, 'utf-8');
    writeFileSync(BACKUP_PATH, original);
    console.log('💾 백업 생성:', BACKUP_PATH);
  } else {
    console.log('ℹ️  백업 이미 존재 (덮어쓰지 않음)');
  }

  // 2) OpenRussian 다운로드 & 파싱
  console.log('📥 OpenRussian 사전 다운로드 중...');
  const stressMap = await buildStressMap();

  // 3) vocabulary.json 로드
  const vocab = JSON.parse(readFileSync(VOCAB_PATH, 'utf-8'));
  console.log(`\n📖 어휘 로드: ${vocab.length}개`);

  // 4) 교정
  let fixed       = 0;   // 교정 성공
  let alreadyOk   = 0;   // 이미 일치
  let notFound    = 0;   // DB에 없음
  let multiFixed  = 0;   // 복합 단어 교정

  const updated = vocab.map(word => {
    const base = word.base?.trim().toLowerCase();
    if (!base) return word;

    const hasSpace = base.includes(' ');

    if (hasSpace) {
      // 복합 단어
      const result = fixMultiWord(base, stressMap);
      if (result) {
        multiFixed++;
        return { ...word, russian: result };
      }
      notFound++;
      return word;
    }

    if (stressMap.has(base)) {
      const corrected = stressMap.get(base);
      const currentStripped = stripAccent(word.russian ?? '');

      if (corrected === word.russian) {
        alreadyOk++;
        return word;
      }
      // DB 기준 base와 현재 base가 같을 때만 교체
      if (stripAccent(corrected).toLowerCase() === base) {
        fixed++;
        return { ...word, russian: corrected };
      }
    }

    notFound++;
    return word;
  });

  // 5) 결과 출력
  console.log('\n📊 교정 결과:');
  console.log(`  ✅ 교정 완료  : ${fixed}개`);
  console.log(`  ✅ 복합어 교정: ${multiFixed}개`);
  console.log(`  ⚪ 이미 일치  : ${alreadyOk}개`);
  console.log(`  ❌ DB 미수록  : ${notFound}개`);
  console.log(`  합계          : ${vocab.length}개`);

  // 6) 저장
  writeFileSync(VOCAB_PATH, JSON.stringify(updated, null, 2));
  console.log(`\n✅ vocabulary.json 업데이트 완료`);

  // 미수록 단어 샘플 출력
  const missing = vocab.filter(w => {
    const base = w.base?.trim().toLowerCase();
    if (!base || base.includes(' ')) return false;
    return !stressMap.has(base);
  }).slice(0, 10);

  if (missing.length) {
    console.log('\n🔍 DB 미수록 샘플 (처음 10개):');
    missing.forEach(w => console.log(`  ${w.base} → 현재: ${w.russian}`));
  }
}

main().catch(err => {
  console.error('❌ 오류:', err.message);
  process.exit(1);
});
