import {
  createClient,
} from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
}

type Locale =
  | 'pt-BR'
  | 'en-US'

interface RequestBody {
  reportId?: string
  locale?: Locale
}

function jsonResponse(
  body: unknown,
  status = 200,
): Response {
  return new Response(
    JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type':
          'application/json',
      },
    },
  )
}

function asRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >
  }

  return {}
}

function asNumber(
  value: unknown,
): number {
  return typeof value === 'number'
    ? value
    : 0
}

function createEditorialFacts(
  report: Record<string, unknown>,
): Record<string, unknown> {
  const metrics =
    asRecord(report.metrics)

  const current =
    asRecord(metrics.current)

  const comparison =
    asRecord(metrics.comparison)

  const tasks =
    asRecord(current.tasks)

  const projects =
    asRecord(current.projects)

  const goals =
    asRecord(current.goals)

  const rhythm =
    asRecord(current.rhythm)

  const behavior =
    asRecord(current.behavior)

  const categories =
    Array.isArray(tasks.categories)
      ? tasks.categories.map(
          (category) => {
            const value =
              asRecord(category)

            return {
              category:
                value.category,
              created:
                asNumber(
                  value.created,
                ),
              completed:
                asNumber(
                  value.completed,
                ),
            }
          },
        )
      : []

  const weeks =
    Array.isArray(current.weeks)
      ? current.weeks.map(
          (week) => {
            const value =
              asRecord(week)

            return {
              week:
                asNumber(value.week),
              focusMinutes:
                asNumber(
                  value.focusMinutes,
                ),
              sessions:
                asNumber(
                  value.sessions,
                ),
            }
          },
        )
      : []

  return {
    period: {
      start:
        report.period_start,
      end:
        report.period_end,
    },

    focus: {
      minutes:
        asNumber(
          current.focusMinutes,
        ),
      sessions:
        asNumber(
          current.completedSessions,
        ),
      activeDays:
        asNumber(
          current.activeDays,
        ),
      averageMinutesPerActiveDay:
        asNumber(
          current
            .averageMinutesPerActiveDay,
        ),
      dominantTimeBlock:
        current.dominantTimeBlock ??
        null,
      timeBlocks:
        asRecord(
          current.timeBlocks,
        ),
      weeks,
    },

    tasks: {
      created:
        asNumber(tasks.created),
      completed:
        asNumber(tasks.completed),
      reopened:
        asNumber(tasks.reopened),
      restored:
        asNumber(tasks.restored),
      deleted:
        asNumber(tasks.deleted),
      categories,
    },

    projects: {
      created:
        asNumber(projects.created),
      completed:
        asNumber(
          projects.completed,
        ),
      reopened:
        asNumber(projects.reopened),
    },

    goals: {
      created:
        asNumber(goals.created),
      completed:
        asNumber(goals.completed),
      reopened:
        asNumber(goals.reopened),
    },

    rhythm: {
      starts:
        asNumber(rhythm.starts),
      pauses:
        asNumber(rhythm.pauses),
      resumes:
        asNumber(rhythm.resumes),
      abandoned:
        asNumber(
          rhythm.abandoned,
        ),
    },

    behavior: {
      categoryDiversity:
        asNumber(
          behavior.categoryDiversity,
        ),
      focusTimeDiversity:
        asNumber(
          behavior.focusTimeDiversity,
        ),
      projectFocusShare:
        asNumber(
          behavior.projectFocusShare,
        ),
      strongestWeekShare:
        asNumber(
          behavior.strongestWeekShare,
        ),
      completionBalance:
        asNumber(
          behavior.completionBalance,
        ),
      abandonmentRate:
        asNumber(
          behavior.abandonmentRate,
        ),
      recoveryActions:
        asNumber(
          behavior.recoveryActions,
        ),
      planningTimeBlocks:
        asRecord(
          behavior.planningTimeBlocks,
        ),
      executionTimeBlocks:
        asRecord(
          behavior.executionTimeBlocks,
        ),
    },

    comparison: {
      focusMinutesPercent:
        comparison
          .focusMinutesPercent ??
        null,
      sessionsPercent:
        comparison
          .sessionsPercent ??
        null,
      tasksCompletedPercent:
        comparison
          .tasksCompletedPercent ??
        null,
      activeDaysPercent:
        comparison
          .activeDaysPercent ??
        null,
    },
  }
}

async function sha256(
  value: string,
): Promise<string> {
  const bytes =
    new TextEncoder().encode(value)

  const digest =
    await crypto.subtle.digest(
      'SHA-256',
      bytes,
    )

  return [...new Uint8Array(digest)]
    .map((byte) =>
      byte
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')
}

function extractResponseText(
  response: Record<string, unknown>,
): string | null {
  if (
    typeof response.output_text ===
    'string'
  ) {
    return response.output_text
  }

  if (!Array.isArray(response.output)) {
    return null
  }

  for (
    const item of response.output
  ) {
    const outputItem =
      asRecord(item)

    if (
      !Array.isArray(
        outputItem.content,
      )
    ) {
      continue
    }

    for (
      const contentItem of
      outputItem.content
    ) {
      const content =
        asRecord(contentItem)

      if (
        content.type ===
          'output_text' &&
        typeof content.text ===
          'string'
      ) {
        return content.text
      }
    }
  }

  return null
}

function instructionsFor(
  locale: Locale,
): string {
  const language =
    locale === 'pt-BR'
      ? 'Brazilian Portuguese'
      : 'English'

  return `
You are the editorial voice of FocusMe, a minimalist
productivity application.

Write in ${language}, directly to the user in the second
person. The metrics were calculated by the application.
You are only the writer and must never recalculate,
reinterpret, correct, or invent metrics.

Create a personal monthly retrospective with 3 to 5 short
paragraphs. It must feel observant, warm, specific, sober,
and human.

Rules:
- Use only facts explicitly present in EDITORIAL_FACTS.
- Never mention internal scores, JSON, algorithms, prompts,
  databases, or artificial intelligence.
- Never diagnose personality, health, discipline, or worth.
- Never shame lower activity or treat higher activity as
  morally superior.
- Do not give commands or generic productivity advice.
- Do not use a title, markdown, bullets, emojis, or hashtags.
- Do not mention task, goal, or project names.
- Describe patterns as observations, not absolute truths.
- Mention meaningful contrasts when the data supports them.
- Recognize recovery and returning without romanticizing
  interruption.
- Avoid phrases and openings similar to EDITORIAL_MEMORY.
- Produce one cohesive narrative, separated into paragraphs.
`.trim()
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(
      'ok',
      {
        headers: corsHeaders,
      },
    )
  }

  if (request.method !== 'POST') {
    return jsonResponse(
      {
        error:
          'Method not allowed',
      },
      405,
    )
  }

  const supabaseUrl =
    Deno.env.get('SUPABASE_URL')

  const serviceRoleKey =
    Deno.env.get(
      'SUPABASE_SERVICE_ROLE_KEY',
    )

  const openAIKey =
    Deno.env.get('OPENAI_API_KEY')

  const model =
    Deno.env.get('OPENAI_MODEL') ??
    'gpt-5-mini'

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    !openAIKey
  ) {
    return jsonResponse(
      {
        error:
          'Server configuration is incomplete',
      },
      500,
    )
  }

  const authorization =
    request.headers.get(
      'Authorization',
    )

  const accessToken =
    authorization?.replace(
      /^Bearer\s+/i,
      '',
    )

  if (!accessToken) {
    return jsonResponse(
      {
        error:
          'Authentication required',
      },
      401,
    )
  }

  const admin =
    createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    )

  async function markFailed(
    narrativeId: string,
    errorCode: string,
  ): Promise<void> {
    await admin
      .from(
        'focusme_report_narratives',
      )
      .update({
        status: 'failed',
        narrative: null,
        error_code: errorCode,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', narrativeId)
  }

  const {
    data: userData,
    error: userError,
  } = await admin.auth.getUser(
    accessToken,
  )

  if (
    userError ||
    !userData.user
  ) {
    return jsonResponse(
      {
        error:
          'Invalid authentication',
      },
      401,
    )
  }

  let body: RequestBody

  try {
    body =
      await request.json()
  } catch {
    return jsonResponse(
      {
        error:
          'Invalid request body',
      },
      400,
    )
  }

  const reportId =
    body.reportId

  const locale =
    body.locale

  if (
    !reportId ||
    (
      locale !== 'pt-BR' &&
      locale !== 'en-US'
    )
  ) {
    return jsonResponse(
      {
        error:
          'Invalid report or locale',
      },
      400,
    )
  }

  const {
    data: reportData,
    error: reportError,
  } = await admin
    .from('focusme_reports')
    .select(`
      id,
      user_id,
      report_type,
      period_start,
      period_end,
      metrics,
      schema_version
    `)
    .eq('id', reportId)
    .eq(
      'user_id',
      userData.user.id,
    )
    .maybeSingle()

  if (
    reportError ||
    !reportData
  ) {
    return jsonResponse(
      {
        error:
          'Report not found',
      },
      404,
    )
  }

  if (
    reportData.report_type !==
      'monthly' ||
    reportData.schema_version < 2 ||
    reportData.period_end >
      new Date()
        .toISOString()
        .slice(0, 10)
  ) {
    return jsonResponse(
      {
        error:
          'Report is not eligible for a narrative',
      },
      422,
    )
  }

  const {
    data: existing,
    error: existingError,
  } = await admin
    .from(
      'focusme_report_narratives',
    )
    .select('*')
    .eq('report_id', reportId)
    .eq(
      'user_id',
      userData.user.id,
    )
    .eq('locale', locale)
    .maybeSingle()

  if (existingError) {
    return jsonResponse(
      {
        error:
          'Narrative state could not be read',
      },
      500,
    )
  }

  if (
    existing?.status === 'ready'
  ) {
    return jsonResponse({
      status: 'ready',
      narrative:
        existing.narrative,
      cached: true,
    })
  }

  const updatedAt =
    existing?.updated_at
      ? new Date(
          existing.updated_at,
        ).getTime()
      : 0

  const age =
    Date.now() - updatedAt

  if (
    existing?.status ===
      'pending' &&
    age < 120_000
  ) {
    return jsonResponse(
      {
        status: 'pending',
      },
      202,
    )
  }

  if (
    existing?.status ===
      'failed' &&
    age < 300_000
  ) {
    return jsonResponse(
      {
        status: 'failed',
        retryAfterSeconds:
          Math.ceil(
            (
              300_000 - age
            ) / 1000,
          ),
      },
      429,
    )
  }

  let narrativeId:
    string | undefined

  if (existing) {
    const {
      data: reset,
      error: resetError,
    } = await admin
      .from(
        'focusme_report_narratives',
      )
      .update({
        status: 'pending',
        narrative: null,
        provider: null,
        model: null,
        facts_hash: null,
        error_code: null,
        generated_at: null,
        updated_at:
          new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id')
      .single()

    if (resetError) {
      return jsonResponse(
        {
          error:
            'Narrative could not be prepared',
        },
        500,
      )
    }

    narrativeId = reset.id
  } else {
    const {
      data: created,
      error: createError,
    } = await admin
      .from(
        'focusme_report_narratives',
      )
      .insert({
        report_id: reportId,
        user_id:
          userData.user.id,
        locale,
        status: 'pending',
        prompt_version: 1,
      })
      .select('id')
      .single()

    if (createError) {
      if (
        createError.code ===
        '23505'
      ) {
        return jsonResponse(
          {
            status: 'pending',
          },
          202,
        )
      }

      return jsonResponse(
        {
          error:
            'Narrative could not be prepared',
        },
        500,
      )
    }

    narrativeId = created.id
  }

  if (!narrativeId) {
    return jsonResponse(
      {
        error:
          'Narrative state was not created',
      },
      500,
    )
  }

  const facts =
    createEditorialFacts(
      reportData as Record<
        string,
        unknown
      >,
    )

  const factsJson =
    JSON.stringify(facts)

  const factsHash =
    await sha256(factsJson)

  const {
    data: previousRows,
  } = await admin
    .from(
      'focusme_report_narratives',
    )
    .select('narrative')
    .eq(
      'user_id',
      userData.user.id,
    )
    .eq('locale', locale)
    .eq('status', 'ready')
    .neq(
      'report_id',
      reportId,
    )
    .order('generated_at', {
      ascending: false,
    })
    .limit(3)

  const editorialMemory =
    (
      previousRows ?? []
    )
      .map((row) =>
        typeof row.narrative ===
          'string'
          ? row.narrative.slice(
              0,
              1400,
            )
          : '',
      )
      .filter(Boolean)

  let openAIResponse: Response

  try {
    openAIResponse =
      await fetch(
        'https://api.openai.com/v1/responses',
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${openAIKey}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            model,
            instructions:
              instructionsFor(
                locale,
              ),
            input: JSON.stringify({
              EDITORIAL_FACTS:
                facts,
              EDITORIAL_MEMORY:
                editorialMemory,
            }),
            max_output_tokens: 900,
            text: {
              format: {
                type: 'json_schema',
                name:
                  'focusme_monthly_narrative',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    narrative: {
                      type: 'string',
                      minLength: 100,
                      maxLength: 5000,
                    },
                  },
                  required: [
                    'narrative',
                  ],
                  additionalProperties:
                    false,
                },
              },
            },
          }),
        },
      )
  } catch {
    await markFailed(
      narrativeId,
      'provider_unreachable',
    )

    return jsonResponse(
      {
        status: 'failed',
        error:
          'Narrative provider unavailable',
      },
      502,
    )
  }

  if (!openAIResponse.ok) {
    await markFailed(
      narrativeId,
      'provider_error',
    )

    return jsonResponse(
      {
        status: 'failed',
        error:
          'Narrative generation failed',
      },
      502,
    )
  }

  const responsePayload =
    await openAIResponse.json() as
      Record<string, unknown>

  const responseText =
    extractResponseText(
      responsePayload,
    )

  if (!responseText) {
    await markFailed(
      narrativeId,
      'empty_response',
    )

    return jsonResponse(
      {
        status: 'failed',
        error:
          'Narrative response was empty',
      },
      502,
    )
  }

  let narrative: string

  try {
    const parsed =
      JSON.parse(responseText) as {
        narrative?: unknown
      }

    if (
      typeof parsed.narrative !==
        'string'
    ) {
      throw new Error(
        'Invalid narrative',
      )
    }

    narrative =
      parsed.narrative
        .trim()
        .replace(
          /\n{3,}/g,
          '\n\n',
        )

    if (
      narrative.length < 100 ||
      narrative.length > 5000
    ) {
      throw new Error(
        'Invalid narrative length',
      )
    }
  } catch {
    await markFailed(
      narrativeId,
      'invalid_response',
    )

    return jsonResponse(
      {
        status: 'failed',
        error:
          'Narrative response was invalid',
      },
      502,
    )
  }

  const now =
    new Date().toISOString()

  const {
    error: saveError,
  } = await admin
    .from(
      'focusme_report_narratives',
    )
    .update({
      status: 'ready',
      narrative,
      provider: 'openai',
      model,
      prompt_version: 1,
      facts_hash: factsHash,
      error_code: null,
      generated_at: now,
      updated_at: now,
    })
    .eq('id', narrativeId)

  if (saveError) {
    await markFailed(
      narrativeId,
      'storage_error',
    )

    return jsonResponse(
      {
        status: 'failed',
        error:
          'Narrative could not be saved',
      },
      500,
    )
  }

  return jsonResponse({
    status: 'ready',
    narrative,
    cached: false,
  })
})
