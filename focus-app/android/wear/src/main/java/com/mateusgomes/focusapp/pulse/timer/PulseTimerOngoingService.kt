package com.mateusgomes.focusapp.pulse.timer

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import androidx.wear.ongoing.OngoingActivity
import com.mateusgomes.focusapp.pulse.MainActivity
import com.mateusgomes.focusapp.pulse.R

class PulseTimerOngoingService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private var completionRunnable: Runnable? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val restored = PulseTimerPersistence(this).load(PulseTimerSettings())
        val endsAt = intent?.getLongExtra(EXTRA_ENDS_AT, 0L)
            ?.takeIf { it > 0L }
            ?: restored.endsAtEpochMillis
        val session = runCatching {
            PulseSession.valueOf(
                intent?.getStringExtra(EXTRA_SESSION)
                    ?: restored.session.name,
            )
        }.getOrDefault(restored.session)

        if (endsAt <= System.currentTimeMillis()) {
            stopSelf()
            return START_NOT_STICKY
        }

        createChannel()
        val openApp = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java).apply {
                this.flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        val sessionText = when (session) {
            PulseSession.FOCUS -> getString(R.string.session_focus)
            PulseSession.SHORT_BREAK -> getString(R.string.session_short_break)
            PulseSession.LONG_BREAK -> getString(R.string.session_long_break)
        }

        val pauseIntent = quickActionIntent(
            PulseTimerAlarmReceiver.ACTION_PAUSE,
            REQUEST_CODE_PAUSE,
        )
        val endIntent = quickActionIntent(
            PulseTimerAlarmReceiver.ACTION_END,
            REQUEST_CODE_END,
        )

        val notificationBuilder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_focus_pulse)
            .setContentTitle(getString(R.string.ongoing_timer_title))
            .setContentText(sessionText)
            .setContentIntent(openApp)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setSilent(true)
            .setOnlyAlertOnce(true)
            .setWhen(endsAt)
            .setUsesChronometer(true)
            .setChronometerCountDown(true)
            .addAction(
                0,
                getString(R.string.notification_pause),
                pauseIntent,
            )
            .addAction(
                0,
                getString(R.string.notification_end),
                endIntent,
            )

        val ongoingActivity = OngoingActivity.Builder(
            applicationContext,
            NOTIFICATION_ID,
            notificationBuilder,
        )
            .setStaticIcon(R.drawable.ic_focus_pulse)
            .setTouchIntent(openApp)
            .build()
        ongoingActivity.apply(applicationContext)
        startForeground(NOTIFICATION_ID, notificationBuilder.build())

        completionRunnable?.let(handler::removeCallbacks)
        completionRunnable = Runnable {
            PulseTimerAlarmScheduler(this).cancel()
            sendBroadcast(
                Intent(this, PulseTimerAlarmReceiver::class.java).apply {
                    action = PulseTimerAlarmScheduler.ACTION_TIMER_FINISHED
                    putExtra(PulseTimerAlarmScheduler.EXTRA_SESSION, session.name)
                },
            )
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }.also { runnable ->
            handler.postDelayed(
                runnable,
                (endsAt - System.currentTimeMillis()).coerceAtLeast(0L),
            )
        }

        return START_STICKY
    }

    override fun onDestroy() {
        completionRunnable?.let(handler::removeCallbacks)
        completionRunnable = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun quickActionIntent(action: String, requestCode: Int): PendingIntent =
        PendingIntent.getBroadcast(
            this,
            requestCode,
            Intent(this, PulseTimerAlarmReceiver::class.java).setAction(action),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

    private fun createChannel() {
        val manager = getSystemService(NotificationManager::class.java)
        val channel = NotificationChannel(
            CHANNEL_ID,
            getString(R.string.ongoing_timer_channel),
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = getString(R.string.ongoing_timer_channel_description)
            setSound(null, null)
            enableVibration(false)
        }
        manager.createNotificationChannel(channel)
    }

    companion object {
        private const val CHANNEL_ID = "focus_pulse_ongoing_timer"
        private const val NOTIFICATION_ID = 4100
        private const val EXTRA_ENDS_AT = "ends_at_epoch_millis"
        private const val EXTRA_SESSION = "session"
        private const val REQUEST_CODE_PAUSE = 4110
        private const val REQUEST_CODE_END = 4111

        fun start(context: Context, endsAtEpochMillis: Long, session: PulseSession) {
            val intent = Intent(context, PulseTimerOngoingService::class.java).apply {
                putExtra(EXTRA_ENDS_AT, endsAtEpochMillis)
                putExtra(EXTRA_SESSION, session.name)
            }
            ContextCompat.startForegroundService(context, intent)
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, PulseTimerOngoingService::class.java))
        }
    }
}
