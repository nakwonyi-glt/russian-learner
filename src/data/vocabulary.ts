import type { VocabWord } from '../types';

export const vocabulary: VocabWord[] = [
  // 인사/기본 표현 (A1)
  { id: '1', russian: 'приве́т', base: 'привет', pronunciation: '쁘리볫', ipa: 'prʲɪˈvʲet', korean: '안녕 (비격식)', english: 'hi', category: '인사', level: 'A1' },
  { id: '2', russian: 'здра́вствуйте', base: 'здравствуйте', pronunciation: '즈드라스뜨부이쩨', ipa: 'ˈzdrastvʊjtʲɪ', korean: '안녕하세요 (격식)', english: 'hello', category: '인사', level: 'A1' },
  { id: '3', russian: 'до свида́ния', base: 'до свидания', pronunciation: '다 스비다니야', ipa: 'də svʲɪˈdanʲɪjə', korean: '안녕히 계세요', english: 'goodbye', category: '인사', level: 'A1' },
  { id: '4', russian: 'пожа́луйста', base: 'пожалуйста', pronunciation: '빠좔루이스따', ipa: 'pɐˈʐalʊjstə', korean: '부탁합니다 / 천만에요', english: 'please / you\'re welcome', category: '인사', level: 'A1' },
  { id: '5', russian: 'спаси́бо', base: 'спасибо', pronunciation: '스빠씨바', ipa: 'spɐˈsʲibə', korean: '감사합니다', english: 'thank you', category: '인사', level: 'A1' },
  { id: '6', russian: 'извини́те', base: 'извините', pronunciation: '이즈비니쩨', ipa: 'ɪzvʲɪˈnʲitʲɪ', korean: '실례합니다 / 죄송합니다', english: 'excuse me / sorry', category: '인사', level: 'A1' },
  { id: '7', russian: 'да', base: 'да', pronunciation: '다', ipa: 'da', korean: '네', english: 'yes', category: '기본', level: 'A1' },
  { id: '8', russian: 'нет', base: 'нет', pronunciation: '녯', ipa: 'nʲet', korean: '아니요', english: 'no', category: '기본', level: 'A1' },

  // 숫자 (A1)
  { id: '9', russian: 'оди́н', base: 'один', pronunciation: '아진', ipa: 'ɐˈdʲin', korean: '하나', english: 'one', category: '숫자', level: 'A1' },
  { id: '10', russian: 'два', base: 'два', pronunciation: '드바', ipa: 'dva', korean: '둘', english: 'two', category: '숫자', level: 'A1' },
  { id: '11', russian: 'три', base: 'три', pronunciation: '뜨리', ipa: 'trʲi', korean: '셋', english: 'three', category: '숫자', level: 'A1' },
  { id: '12', russian: 'четы́ре', base: 'четыре', pronunciation: '치뜨이리', ipa: 'tɕɪˈtɨrʲɪ', korean: '넷', english: 'four', category: '숫자', level: 'A1' },
  { id: '13', russian: 'пять', base: 'пять', pronunciation: '뺘찌', ipa: 'pʲætʲ', korean: '다섯', english: 'five', category: '숫자', level: 'A1' },
  { id: '14', russian: 'де́сять', base: 'десять', pronunciation: '제씨찌', ipa: 'ˈdʲesʲɪtʲ', korean: '열', english: 'ten', category: '숫자', level: 'A1' },
  { id: '15', russian: 'сто', base: 'сто', pronunciation: '스또', ipa: 'sto', korean: '백', english: 'hundred', category: '숫자', level: 'A1' },

  // 사람/가족 (A1)
  { id: '16', russian: 'челове́к', base: 'человек', pronunciation: '칠라볙', ipa: 'tɕɪləˈvʲek', korean: '사람', english: 'person', category: '사람', level: 'A1' },
  { id: '17', russian: 'ма́ма', base: 'мама', pronunciation: '마마', ipa: 'ˈmamə', korean: '엄마', english: 'mom', category: '가족', level: 'A1' },
  { id: '18', russian: 'па́па', base: 'папа', pronunciation: '빠빠', ipa: 'ˈpapə', korean: '아빠', english: 'dad', category: '가족', level: 'A1' },
  { id: '19', russian: 'сын', base: 'сын', pronunciation: '씬', ipa: 'sɨn', korean: '아들', english: 'son', category: '가족', level: 'A1' },
  { id: '20', russian: 'дочь', base: 'дочь', pronunciation: '도치', ipa: 'dotɕ', korean: '딸', english: 'daughter', category: '가족', level: 'A1' },
  { id: '21', russian: 'друг', base: 'друг', pronunciation: '드룩', ipa: 'druk', korean: '친구 (남)', english: 'friend (male)', category: '사람', level: 'A1' },
  { id: '22', russian: 'подру́га', base: 'подруга', pronunciation: '빠드루가', ipa: 'pɐˈdrugə', korean: '친구 (여)', english: 'friend (female)', category: '사람', level: 'A1' },

  // 시간 (A1)
  { id: '23', russian: 'сего́дня', base: 'сегодня', pronunciation: '씨보드냐', ipa: 'sʲɪˈvodnʲə', korean: '오늘', english: 'today', category: '시간', level: 'A1' },
  { id: '24', russian: 'за́втра', base: 'завтра', pronunciation: '자프뜨라', ipa: 'ˈzaftrə', korean: '내일', english: 'tomorrow', category: '시간', level: 'A1' },
  { id: '25', russian: 'вчера́', base: 'вчера', pronunciation: '프치라', ipa: 'ftɕɪˈra', korean: '어제', english: 'yesterday', category: '시간', level: 'A1' },
  { id: '26', russian: 'сейча́с', base: 'сейчас', pronunciation: '씨차스', ipa: 'sʲɪjˈtɕas', korean: '지금', english: 'now', category: '시간', level: 'A1' },

  // 장소 (A1)
  { id: '27', russian: 'дом', base: 'дом', pronunciation: '돔', ipa: 'dom', korean: '집', english: 'house / home', category: '장소', level: 'A1' },
  { id: '28', russian: 'шко́ла', base: 'школа', pronunciation: '쉬꼴라', ipa: 'ˈʂkolə', korean: '학교', english: 'school', category: '장소', level: 'A1' },
  { id: '29', russian: 'университе́т', base: 'университет', pronunciation: '우니볘르씨뗏', ipa: 'ʊnʲɪvʲɪrsʲɪˈtʲet', korean: '대학교', english: 'university', category: '장소', level: 'A1' },
  { id: '30', russian: 'го́род', base: 'город', pronunciation: '고라뜨', ipa: 'ˈgorət', korean: '도시', english: 'city', category: '장소', level: 'A1' },

  // 동사 (A1-A2)
  { id: '31', russian: 'знать', base: 'знать', pronunciation: '즈나찌', ipa: 'znatʲ', korean: '알다', english: 'to know', category: '동사', level: 'A1' },
  { id: '32', russian: 'говори́ть', base: 'говорить', pronunciation: '가바리찌', ipa: 'ɡəvɐˈrʲitʲ', korean: '말하다', english: 'to speak', category: '동사', level: 'A1' },
  { id: '33', russian: 'чита́ть', base: 'читать', pronunciation: '치따찌', ipa: 'tɕɪˈtatʲ', korean: '읽다', english: 'to read', category: '동사', level: 'A1' },
  { id: '34', russian: 'писа́ть', base: 'писать', pronunciation: '삐사찌', ipa: 'pʲɪˈsatʲ', korean: '쓰다', english: 'to write', category: '동사', level: 'A1' },
  { id: '35', russian: 'слу́шать', base: 'слушать', pronunciation: '슬루샤찌', ipa: 'ˈsluʂətʲ', korean: '듣다', english: 'to listen', category: '동사', level: 'A1' },
  { id: '36', russian: 'ви́деть', base: 'видеть', pronunciation: '비지찌', ipa: 'ˈvʲidʲɪtʲ', korean: '보다', english: 'to see', category: '동사', level: 'A1' },
  { id: '37', russian: 'люби́ть', base: 'любить', pronunciation: '류비찌', ipa: 'lʲʊˈbʲitʲ', korean: '사랑하다 / 좋아하다', english: 'to love / to like', category: '동사', level: 'A1' },
  { id: '38', russian: 'есть', base: 'есть', pronunciation: '예스찌', ipa: 'jesʲtʲ', korean: '먹다 / 있다', english: 'to eat / to be', category: '동사', level: 'A1' },
  { id: '39', russian: 'идти́', base: 'идти', pronunciation: '이드찌', ipa: 'ɪdˈtʲi', korean: '가다 (도보)', english: 'to go (on foot)', category: '동사', level: 'A1' },
  { id: '40', russian: 'рабо́тать', base: 'работать', pronunciation: '라보따찌', ipa: 'rɐˈbotətʲ', korean: '일하다', english: 'to work', category: '동사', level: 'A2' },

  // 형용사 (A1-A2)
  { id: '41', russian: 'хоро́ший', base: 'хороший', pronunciation: '하로쉬이', ipa: 'xɐˈroʂɨj', korean: '좋은', english: 'good', category: '형용사', level: 'A1' },
  { id: '42', russian: 'плохо́й', base: 'плохой', pronunciation: '쁠라호이', ipa: 'plɐˈxoj', korean: '나쁜', english: 'bad', category: '형용사', level: 'A1' },
  { id: '43', russian: 'большо́й', base: 'большой', pronunciation: '발쇼이', ipa: 'bɐlʲˈʂoj', korean: '큰', english: 'big', category: '형용사', level: 'A1' },
  { id: '44', russian: 'ма́ленький', base: 'маленький', pronunciation: '말린끼이', ipa: 'ˈmalʲɪnʲkʲɪj', korean: '작은', english: 'small', category: '형용사', level: 'A1' },
  { id: '45', russian: 'но́вый', base: 'новый', pronunciation: '노비이', ipa: 'ˈnovɨj', korean: '새로운', english: 'new', category: '형용사', level: 'A1' },
  { id: '46', russian: 'кра́сивый', base: 'красивый', pronunciation: '끄라씨비이', ipa: 'krɐˈsʲivɨj', korean: '아름다운', english: 'beautiful', category: '형용사', level: 'A1' },
  { id: '47', russian: 'интере́сный', base: 'интересный', pronunciation: '인찌례스느이', ipa: 'ɪntʲɪˈrʲesnɨj', korean: '흥미로운', english: 'interesting', category: '형용사', level: 'A2' },
  { id: '48', russian: 'тру́дный', base: 'трудный', pronunciation: '뜨루드느이', ipa: 'ˈtrudnɨj', korean: '어려운', english: 'difficult', category: '형용사', level: 'A2' },

  // 음식 (A1-A2)
  { id: '49', russian: 'вода́', base: 'вода', pronunciation: '바다', ipa: 'vɐˈda', korean: '물', english: 'water', category: '음식', level: 'A1' },
  { id: '50', russian: 'хлеб', base: 'хлеб', pronunciation: '흘렙', ipa: 'xlʲep', korean: '빵', english: 'bread', category: '음식', level: 'A1' },
  { id: '51', russian: 'мо́локо', base: 'молоко', pronunciation: '말라꼬', ipa: 'məlɐˈko', korean: '우유', english: 'milk', category: '음식', level: 'A1' },
  { id: '52', russian: 'чай', base: 'чай', pronunciation: '차이', ipa: 'tɕaj', korean: '차 (음료)', english: 'tea', category: '음식', level: 'A1' },
  { id: '53', russian: 'ко́фе', base: 'кофе', pronunciation: '꼬피', ipa: 'ˈkofʲɪ', korean: '커피', english: 'coffee', category: '음식', level: 'A1' },

  // B1 어휘
  { id: '54', russian: 'возмо́жность', base: 'возможность', pronunciation: '바즈모쥐나스찌', ipa: 'vɐzˈmoʐnəsʲtʲ', korean: '가능성', english: 'possibility / opportunity', category: '명사', level: 'B1' },
  { id: '55', russian: 'разви́тие', base: 'развитие', pronunciation: '라즈비찌예', ipa: 'rɐzˈvʲitʲɪjɪ', korean: '발전', english: 'development', category: '명사', level: 'B1' },
  { id: '56', russian: 'о́бщество', base: 'общество', pronunciation: '옵쉬이스뜨바', ipa: 'ˈopɕɪstvə', korean: '사회', english: 'society', category: '명사', level: 'B1' },
  { id: '57', russian: 'иностра́нный', base: 'иностранный', pronunciation: '이나스뜨란느이', ipa: 'ɪnɐˈstrannɨj', korean: '외국의', english: 'foreign', category: '형용사', level: 'B1' },
  { id: '58', russian: 'вопро́с', base: 'вопрос', pronunciation: '바쁘로스', ipa: 'vɐˈpros', korean: '질문', english: 'question', category: '명사', level: 'A2' },
  { id: '59', russian: 'отве́т', base: 'ответ', pronunciation: '아뜨볫', ipa: 'ɐtˈvʲet', korean: '대답', english: 'answer', category: '명사', level: 'A2' },
  { id: '60', russian: 'язы́к', base: 'язык', pronunciation: '이직', ipa: 'jɪˈzɨk', korean: '언어 / 혀', english: 'language / tongue', category: '명사', level: 'A1' },
];

export const categories = [...new Set(vocabulary.map(w => w.category))];
export const levels = ['A1', 'A2', 'B1', 'B2'] as const;
