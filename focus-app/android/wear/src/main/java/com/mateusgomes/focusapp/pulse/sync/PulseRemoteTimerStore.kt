package com.mateusgomes.focusapp.pulse.sync

import android.content.Context
import com.google.android.gms.wearable.DataMap

data class PulseRemoteTimerState(
    val sessionId: String,
    val status: String,
    val sessionType: String,
    val endsAt: Long,
    val durationSeconds: Int,
    val remainingSeconds: Int,
    val taskId: String,
    val taskName: String,
    val projectId: String,
    val projectName: String,
    val focusHome: String,
    val sourceDevice: String,
    val version: Long,
    val updatedAt: Long,
)

class PulseRemoteTimerStore(context: Context) {
    private val preferences = context.getSharedPreferences("focus_pulse_sync", Context.MODE_PRIVATE)

    fun load(): PulseRemoteTimerState? {
        val version = preferences.getLong(PulseWearContract.KEY_VERSION, 0L)
        if (version <= 0L) return null
        return PulseRemoteTimerState(
            sessionId = preferences.getString(PulseWearContract.KEY_SESSION_ID, "").orEmpty(),
            status = preferences.getString(PulseWearContract.KEY_STATUS, "idle").orEmpty(),
            sessionType = preferences.getString(PulseWearContract.KEY_SESSION_TYPE, "focus").orEmpty(),
            endsAt = preferences.getLong(PulseWearContract.KEY_ENDS_AT, 0L),
            durationSeconds = preferences.getInt(PulseWearContract.KEY_DURATION_SECONDS, 0),
            remainingSeconds = preferences.getInt(PulseWearContract.KEY_REMAINING_SECONDS, 0),
            taskId = preferences.getString(PulseWearContract.KEY_TASK_ID, "").orEmpty(),
            taskName = preferences.getString(PulseWearContract.KEY_TASK_NAME, "").orEmpty(),
            projectId = preferences.getString(PulseWearContract.KEY_PROJECT_ID, "").orEmpty(),
            projectName = preferences.getString(PulseWearContract.KEY_PROJECT_NAME, "").orEmpty(),
            focusHome = preferences.getString(PulseWearContract.KEY_FOCUS_HOME, "").orEmpty(),
            sourceDevice = preferences.getString(PulseWearContract.KEY_SOURCE_DEVICE, "").orEmpty(),
            version = version,
            updatedAt = preferences.getLong(PulseWearContract.KEY_UPDATED_AT, 0L),
        )
    }

    fun save(data: DataMap): PulseRemoteTimerState {
        val state = PulseRemoteTimerState(
            sessionId = data.getString(PulseWearContract.KEY_SESSION_ID, ""),
            status = data.getString(PulseWearContract.KEY_STATUS, "idle"),
            sessionType = data.getString(PulseWearContract.KEY_SESSION_TYPE, "focus"),
            endsAt = data.getLong(PulseWearContract.KEY_ENDS_AT, 0L),
            durationSeconds = data.getInt(PulseWearContract.KEY_DURATION_SECONDS, 0),
            remainingSeconds = data.getInt(PulseWearContract.KEY_REMAINING_SECONDS, 0),
            taskId = data.getString(PulseWearContract.KEY_TASK_ID, ""),
            taskName = data.getString(PulseWearContract.KEY_TASK_NAME, ""),
            projectId = data.getString(PulseWearContract.KEY_PROJECT_ID, ""),
            projectName = data.getString(PulseWearContract.KEY_PROJECT_NAME, ""),
            focusHome = data.getString(PulseWearContract.KEY_FOCUS_HOME, ""),
            sourceDevice = data.getString(PulseWearContract.KEY_SOURCE_DEVICE, ""),
            version = data.getLong(PulseWearContract.KEY_VERSION, 0L),
            updatedAt = data.getLong(PulseWearContract.KEY_UPDATED_AT, 0L),
        )
        preferences.edit()
            .putString(PulseWearContract.KEY_SESSION_ID, state.sessionId)
            .putString(PulseWearContract.KEY_STATUS, state.status)
            .putString(PulseWearContract.KEY_SESSION_TYPE, state.sessionType)
            .putLong(PulseWearContract.KEY_ENDS_AT, state.endsAt)
            .putInt(PulseWearContract.KEY_DURATION_SECONDS, state.durationSeconds)
            .putInt(PulseWearContract.KEY_REMAINING_SECONDS, state.remainingSeconds)
            .putString(PulseWearContract.KEY_TASK_ID, state.taskId)
            .putString(PulseWearContract.KEY_TASK_NAME, state.taskName)
            .putString(PulseWearContract.KEY_PROJECT_ID, state.projectId)
            .putString(PulseWearContract.KEY_PROJECT_NAME, state.projectName)
            .putString(PulseWearContract.KEY_FOCUS_HOME, state.focusHome)
            .putString(PulseWearContract.KEY_SOURCE_DEVICE, state.sourceDevice)
            .putLong(PulseWearContract.KEY_VERSION, state.version)
            .putLong(PulseWearContract.KEY_UPDATED_AT, state.updatedAt)
            .apply()
        return state
    }
}
