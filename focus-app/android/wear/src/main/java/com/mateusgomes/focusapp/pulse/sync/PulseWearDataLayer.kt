package com.mateusgomes.focusapp.pulse.sync

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.mateusgomes.focusapp.pulse.tile.PulseTimerTileService
import com.mateusgomes.focusapp.pulse.timer.FocusHomeKey
import com.mateusgomes.focusapp.pulse.timer.PulseSession
import com.mateusgomes.focusapp.pulse.timer.PulseTimerStatus
import java.util.UUID
import org.json.JSONObject
import kotlin.math.max

class PulseWearDataLayer(private val context: Context) {
    fun publishTimer(
        session: PulseSession,
        status: PulseTimerStatus,
        durationSeconds: Int,
        remainingSeconds: Int,
        endsAt: Long,
        focusHome: FocusHomeKey?,
    ) {
        val preferences = context.getSharedPreferences(
            SYNC_PREFERENCES,
            Context.MODE_PRIVATE,
        )
        val now = System.currentTimeMillis()
        val version = max(
            now,
            preferences.getLong(KEY_LAST_VERSION, 0L) + 1L,
        )
        val remoteState = PulseRemoteTimerStore(context).load()
        val projectSelection = PulseProjectSelectionStore(context)
        val sessionId =
            remoteState?.sessionId?.takeIf { it.isNotBlank() }
                ?: preferences.getString(KEY_SESSION_ID, null)
                ?: UUID.randomUUID().toString()
        val request = PutDataMapRequest.create(PulseWearContract.TIMER_STATE_PATH)
        request.dataMap.apply {
            putString(PulseWearContract.KEY_SESSION_ID, sessionId)
            putString(PulseWearContract.KEY_STATUS, status.name.lowercase())
            putString(
                PulseWearContract.KEY_SESSION_TYPE,
                when (session) {
                    PulseSession.FOCUS -> "focus"
                    PulseSession.SHORT_BREAK -> "short_break"
                    PulseSession.LONG_BREAK -> "long_break"
                },
            )
            putLong(PulseWearContract.KEY_STARTED_AT, now)
            putLong(PulseWearContract.KEY_ENDS_AT, endsAt)
            putInt(PulseWearContract.KEY_DURATION_SECONDS, durationSeconds)
            putInt(PulseWearContract.KEY_REMAINING_SECONDS, remainingSeconds)
            putString(
                PulseWearContract.KEY_TASK_ID,
                remoteState?.taskId.orEmpty(),
            )
            putString(
                PulseWearContract.KEY_TASK_NAME,
                remoteState?.taskName.orEmpty(),
            )
            putString(
                PulseWearContract.KEY_PROJECT_ID,
                projectSelection.id().ifBlank { remoteState?.projectId.orEmpty() },
            )
            putString(
                PulseWearContract.KEY_PROJECT_NAME,
                projectSelection.name().ifBlank { remoteState?.projectName.orEmpty() },
            )
            putString(PulseWearContract.KEY_FOCUS_HOME, focusHome?.wireValue.orEmpty())
            putString(PulseWearContract.KEY_SOURCE_DEVICE, PulseWearContract.SOURCE_WATCH)
            putLong(PulseWearContract.KEY_VERSION, version)
            putLong(PulseWearContract.KEY_UPDATED_AT, now)
        }

        PulseTimerTileService.requestUpdate(context)

        preferences.edit()
            .putString(KEY_SESSION_ID, sessionId)
            .putLong(KEY_LAST_VERSION, version)
            .putBoolean(KEY_PENDING_SYNC, true)
            .apply()

        Wearable.getDataClient(context)
            .putDataItem(request.asPutDataRequest().setUrgent())
            .addOnSuccessListener {
                preferences.edit()
                    .putBoolean(KEY_PENDING_SYNC, false)
                    .apply()
            }
            .addOnFailureListener { error ->
                preferences.edit()
                    .putBoolean(KEY_PENDING_SYNC, true)
                    .apply()
                Log.e(TAG, "Unable to publish Pulse timer", error)
            }
    }

    fun publishAction(
        type: String,
        taskId: String = "",
        projectId: String = "",
        title: String = "",
    ) {
        val now = System.currentTimeMillis()
        val payload = JSONObject()
            .put("id", UUID.randomUUID().toString())
            .put("type", type)
            .put("taskId", taskId)
            .put("projectId", projectId)
            .put("title", title)
            .put("createdAt", now)
            .toString()
        val request = PutDataMapRequest.create(PulseWearContract.ACTION_PATH)
        request.dataMap.apply {
            putString(PulseWearContract.KEY_ACTION_JSON, payload)
            putString(PulseWearContract.KEY_SOURCE_DEVICE, PulseWearContract.SOURCE_WATCH)
            putLong(PulseWearContract.KEY_UPDATED_AT, now)
        }
        Wearable.getDataClient(context)
            .putDataItem(request.asPutDataRequest().setUrgent())
            .addOnFailureListener { error ->
                Log.e(TAG, "Unable to queue Pulse action", error)
            }
    }

    fun acknowledgeTimer(
        sessionId: String,
        version: Long,
        status: String,
    ) {
        val request = PutDataMapRequest.create(PulseWearContract.TIMER_ACK_PATH)
        request.dataMap.apply {
            putString(PulseWearContract.KEY_SESSION_ID, sessionId)
            putLong(PulseWearContract.KEY_ACK_VERSION, version)
            putString(PulseWearContract.KEY_ACK_STATUS, status)
            putString(PulseWearContract.KEY_SOURCE_DEVICE, PulseWearContract.SOURCE_WATCH)
            putLong(PulseWearContract.KEY_UPDATED_AT, System.currentTimeMillis())
        }
        Wearable.getDataClient(context)
            .putDataItem(request.asPutDataRequest().setUrgent())
            .addOnFailureListener { error ->
                Log.e(TAG, "Unable to acknowledge Pulse timer", error)
            }
    }

    private companion object {
        const val TAG = "PulseWearDataLayer"
        const val SYNC_PREFERENCES = "focus_pulse_outbox"
        const val KEY_SESSION_ID = "session_id"
        const val KEY_LAST_VERSION = "last_version"
        const val KEY_PENDING_SYNC = "pending_sync"
    }
}
