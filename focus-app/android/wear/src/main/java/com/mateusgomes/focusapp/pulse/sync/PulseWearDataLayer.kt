package com.mateusgomes.focusapp.pulse.sync

import android.content.Context
import android.util.Log
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import com.mateusgomes.focusapp.pulse.timer.FocusHomeKey
import com.mateusgomes.focusapp.pulse.timer.PulseSession
import com.mateusgomes.focusapp.pulse.timer.PulseTimerStatus
import java.util.UUID

class PulseWearDataLayer(private val context: Context) {
    fun publishTimer(
        session: PulseSession,
        status: PulseTimerStatus,
        durationSeconds: Int,
        remainingSeconds: Int,
        endsAt: Long,
        focusHome: FocusHomeKey?,
    ) {
        val now = System.currentTimeMillis()
        val request = PutDataMapRequest.create(PulseWearContract.TIMER_STATE_PATH)
        request.dataMap.apply {
            putString(PulseWearContract.KEY_SESSION_ID, UUID.randomUUID().toString())
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
            putString(PulseWearContract.KEY_TASK_ID, "")
            putString(PulseWearContract.KEY_TASK_NAME, "")
            putString(PulseWearContract.KEY_PROJECT_ID, "")
            putString(PulseWearContract.KEY_PROJECT_NAME, "")
            putString(PulseWearContract.KEY_FOCUS_HOME, focusHome?.wireValue.orEmpty())
            putString(PulseWearContract.KEY_SOURCE_DEVICE, PulseWearContract.SOURCE_WATCH)
            putLong(PulseWearContract.KEY_VERSION, now)
            putLong(PulseWearContract.KEY_UPDATED_AT, now)
        }

        Wearable.getDataClient(context)
            .putDataItem(request.asPutDataRequest().setUrgent())
            .addOnFailureListener { error ->
                Log.e(TAG, "Unable to publish Pulse timer", error)
            }
    }

    private companion object {
        const val TAG = "PulseWearDataLayer"
    }
}
