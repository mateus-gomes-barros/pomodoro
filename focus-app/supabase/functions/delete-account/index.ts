import {
  createClient,
} from 'npm:@supabase/supabase-js@2'

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

  const userId =
    userData.user.id

  const tables = [
    'focushome_profiles',
    'focushome_assessments',
    'focusme_report_narratives',
    'focusme_reports',
    'activity_events',
    'pomodoro_sessions',
    'tasks',
    'projects',
    'goals',
  ]

  for (const table of tables) {
    const { error } =
      await admin
        .from(table)
        .delete()
        .eq('user_id', userId)

    if (error) {
      console.error(
        'Account data deletion failed',
        {
          table,
          code: error.code,
          message: error.message,
        },
      )

      return jsonResponse(
        {
          error:
            'Account data could not be deleted',
          table,
        },
        500,
      )
    }
  }

  const {
    error: authError,
  } =
    await admin.auth.admin.deleteUser(
      userId,
    )

  if (authError) {
    console.error(
      'Auth user deletion failed',
      authError.message,
    )

    return jsonResponse(
      {
        error:
          'Account could not be deleted',
      },
      500,
    )
  }

  return jsonResponse({
    deleted: true,
  })
})
