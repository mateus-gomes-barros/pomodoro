package com.mateusgomes.focusapp.pulse.timer

import android.content.Context

data class PulseTimerSnapshot(
    val session: PulseSession,
    val status: PulseTimerStatus,
    val remainingSeconds: Int,
    val endsAtEpochMillis: Long,
    val completedFocusSessions: Int,
    val workDurationMinutes: Int,
    val shortBreakDurationMinutes: Int,
    val longBreakDurationMinutes: Int,
)

class PulseTimerPersistence(context: Context) {
    private val preferences = context.getSharedPreferences(
        "focus_pulse_timer",
        Context.MODE_PRIVATE,
    )

    fun load(defaults: PulseTimerSettings): PulseTimerSnapshot {
        val session = enumValueOrDefault(
            preferences.getString(KEY_SESSION, null),
            PulseSession.FOCUS,
        )
        val status = enumValueOrDefault(
            preferences.getString(KEY_STATUS, null),
            PulseTimerStatus.IDLE,
        )
        val workMinutes = preferences.getInt(
            KEY_WORK_MINUTES,
            defaults.workDurationMinutes,
        )
        val shortBreakMinutes = preferences.getInt(
            KEY_SHORT_BREAK_MINUTES,
            defaults.shortBreakDurationMinutes,
        )
        val longBreakMinutes = preferences.getInt(
            KEY_LONG_BREAK_MINUTES,
            defaults.longBreakDurationMinutes,
        )
        val defaultRemaining = when (session) {
            PulseSession.FOCUS -> workMinutes * 60
            PulseSession.SHORT_BREAK -> shortBreakMinutes * 60
            PulseSession.LONG_BREAK -> longBreakMinutes * 60
        }

        return PulseTimerSnapshot(
            session = session,
            status = status,
            remainingSeconds = preferences
                .getInt(KEY_REMAINING_SECONDS, defaultRemaining)
                .coerceAtLeast(0),
            endsAtEpochMillis = preferences.getLong(KEY_ENDS_AT, 0L),
            completedFocusSessions = preferences
                .getInt(KEY_COMPLETED_FOCUS_SESSIONS, 0)
                .coerceAtLeast(0),
            workDurationMinutes = workMinutes.coerceIn(5, 90),
            shortBreakDurationMinutes = shortBreakMinutes.coerceIn(1, 30),
            longBreakDurationMinutes = longBreakMinutes.coerceIn(5, 60),
        )
    }

    fun save(snapshot: PulseTimerSnapshot) {
        preferences.edit()
            .putString(KEY_SESSION, snapshot.session.name)
            .putString(KEY_STATUS, snapshot.status.name)
            .putInt(KEY_REMAINING_SECONDS, snapshot.remainingSeconds)
            .putLong(KEY_ENDS_AT, snapshot.endsAtEpochMillis)
            .putInt(KEY_COMPLETED_FOCUS_SESSIONS, snapshot.completedFocusSessions)
            .putInt(KEY_WORK_MINUTES, snapshot.workDurationMinutes)
            .putInt(KEY_SHORT_BREAK_MINUTES, snapshot.shortBreakDurationMinutes)
            .putInt(KEY_LONG_BREAK_MINUTES, snapshot.longBreakDurationMinutes)
            .apply()
    }

    private inline fun <reified T : Enum<T>> enumValueOrDefault(
        value: String?,
        fallback: T,
    ): T = runCatching {
        enumValueOf<T>(value.orEmpty())
    }.getOrDefault(fallback)

    private companion object {
        const val KEY_SESSION = "session"
        const val KEY_STATUS = "status"
        const val KEY_REMAINING_SECONDS = "remaining_seconds"
        const val KEY_ENDS_AT = "ends_at_epoch_millis"
        const val KEY_COMPLETED_FOCUS_SESSIONS = "completed_focus_sessions"
        const val KEY_WORK_MINUTES = "work_duration_minutes"
        const val KEY_SHORT_BREAK_MINUTES = "short_break_duration_minutes"
        const val KEY_LONG_BREAK_MINUTES = "long_break_duration_minutes"
    }
}
