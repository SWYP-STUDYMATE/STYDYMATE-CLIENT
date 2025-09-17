// 온보딩 상태 객체에서 다음 단계 번호를 계산한다.
export const resolveNextOnboardingStep = (status) => {
  if (!status) return 1;

  const totalStepsRaw = status.totalSteps ?? 5;
  const totalSteps = Number(totalStepsRaw) > 0 ? Number(totalStepsRaw) : 5;

  const providedNext = status.nextStep;
  if (providedNext !== undefined && providedNext !== null) {
    const parsedNext = Number(providedNext);
    if (!Number.isNaN(parsedNext) && parsedNext >= 1) {
      return Math.min(parsedNext, totalSteps);
    }
  }

  const currentRaw = status.currentStep ?? 0;
  const currentStep = Number(currentRaw);
  const safeCurrent = Number.isNaN(currentStep) ? 0 : currentStep;
  const candidate = safeCurrent + 1;

  return Math.min(Math.max(candidate, 1), totalSteps);
};
