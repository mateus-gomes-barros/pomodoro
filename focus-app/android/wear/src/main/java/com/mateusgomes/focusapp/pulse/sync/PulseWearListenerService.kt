package com.mateusgomes.focusapp.pulse.sync

import android.content.Intent
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService
import com.mateusgomes.focusapp.pulse.tile.PulseTimerTileService
import com.mateusgomes.focusapp.pulse.timer.PulseSession
import com.mateusgomes.focusapp.pulse.timer.PulseTimerAlarmScheduler
import com.mateusgomes.focusapp.pulse.timer.PulseTimerOngoingService
import com.mateusgomes.focusapp.pulse.timer.PulseTimerPersistence
import com.mateusgomes.focusapp.pulse.timer.PulseTimerSettings
import com.mateusgomes.focusapp.pulse.timer.PulseTimerSnapshot
import com.mateusgomes.focusapp.pulse.timer.PulseTimerStatus
import kotlin.math.ceil

class PulseWearListenerService : WearableListenerService() {
    override fun onDataChanged(events: DataEventBuffer) {
        events.forEach { event ->
            if (event.type != DataEvent.TYPE_CHANGED) return@forEach
            val path = event.dataItem.uri.path
            val data = DataMapItem.fromDataItem(event.dataItem).dataMap

            if (path == PulseWearContract.SNAPSHOT_PATH) {
                val snapshotJson = data.getString(
                    PulseWearContract.KEY_SNAPSHOT_JSON,
                    "{}",
                )
                runCatching {
                    PulseFocusSnapshotStore(this).save(snapshotJson)
                    sendBroadcast(
                        Intent(ACTION_FOCUS_SNAPSHOT_UPDATED).setPackage(packageName),
                    )
                }
                return@forEach
            }

            if (path != PulseWearContract.TIMER_STATE_PATH) return@forEach
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
                applyTimerInBackground(data)
                PulseTimerTileService.requestUpdate(this)
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

    private fun applyTimerInBackground(
        data: com.google.android.gms.wearable.DataMap,
    ) {
        val persistence = PulseTimerPersistence(this)
        val defaults = PulseTimerSettings()
        val restored = persistence.load(defaults)
        val session = when (
            data.getString(PulseWearContract.KEY_SESSION_TYPE, "focus")
        ) {
            "short_break" -> PulseSession.SHORT_BREAK
            "long_break" -> PulseSession.LONG_BREAK
            else -> PulseSession.FOCUS
        }
        val status = when (
            data.getString(PulseWearContract.KEY_STATUS, "idle")
        ) {
            "running" -> PulseTimerStatus.RUNNING
            "paused" -> PulseTimerStatus.PAUSED
            "completed" -> PulseTimerStatus.COMPLETED
            else -> PulseTimerStatus.IDLE
        }
        val durationSeconds = data.getInt(
            PulseWearContract.KEY_DURATION_SECONDS,
            defaults.durationSecondsFor(session),
        ).coerceAtLeast(1)
        val durationMinutes = ceil(durationSeconds / 60.0)
            .toInt()
        val transmittedRemaining = data.getInt(
            PulseWearContract.KEY_REMAINING_SECONDS,
            durationSeconds,
        ).coerceIn(0, durationSeconds)
        val remaining = if (
            status == PulseTimerStatus.IDLE &&
            transmittedRemaining == 0
        ) {
            defaults.durationSecondsFor(session)
        } else {
            transmittedRemaining
        }
        val localEndsAt = if (
            status == PulseTimerStatus.RUNNING &&
            remaining > 0
        ) {
            System.currentTimeMillis() + remaining * 1000L
        } else {
            0L
        }

        persistence.save(
            PulseTimerSnapshot(
                session = session,
                status = status,
                remainingSeconds = remaining,
                endsAtEpochMillis = localEndsAt,
                completedFocusSessions = restored.completedFocusSessions,
                workDurationMinutes =
                    if (session == PulseSession.FOCUS) {
                        durationMinutes.coerceIn(5, 90)
                    } else restored.workDurationMinutes,
                shortBreakDurationMinutes =
                    if (session == PulseSession.SHORT_BREAK) {
                        durationMinutes.coerceIn(1, 30)
                    } else restored.shortBreakDurationMinutes,
                longBreakDurationMinutes =
                    if (session == PulseSession.LONG_BREAK) {
                        durationMinutes.coerceIn(5, 60)
                    } else restored.longBreakDurationMinutes,
            ),
        )

        val alarm = PulseTimerAlarmScheduler(this)
        if (status == PulseTimerStatus.RUNNING && localEndsAt > 0L) {
            alarm.schedule(localEndsAt, session)
            PulseTimerOngoingService.start(this, localEndsAt, session)
        } else {
            alarm.cancel()
            PulseTimerOngoingService.stop(this)
        }
    }

    companion object {
        const val ACTION_REMOTE_TIMER_UPDATED =
            "com.mateusgomes.focusapp.pulse.REMOTE_TIMER_UPDATED"
        const val ACTION_FOCUS_SNAPSHOT_UPDATED =
            "com.mateusgomes.focusapp.pulse.FOCUS_SNAPSHOT_UPDATED"
    }
}
