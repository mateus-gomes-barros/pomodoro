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
    val taskName: String,
    val projectName: String,
    val focusHome: String,
    val sourceDevice: String,
    val version: Long,
    val updatedAt: Long,
)

class PulseRemoteTimerStore(context: Context) {
    private val preferences = context.getSharedPreferences("focus_pulse_sync", Context.MODE_PRIVATE)

    fun save(data: DataMap): PulseRemoteTimerState {
        val state = PulseRemoteTimerState(
            sessionId = data.getString(PulseWearContract.KEY_SESSION_ID, ""),
            status = data.getString(PulseWearContract.KEY_STATUS, "idle"),
            sessionType = data.getString(PulseWearContract.KEY_SESSION_TYPE, "focus"),
            endsAt = data.getLong(PulseWearContract.KEY_ENDS_AT, 0L),
            durationSeconds = data.getInt(PulseWearContract.KEY_DURATION_SECONDS, 0),
            remainingSeconds = data.getInt(PulseWearContract.KEY_REMAINING_SECONDS, 0),
            taskName = data.getString(PulseWearContract.KEY_TASK_NAME, ""),
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
            .putString(PulseWearContract.KEY_TASK_NAME, state.taskName)
            .putString(PulseWearContract.KEY_PROJECT_NAME, state.projectName)
            .putString(PulseWearContract.KEY_FOCUS_HOME, state.focusHome)
            .putString(PulseWearContract.KEY_SOURCE_DEVICE, state.sourceDevice)
            .putLong(PulseWearContract.KEY_VERSION, state.version)
            .putLong(PulseWearContract.KEY_UPDATED_AT, state.updatedAt)
            .apply()
        return state
    }
}
