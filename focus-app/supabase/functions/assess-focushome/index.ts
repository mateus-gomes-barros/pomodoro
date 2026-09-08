import {
  createClient,
} from 'npm:@supabase/supabase-js@2'

import {
  classifyFocusHome,
  FOCUS_HOME_CLASSIFIER_VERSION,
} from '../_shared/focusHomeClassifier.ts'

const FOCUSHOME_ELIGIBILITY_VERSION =
  1

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
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

  const supabaseUrl =
    Deno.env.get('SUPABASE_URL')

  const serviceRoleKey =
    Deno.env.get(
      'SUPABASE_SERVICE_ROLE_KEY',
    )

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    return jsonResponse(
      {
        error:
          'Server configuration is incomplete',
      },
      500,
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

  let body: {
    reportId?: string
    assessmentType?:
      | 'initial'
      | 'retest'
  }

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

  if (
    !body.reportId ||
    (
      body.assessmentType !==
        'initial' &&
      body.assessmentType !==
        'retest'
    )
  ) {
    return jsonResponse(
      {
        error:
          'Invalid assessment request',
      },
      400,
    )
  }

  const {
    data: report,
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
    .eq('id', body.reportId)
    .eq(
      'user_id',
      userData.user.id,
    )
    .maybeSingle()

  if (
    reportError ||
    !report
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
    report.report_type !==
      'monthly' ||
    report.schema_version < 2
  ) {
    return jsonResponse(
      {
        error:
          'Report is not eligible for FocushoMe',
      },
      422,
    )
  }

  const metrics =
    report.metrics as {
      current?: unknown
    }

  if (
    !metrics.current ||
    typeof metrics.current !==
      'object'
  ) {
    return jsonResponse(
      {
        error:
          'Behavioral metrics are missing',
      },
      422,
    )
  }

  const classification =
    classifyFocusHome(
      metrics.current as Parameters<
        typeof classifyFocusHome
      >[0],
    )

  const {
    data: assessmentId,
    error: assessmentError,
  } = await admin.rpc(
    'award_focushome_server',
    {
      p_user_id:
        userData.user.id,
      p_report_id:
        body.reportId,
      p_assessment_type:
        body.assessmentType,
      p_result:
        classification,
      p_classifier_version:
        FOCUS_HOME_CLASSIFIER_VERSION,
      p_eligibility_version:
        FOCUSHOME_ELIGIBILITY_VERSION,
    },
  )

  if (assessmentError) {
    console.error(
      'FocushoMe assessment failed',
      {
        code:
          assessmentError.code,
        message:
          assessmentError.message,
      },
    )

    return jsonResponse(
      {
        error:
          'FocushoMe assessment could not be completed',
      },
      422,
    )
  }

  return jsonResponse({
    assessmentId,
    classification,
  })
})
