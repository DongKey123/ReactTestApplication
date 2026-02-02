// AI 서비스 유틸리티
// 실제 API 연동 시 API_KEY와 엔드포인트를 설정하세요

const AI_CONFIG = {
  // OpenAI API 사용 시
  // apiKey: 'your-openai-api-key',
  // endpoint: 'https://api.openai.com/v1/chat/completions',
  // model: 'gpt-3.5-turbo',

  // 현재는 로컬 처리 모드
  useLocalProcessing: true,
};

// 제목 자동 생성
export async function generateTitle(content) {
  if (!content || content.trim().length < 5) {
    return null;
  }

  if (AI_CONFIG.useLocalProcessing) {
    return localGenerateTitle(content);
  }

  // 실제 API 호출 (OpenAI 예시)
  // try {
  //   const response = await fetch(AI_CONFIG.endpoint, {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
  //     },
  //     body: JSON.stringify({
  //       model: AI_CONFIG.model,
  //       messages: [
  //         { role: 'system', content: '주어진 내용을 바탕으로 짧고 명확한 제목을 한국어로 생성해주세요. 제목만 출력하세요.' },
  //         { role: 'user', content: content }
  //       ],
  //       max_tokens: 50,
  //     }),
  //   });
  //   const data = await response.json();
  //   return data.choices[0].message.content.trim();
  // } catch (error) {
  //   console.error('AI 제목 생성 실패:', error);
  //   return localGenerateTitle(content);
  // }
}

// 내용 요약
export async function summarizeContent(content) {
  if (!content || content.trim().length < 50) {
    return null;
  }

  if (AI_CONFIG.useLocalProcessing) {
    return localSummarize(content);
  }

  // 실제 API 호출 코드...
}

// 내용 확장
export async function expandContent(content, style = "detailed") {
  if (!content || content.trim().length < 10) {
    return null;
  }

  if (AI_CONFIG.useLocalProcessing) {
    return localExpand(content, style);
  }

  // 실제 API 호출 코드...
}

// 문법 및 맞춤법 교정
export async function correctGrammar(content) {
  if (!content || content.trim().length < 5) {
    return null;
  }

  if (AI_CONFIG.useLocalProcessing) {
    return localCorrectGrammar(content);
  }
}

// ===== 로컬 처리 함수들 =====

// 로컬 제목 생성 (첫 문장 또는 핵심 키워드 기반)
function localGenerateTitle(content) {
  const lines = content.split('\n').filter(line => line.trim());

  if (lines.length === 0) return null;

  // 첫 줄이 짧으면 제목으로 사용
  const firstLine = lines[0].trim();
  if (firstLine.length <= 30) {
    return firstLine;
  }

  // 첫 문장 추출
  const sentences = content.match(/[^.!?]+[.!?]?/g);
  if (sentences && sentences.length > 0) {
    const firstSentence = sentences[0].trim();
    if (firstSentence.length <= 40) {
      return firstSentence.replace(/[.!?]$/, '');
    }
    // 첫 문장이 길면 앞부분만
    return firstSentence.substring(0, 30) + '...';
  }

  // 기본: 내용 앞부분
  return content.substring(0, 30).trim() + '...';
}

// 로컬 요약 (핵심 문장 추출)
function localSummarize(content) {
  const sentences = content
    .replace(/\n+/g, ' ')
    .match(/[^.!?]+[.!?]/g);

  if (!sentences || sentences.length === 0) {
    return content.substring(0, 100) + '...';
  }

  // 중요도 기반 문장 선택 (길이, 키워드 등)
  const importantKeywords = ['중요', '핵심', '결론', '요약', '따라서', '결과', '목표', '계획'];

  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;

    // 첫 문장에 가산점
    if (index === 0) score += 3;
    // 마지막 문장에 가산점
    if (index === sentences.length - 1) score += 2;

    // 중요 키워드 포함 시 가산점
    importantKeywords.forEach(keyword => {
      if (sentence.includes(keyword)) score += 2;
    });

    // 적절한 길이의 문장에 가산점
    const length = sentence.trim().length;
    if (length > 20 && length < 100) score += 1;

    return { sentence: sentence.trim(), score };
  });

  // 점수 순으로 정렬하여 상위 3개 선택
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));

  return topSentences.map(s => s.sentence).join(' ');
}

// 로컬 내용 확장
function localExpand(content, style) {
  const lines = content.split('\n').filter(line => line.trim());

  const expansions = {
    detailed: {
      prefix: "다음은 자세한 내용입니다:\n\n",
      bulletPoints: true,
    },
    formal: {
      prefix: "",
      suffix: "\n\n위 내용을 참고하시기 바랍니다.",
    },
    casual: {
      prefix: "",
      suffix: "\n\n이렇게 정리해봤어요!",
    },
  };

  const config = expansions[style] || expansions.detailed;
  let result = config.prefix || "";

  if (config.bulletPoints && lines.length > 1) {
    // 각 줄을 불릿 포인트로 변환
    result += lines.map(line => `• ${line.trim()}`).join('\n');
  } else {
    result += content;
  }

  if (config.suffix) {
    result += config.suffix;
  }

  return result;
}

// 로컬 문법 교정 (기본적인 교정만)
function localCorrectGrammar(content) {
  let corrected = content;

  // 기본적인 띄어쓰기 교정
  const corrections = [
    [/([가-힣])([A-Za-z])/g, '$1 $2'],
    [/([A-Za-z])([가-힣])/g, '$1 $2'],
    [/\s+/g, ' '],
    [/\s+([.!?,])/g, '$1'],
    [/([.!?])([가-힣A-Za-z])/g, '$1 $2'],
  ];

  corrections.forEach(([pattern, replacement]) => {
    corrected = corrected.replace(pattern, replacement);
  });

  return corrected.trim();
}

// AI 기능 사용 가능 여부 확인
export function isAIAvailable() {
  return true; // 로컬 처리는 항상 사용 가능
}

// AI 설정 정보
export function getAIConfig() {
  return {
    useLocalProcessing: AI_CONFIG.useLocalProcessing,
    features: ['generateTitle', 'summarize', 'expand', 'correctGrammar'],
  };
}
