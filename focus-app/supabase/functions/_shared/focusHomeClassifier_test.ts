import {
  FOCUS_HOME_BEHAVIOR_FIXTURES,
} from './focusHomeBehaviorFixtures.ts'
import {
  FOCUS_HOME_FIXTURES,
} from './focusHomeClassifierFixtures.ts'
import {
  classifyFocusHome,
} from './focusHomeClassifier.ts'
import {
  evaluateFocusHomeEligibility,
} from './focusHomeEligibility.ts'

function ensure(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message)
  }
}

Deno.test(
  'FocushoMe server classifier: 12/12 classes',
  () => {
    const failures: string[] = []

    for (
      const fixture of
      FOCUS_HOME_FIXTURES
    ) {
      const result =
        classifyFocusHome(
          fixture.metrics,
        )

      if (
        result.focusHome !==
        fixture.expected
      ) {
        failures.push(
          [
            fixture.key,
            `expected=${fixture.expected}`,
            `received=${result.focusHome}`,
            `top=${result.scores
              .slice(0, 3)
              .map(
                (score) =>
                  `${score.key}:${score.score}`,
              )
              .join(',')}`,
          ].join(' '),
        )
      }
    }

    ensure(
      failures.length === 0,
      failures.join('\n'),
    )

    console.log(
      `${FOCUS_HOME_FIXTURES.length}/${FOCUS_HOME_FIXTURES.length} class fixtures passed`,
    )
  },
)

Deno.test(
  'FocushoMe server classifier: 14/14 behaviors',
  () => {
    const failures: string[] = []

    for (
      const fixture of
      FOCUS_HOME_BEHAVIOR_FIXTURES
    ) {
      const result =
        classifyFocusHome(
          fixture.metrics,
        )

      const eligibility =
        evaluateFocusHomeEligibility(
          fixture.metrics,
          true,
        )

      const checks: Array<{
        name: string
        passed: boolean
      }> = []

      if (
        fixture.expectedTemporal
      ) {
        checks.push({
          name:
            `temporal=${fixture.expectedTemporal}`,
          passed:
            result.temporalExpression ===
            fixture.expectedTemporal,
        })
      }

      if (
        fixture.expectedTrait
      ) {
        checks.push({
          name:
            `trait=${fixture.expectedTrait}`,
          passed:
            result.traits.includes(
              fixture.expectedTrait,
            ),
        })
      }

      if (
        fixture.expectedEligible !==
        undefined
      ) {
        checks.push({
          name:
            `eligible=${fixture.expectedEligible}`,
          passed:
            eligibility.eligible ===
            fixture.expectedEligible,
        })
      }

      if (
        fixture.maxScoreGap !==
        undefined
      ) {
        checks.push({
          name:
            `gap<=${fixture.maxScoreGap}`,
          passed:
            result.scoreGap <=
            fixture.maxScoreGap,
        })
      }

      const failedChecks =
        checks
          .filter(
            (check) =>
              !check.passed,
          )
          .map(
            (check) =>
              check.name,
          )

      if (
        checks.length === 0 ||
        failedChecks.length > 0
      ) {
        failures.push(
          `${fixture.key}: ${failedChecks.join(', ')}`,
        )
      }
    }

    ensure(
      failures.length === 0,
      failures.join('\n'),
    )

    console.log(
      `${FOCUS_HOME_BEHAVIOR_FIXTURES.length}/${FOCUS_HOME_BEHAVIOR_FIXTURES.length} behavior fixtures passed`,
    )
  },
)
