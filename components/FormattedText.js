import React from "react";
import { Text, StyleSheet } from "react-native";

// 마크다운 스타일 텍스트 파싱 및 렌더링
// 지원 형식: **굵게**, *기울임*, ~~취소선~~, `코드`
export default function FormattedText({ text, style, baseStyle }) {
  if (!text) return null;

  const parseText = (input) => {
    const tokens = [];
    let remaining = input;
    let key = 0;

    // 패턴 정의 (순서 중요: 긴 패턴부터)
    const patterns = [
      { regex: /\*\*(.+?)\*\*/g, style: styles.bold },
      { regex: /\*(.+?)\*/g, style: styles.italic },
      { regex: /~~(.+?)~~/g, style: styles.strikethrough },
      { regex: /`(.+?)`/g, style: styles.code },
    ];

    // 모든 매치 찾기
    const matches = [];
    patterns.forEach(({ regex, style }) => {
      let match;
      const regexCopy = new RegExp(regex.source, regex.flags);
      while ((match = regexCopy.exec(input)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[1],
          fullMatch: match[0],
          style,
        });
      }
    });

    // 겹치는 매치 제거 (먼저 시작하는 것 우선)
    matches.sort((a, b) => a.start - b.start);
    const filteredMatches = [];
    let lastEnd = -1;
    for (const match of matches) {
      if (match.start >= lastEnd) {
        filteredMatches.push(match);
        lastEnd = match.end;
      }
    }

    // 토큰 생성
    let currentIndex = 0;
    for (const match of filteredMatches) {
      // 매치 전 일반 텍스트
      if (match.start > currentIndex) {
        tokens.push(
          <Text key={key++} style={baseStyle}>
            {input.substring(currentIndex, match.start)}
          </Text>
        );
      }
      // 스타일이 적용된 텍스트
      tokens.push(
        <Text key={key++} style={[baseStyle, match.style]}>
          {match.text}
        </Text>
      );
      currentIndex = match.end;
    }

    // 마지막 일반 텍스트
    if (currentIndex < input.length) {
      tokens.push(
        <Text key={key++} style={baseStyle}>
          {input.substring(currentIndex)}
        </Text>
      );
    }

    return tokens.length > 0 ? tokens : <Text style={baseStyle}>{input}</Text>;
  };

  return <Text style={style}>{parseText(text)}</Text>;
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: "700",
  },
  italic: {
    fontStyle: "italic",
  },
  strikethrough: {
    textDecorationLine: "line-through",
  },
  code: {
    fontFamily: "monospace",
    backgroundColor: "#F0F0F0",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
});
