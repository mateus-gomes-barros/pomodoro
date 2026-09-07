import {
  ArrowLeft,
  CheckCircle2,
  Minus,
  XCircle,
} from 'lucide-react'
import {
  useNavigate,
} from 'react-router-dom'

import {
  FocusHomeSymbol,
} from '@/components/focusme/FocusHomeSymbol'
import {
  PageHeader,
} from '@/components/ui/PageHeader'
import {
  FOCUS_HOME_BEHAVIOR_FIXTURES,
} from '@/features/focusme/focusHomeBehaviorFixtures'
import {
  FOCUS_HOME_FIXTURES,
} from '@/features/focusme/focusHomeClassifierFixtures'
import {
  classifyFocusHome,
} from '@/services/focusHomeClassifier'
import {
  evaluateFocusHomeEligibility,
} from '@/services/focusMeEligibility'

export function FocusHomeDiagnosticsPage() {
  const navigate = useNavigate()

  const classResults =
    FOCUS_HOME_FIXTURES.map(
      (fixture) => ({
        fixture,
        result:
          classifyFocusHome(
            fixture.metrics,
          ),
      }),
    )

  const classPassed =
    classResults.filter(
      ({ fixture, result }) =>
        fixture.expected ===
        result.focusHome,
    ).length

  const behaviorResults =
    FOCUS_HOME_BEHAVIOR_FIXTURES.map(
      (fixture) => {
        const result =
          classifyFocusHome(
            fixture.metrics,
          )

        const eligibility =
          evaluateFocusHomeEligibility(
            fixture.metrics,
            true,
          )

        const checks: boolean[] = []

        if (
          fixture.expectedTemporal
        ) {
          checks.push(
            result.temporalExpression ===
              fixture.expectedTemporal,
          )
        }

        if (fixture.expectedTrait) {
          checks.push(
            result.traits.includes(
              fixture.expectedTrait,
            ),
          )
        }

        if (
          fixture.expectedEligible !==
          undefined
        ) {
          checks.push(
            eligibility.eligible ===
              fixture.expectedEligible,
          )
        }

        if (
          fixture.maxScoreGap !==
          undefined
        ) {
          checks.push(
            result.scoreGap <=
              fixture.maxScoreGap,
          )
        }

        return {
          fixture,
          result,
          eligibility,
          passed:
            checks.length > 0 &&
            checks.every(Boolean),
        }
      },
    )

  const behaviorPassed =
    behaviorResults.filter(
      (item) => item.passed,
    ).length

  return (
    <div className="mx-auto max-w-5xl px-6 pb-12 lg:px-10 lg:pb-16">
      <button
        type="button"
        onClick={() =>
          navigate(
            '/settings/focusme',
          )
        }
        className="mb-5 flex items-center gap-2 text-sm text-accent-subtle transition hover:text-accent-white"
      >
        <ArrowLeft size={17} />
        Voltar
      </button>

      <PageHeader
        title="Diagnóstico FocushoMe"
        subtitle="Validação interna antes de analisar usuários reais."
      />

      <div className="mb-8">
        <div className="card mb-4 p-5">
          <p className="text-xs uppercase tracking-wide text-accent-subtle">
            Classes principais
          </p>

          <p className="mt-2 text-2xl font-semibold text-accent-white">
            {classPassed}
            {' / '}
            {classResults.length}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {classResults.map(
            ({
              fixture,
              result,
            }) => {
              const correct =
                fixture.expected ===
                result.focusHome

              return (
                <article
                  key={fixture.key}
                  className="card p-5"
                >
                  <div className="flex items-start gap-4">
                    <FocusHomeSymbol
                      type={
                        result.focusHome
                      }
                      size={58}
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs uppercase tracking-wide text-accent-subtle">
                          {fixture.key}
                        </p>

                        {correct ? (
                          <CheckCircle2
                            size={17}
                            className="text-accent-green"
                          />
                        ) : (
                          <XCircle
                            size={17}
                            className="text-red-400"
                          />
                        )}
                      </div>

                      <p className="mt-2 text-sm capitalize text-accent-white">
                        {result.focusHome}
                      </p>

                      <p className="mt-1 text-xs text-accent-subtle">
                        confiança
                        {' '}
                        {result.confidence}%
                        {' · '}
                        diferença
                        {' '}
                        {result.scoreGap}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-4">
                    {result.scores
                      .slice(0, 3)
                      .map((score) => (
                        <span
                          key={score.key}
                          className="rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] capitalize text-accent-subtle"
                        >
                          {score.key}
                          {' '}
                          {score.score}
                        </span>
                      ))}
                  </div>
                </article>
              )
            },
          )}
        </div>
      </div>

      <div>
        <div className="card mb-4 p-5">
          <p className="text-xs uppercase tracking-wide text-accent-subtle">
            Comportamentos e exceções
          </p>

          <p className="mt-2 text-2xl font-semibold text-accent-white">
            {behaviorPassed}
            {' / '}
            {behaviorResults.length}
          </p>
        </div>

        <div className="space-y-3">
          {behaviorResults.map(
            ({
              fixture,
              result,
              eligibility,
              passed,
            }) => (
              <article
                key={fixture.key}
                className="card p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-accent-white">
                      {fixture.key}
                    </p>

                    <p className="mt-2 text-xs text-accent-subtle">
                      <span className="capitalize">
                        {result.focusHome}
                      </span>
                      {' · '}
                      {result.temporalExpression}
                      {' · '}
                      confiança
                      {' '}
                      {result.confidence}%
                      {' · '}
                      diferença
                      {' '}
                      {result.scoreGap}
                    </p>
                  </div>

                  {passed ? (
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-accent-green"
                    />
                  ) : (
                    <XCircle
                      size={18}
                      className="shrink-0 text-red-400"
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {result.traits.length > 0 ? (
                    result.traits.map(
                      (trait) => (
                        <span
                          key={trait}
                          className="rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] text-accent-subtle"
                        >
                          {trait}
                        </span>
                      ),
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-accent-subtle">
                      <Minus size={12} />
                      sem traço específico
                    </span>
                  )}
                </div>

                {fixture.expectedEligible !==
                  undefined && (
                  <p className="mt-3 text-xs text-accent-subtle">
                    Elegível:
                    {' '}
                    {eligibility.eligible
                      ? 'sim'
                      : 'não'}
                    {' · '}
                    progresso
                    {' '}
                    {eligibility.progress}%
                  </p>
                )}
              </article>
            ),
          )}
        </div>
      </div>
    </div>
  )
}
