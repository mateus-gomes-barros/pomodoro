package com.mateusgomes.focusapp.pulse.timer

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.mateusgomes.focusapp.pulse.sync.PulseWearDataLayer

class PulseBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action != Intent.ACTION_BOOT_COMPLETED &&
            intent?.action != Intent.ACTION_MY_PACKAGE_REPLACED
        ) return

        val snapshot = PulseTimerPersistence(context).load(PulseTimerSettings())
        if (
            snapshot.status == PulseTimerStatus.RUNNING &&
            snapshot.endsAtEpochMillis > System.currentTimeMillis()
        ) {
            PulseTimerAlarmScheduler(context).schedule(
                snapshot.endsAtEpochMillis,
                snapshot.session,
            )
            PulseTimerOngoingService.start(
                context,
                snapshot.endsAtEpochMillis,
                snapshot.session,
            )
        }
        PulseWearDataLayer(context).retryPendingActions()
    }
}
