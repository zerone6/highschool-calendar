// Calculator utility functions

import type {
  InternalGrades,
  ExamScores,
  SubjectWeights,
  AdditionalScores,
  CalculationResults,
  School,
  SchoolResult
} from '../types/calculator';

export function getSpeakingScore(grade: 'A' | 'B' | 'C' | 'D' | 'E' | 'F'): number {
  const scoreMap = { A: 20, B: 16, C: 12, D: 8, E: 4, F: 0 };
  return scoreMap[grade];
}

export function calculateResults(
  internalGrades: InternalGrades,
  examScores: ExamScores,
  weights: SubjectWeights,
  additionalScores: AdditionalScores,
  useWeights: boolean,
  useInterview: boolean,
  useEssay: boolean,
  usePractical: boolean,
  useBonus: boolean,
  useSpeaking: boolean,
  patternType: 'simple' | 'ratio',
  ratioTest: number,
  ratioNaishin: number,
  naishinMultiplier: number = 3
): CalculationResults {
  // 1-1. 내신 원점수 (가중치 없음, 9과목 × 5 = 45점 만점)
  const naishinRawNoWeight =
    internalGrades.japanese +
    internalGrades.math +
    internalGrades.english +
    internalGrades.social +
    internalGrades.science +
    internalGrades.tech_home +
    internalGrades.pe +
    internalGrades.music +
    internalGrades.art;

  // 1-2. 내신 원점수 (기술가정, 체육, 음악, 미술은 2배 가중치)
  const naishinRaw =
    internalGrades.japanese +
    internalGrades.math +
    internalGrades.english +
    internalGrades.social +
    internalGrades.science +
    (internalGrades.tech_home * 2) +
    (internalGrades.pe * 2) +
    (internalGrades.music * 2) +
    (internalGrades.art * 2);

  // 내신 최대값은 65점 (5과목 × 5 + 4과목 × 5 × 2 = 25 + 40 = 65)
  const naishinMaxRaw = 65;

  // 2. 내신 환산점
  const naishinScaled = naishinRaw * naishinMultiplier;

  // 3. 학력검사 원점수
  const testRawTotal = Object.values(examScores).reduce((sum, score) => sum + score, 0);

  // 4. 학력검사 가중치 적용
  const testWeightedTotal = useWeights
    ? examScores.japanese * weights.japanese +
      examScores.math * weights.math +
      examScores.english * weights.english +
      examScores.social * weights.social +
      examScores.science * weights.science
    : testRawTotal;

  // 5. 추가 점수
  const extraTotal =
    (useInterview ? additionalScores.interview : 0) +
    (useEssay ? additionalScores.essay : 0) +
    (usePractical ? additionalScores.practical : 0) +
    (useBonus ? additionalScores.bonus : 0) +
    (useSpeaking ? additionalScores.speaking : 0);

  // 6. 최종 점수 계산
  let finalScore = 0;
  let naishinFinal = 0;
  let testFinal = 0;

  if (patternType === 'simple') {
    // 패턴 A: 단순형 (내신환산 + 시험)
    naishinFinal = naishinScaled;
    testFinal = testWeightedTotal;
    finalScore = naishinFinal + testFinal + extraTotal;
  } else {
    // 패턴 B: 비율형 (총점 1000점 기준)
    const totalRatio = ratioTest + ratioNaishin;
    const finalMax = 1000;
    const naishinMaxComponent = finalMax * (ratioNaishin / totalRatio);
    const testMaxComponent = finalMax * (ratioTest / totalRatio);

    // 내신: 65점 만점 기준으로 비율 계산
    naishinFinal = (naishinRaw / naishinMaxRaw) * naishinMaxComponent;

    // 시험: 500점 만점 기준으로 비율 계산
    const testWeightedMax = useWeights
      ? 100 * (weights.japanese + weights.math + weights.english + weights.social + weights.science)
      : 500;

    testFinal = (testWeightedTotal / testWeightedMax) * testMaxComponent;
    finalScore = naishinFinal + testFinal + extraTotal;
  }

  return {
    naishinRawNoWeight,
    naishinRaw,
    naishinMaxRaw,
    naishinScaled,
    testRawTotal,
    testWeightedTotal,
    extraTotal,
    naishinFinal,
    testFinal,
    finalScore,
  };
}

export function calculateSchoolResults(
  schools: School[],
  results: CalculationResults
): SchoolResult[] {
  return schools.map((school) => {
    const passRate80Status: 'pass' | 'fail' | 'unknown' =
      school.pass_rate_80 !== null
        ? results.finalScore >= school.pass_rate_80
          ? 'pass'
          : 'fail'
        : 'unknown';

    const passRate60Status: 'pass' | 'fail' | 'unknown' =
      school.pass_rate_60 !== null
        ? results.finalScore >= school.pass_rate_60
          ? 'pass'
          : 'fail'
        : 'unknown';

    return {
      ...school,
      finalScore: results.finalScore,
      passRate80Status,
      passRate60Status,
    };
  });
}
