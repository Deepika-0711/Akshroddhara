/**
 * Pure JavaScript Token-Level Diff Utility for Kannada Unicode Text
 * 
 * Accurately calculates additions, deletions, and unchanged segments
 * between the original OCR text and the human-edited working copy,
 * preserving authentic Kannada ligatures, vowel signs, and punctuation.
 */

/**
 * Splits text into tokens while preserving whitespace and punctuation as distinct tokens.
 */
export const tokenizeText = (text = '') => {
  if (!text) return [];
  // Matches words (including Kannada Unicode ranges \u0C80-\u0CFF) or whitespace/punctuation
  const tokens = [];
  const regex = /([\u0C80-\u0CFF\w]+|[^\S\r\n]+|\r?\n|[.,;:!?॥।()"'—–\-\[\]{}])/gu;
  let match;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(text.slice(lastIndex, match.index));
    }
    tokens.push(match[0]);
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(text.slice(lastIndex));
  }

  return tokens;
};

/**
 * Computes Longest Common Subsequence (LCS) matrix for two token arrays.
 */
const buildLcsMatrix = (tokensA, tokensB) => {
  const m = tokensA.length;
  const n = tokensB.length;
  const dp = Array.from({ length: m + 1 }, () => new Int32Array(n + 1));

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (tokensA[i - 1] === tokensB[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  return dp;
};

/**
 * Backtracks through LCS matrix to extract diff operations.
 */
export const computeTextDiff = (originalText = '', modifiedText = '') => {
  const tokensA = tokenizeText(originalText);
  const tokensB = tokenizeText(modifiedText);

  const dp = buildLcsMatrix(tokensA, tokensB);

  let i = tokensA.length;
  let j = tokensB.length;
  const rawDiff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && tokensA[i - 1] === tokensB[j - 1]) {
      rawDiff.push({ type: 'unchanged', value: tokensA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.push({ type: 'added', value: tokensB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.push({ type: 'removed', value: tokensA[i - 1] });
      i--;
    }
  }

  rawDiff.reverse();

  // Merge contiguous tokens of identical type for clean UI rendering
  const mergedChunks = [];
  let additionsCount = 0;
  let deletionsCount = 0;

  for (const chunk of rawDiff) {
    if (chunk.type === 'added') additionsCount++;
    if (chunk.type === 'removed') deletionsCount++;

    if (
      mergedChunks.length > 0 &&
      mergedChunks[mergedChunks.length - 1].type === chunk.type
    ) {
      mergedChunks[mergedChunks.length - 1].value += chunk.value;
    } else {
      mergedChunks.push({ ...chunk });
    }
  }

  return {
    chunks: mergedChunks,
    stats: {
      hasChanges: originalText !== modifiedText,
      additionsCount,
      deletionsCount,
      additions: additionsCount,
      deletions: deletionsCount,
      originalLength: originalText.length,
      modifiedLength: modifiedText.length,
    },
  };
};
