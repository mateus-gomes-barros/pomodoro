package com.mateusgomes.focusapp.pulse.sync

import android.content.Intent
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService

class PulseWearListenerService : WearableListenerService() {
    override fun onDataChanged(events: DataEventBuffer) {
        events.forEach { event ->
            if (event.type != DataEvent.TYPE_CHANGED) return@forEach
            if (event.dataItem.uri.path != PulseWearContract.TIMER_STATE_PATH) return@forEach

            val data = DataMapItem.fromDataItem(event.dataItem).dataMap
            if (data.getString(
                    PulseWearContract.KEY_SOURCE_DEVICE,
                    "",
                ) == PulseWearContract.SOURCE_WATCH
            ) return@forEach

            val incomingVersion = data.getLong(
                PulseWearContract.KEY_VERSION,
                0L,
            )
            val store = PulseRemoteTimerStore(this)
            val currentVersion = store.load()?.version ?: 0L

            if (incomingVersion > currentVersion) {
                store.save(data)
                sendBroadcast(
                    Intent(ACTION_REMOTE_TIMER_UPDATED).setPackage(packageName),
                )
            }

            PulseWearDataLayer(this).acknowledgeTimer(
                sessionId = data.getString(
                    PulseWearContract.KEY_SESSION_ID,
                    "",
                ),
                version = incomingVersion,
                status = data.getString(
                    PulseWearContract.KEY_STATUS,
                    "idle",
                ),
            )
        }
    }

    companion object {
        const val ACTION_REMOTE_TIMER_UPDATED =
            "com.mateusgomes.focusapp.pulse.REMOTE_TIMER_UPDATED"
    }
}
