package com.mateusgomes.focusapp.pulse.timer

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import com.mateusgomes.focusapp.pulse.MainActivity
import com.mateusgomes.focusapp.pulse.R
import com.mateusgomes.focusapp.pulse.sync.PulseRemoteTimerStore
import com.mateusgomes.focusapp.pulse.sync.PulseWearDataLayer
import com.mateusgomes.focusapp.pulse.tile.PulseTimerTileService

class PulseTimerAlarmScheduler(private val context: Context) {
    private val alarmManager =
        context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

    fun schedule(endsAtEpochMillis: Long, session: PulseSession) {
        if (endsAtEpochMillis <= System.currentTimeMillis()) return
        val pendingIntent = completionIntent(session)
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
            alarmManager.canScheduleExactAlarms()
        ) {
            alarmManager.setExactAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                endsAtEpochMillis,
                pendingIntent,
            )
        } else {
            alarmManager.setAndAllowWhileIdle(
                AlarmManager.RTC_WAKEUP,
                endsAtEpochMillis,
                pendingIntent,
            )
        }
    }

    fun cancel() {
        alarmManager.cancel(completionIntent(PulseSession.FOCUS))
    }

    private fun completionIntent(session: PulseSession): PendingIntent {
        val intent = Intent(context, PulseTimerAlarmReceiver::class.java).apply {
            action = ACTION_TIMER_FINISHED
            putExtra(EXTRA_SESSION, session.name)
        }
        return PendingIntent.getBroadcast(
            context,
            REQUEST_CODE,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
    }

    companion object {
        const val ACTION_TIMER_FINISHED =
            "com.mateusgomes.focusapp.pulse.action.TIMER_FINISHED"
        const val EXTRA_SESSION = "session"
        private const val REQUEST_CODE = 4101
    }
}

class PulseTimerAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == ACTION_PAUSE || intent.action == ACTION_END ||
            intent.action == ACTION_CONTINUE
        ) {
            handleQuickAction(context, intent.action.orEmpty())
            return
        }
        if (intent.action != PulseTimerAlarmScheduler.ACTION_TIMER_FINISHED) return

        val session = runCatching {
            PulseSession.valueOf(
                intent.getStringExtra(PulseTimerAlarmScheduler.EXTRA_SESSION).orEmpty(),
            )
        }.getOrDefault(PulseSession.FOCUS)

        val persistence = PulseTimerPersistence(context)
        val snapshot = persistence.load(PulseTimerSettings())
        val completed = snapshot.copy(
            session = session,
            status = PulseTimerStatus.COMPLETED,
            remainingSeconds = 0,
            endsAtEpochMillis = 0L,
        )
        persistence.save(completed)
        PulseTimerOngoingService.stop(context)
        PulseTimerTileService.requestUpdate(context)

        val totalSeconds = when (session) {
            PulseSession.FOCUS -> completed.workDurationMinutes * 60
            PulseSession.SHORT_BREAK -> completed.shortBreakDurationMinutes * 60
            PulseSession.LONG_BREAK -> completed.longBreakDurationMinutes * 60
        }
        val focusHome = FocusHomeKey.fromWireValue(
            PulseRemoteTimerStore(context).load()?.focusHome,
        )
        PulseWearDataLayer(context).publishTimer(
            session = session,
            status = PulseTimerStatus.COMPLETED,
            durationSeconds = totalSeconds,
            remainingSeconds = 0,
            endsAt = 0L,
            focusHome = focusHome,
        )

        createNotificationChannel(context)
        vibrate(context, session)

        val openApp = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val text = when (session) {
            PulseSession.FOCUS -> context.getString(R.string.notification_focus_complete)
            PulseSession.SHORT_BREAK -> context.getString(R.string.notification_short_break_complete)
            PulseSession.LONG_BREAK -> context.getString(R.string.notification_long_break_complete)
        }

        val continueAction = actionIntent(context, ACTION_CONTINUE, 4201)
        val endAction = actionIntent(context, ACTION_END, 4202)
        val nextLabel = if (session == PulseSession.FOCUS) {
            context.getString(R.string.notification_start_break)
        } else {
            context.getString(R.string.notification_start_focus)
        }

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_focus_pulse)
            .setContentTitle(context.getString(R.string.notification_timer_complete))
            .setContentText(text)
            .setContentIntent(openApp)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setSilent(true)
            .addAction(0, nextLabel, continueAction)
            .addAction(
                0,
                context.getString(R.string.notification_end),
                endAction,
            )
            .build()

        val manager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun actionIntent(
        context: Context,
        action: String,
        requestCode: Int,
    ): PendingIntent = PendingIntent.getBroadcast(
        context,
        requestCode,
        Intent(context, PulseTimerAlarmReceiver::class.java).setAction(action),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
    )

    private fun handleQuickAction(context: Context, action: String) {
        val persistence = PulseTimerPersistence(context)
        val snapshot = persistence.load(PulseTimerSettings())
        val focusHome = FocusHomeKey.fromWireValue(
            PulseRemoteTimerStore(context).load()?.focusHome,
        )
        val alarm = PulseTimerAlarmScheduler(context)
        when (action) {
            ACTION_PAUSE -> {
                val remaining = if (snapshot.endsAtEpochMillis > 0L) {
                    kotlin.math.ceil(
                        (snapshot.endsAtEpochMillis - System.currentTimeMillis())
                            .coerceAtLeast(0L) / 1000.0,
                    ).toInt()
                } else snapshot.remainingSeconds
                persistence.save(
                    snapshot.copy(
                        status = PulseTimerStatus.PAUSED,
                        remainingSeconds = remaining,
                        endsAtEpochMillis = 0L,
                    ),
                )
                alarm.cancel()
                PulseTimerOngoingService.stop(context)
                PulseWearDataLayer(context).publishTimer(
                    snapshot.session,
                    PulseTimerStatus.PAUSED,
                    durationSeconds(snapshot),
                    remaining,
                    0L,
                    focusHome,
                )
            }
            ACTION_CONTINUE -> {
                val next = if (snapshot.status == PulseTimerStatus.COMPLETED) {
                    if (snapshot.session == PulseSession.FOCUS) {
                        PulseSession.SHORT_BREAK
                    } else {
                        PulseSession.FOCUS
                    }
                } else snapshot.session
                val remaining = if (
                    snapshot.status == PulseTimerStatus.PAUSED &&
                    next == snapshot.session
                ) snapshot.remainingSeconds else durationSeconds(snapshot, next)
                val endsAt = System.currentTimeMillis() + remaining * 1000L
                val running = snapshot.copy(
                    session = next,
                    status = PulseTimerStatus.RUNNING,
                    remainingSeconds = remaining,
                    endsAtEpochMillis = endsAt,
                )
                persistence.save(running)
                alarm.schedule(endsAt, next)
                PulseTimerOngoingService.start(context, endsAt, next)
                PulseWearDataLayer(context).publishTimer(
                    next,
                    PulseTimerStatus.RUNNING,
                    durationSeconds(running, next),
                    remaining,
                    endsAt,
                    focusHome,
                )
            }
            ACTION_END -> {
                val total = durationSeconds(snapshot)
                persistence.save(
                    snapshot.copy(
                        status = PulseTimerStatus.IDLE,
                        remainingSeconds = total,
                        endsAtEpochMillis = 0L,
                    ),
                )
                alarm.cancel()
                PulseTimerOngoingService.stop(context)
                PulseWearDataLayer(context).publishTimer(
                    snapshot.session,
                    PulseTimerStatus.IDLE,
                    total,
                    total,
                    0L,
                    focusHome,
                )
            }
        }
        PulseTimerTileService.requestUpdate(context)
        val manager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.cancel(NOTIFICATION_ID)
    }

    private fun durationSeconds(
        snapshot: PulseTimerSnapshot,
        session: PulseSession = snapshot.session,
    ): Int = when (session) {
        PulseSession.FOCUS -> snapshot.workDurationMinutes * 60
        PulseSession.SHORT_BREAK -> snapshot.shortBreakDurationMinutes * 60
        PulseSession.LONG_BREAK -> snapshot.longBreakDurationMinutes * 60
    }

    private fun createNotificationChannel(context: Context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return
        val manager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val channel = NotificationChannel(
            CHANNEL_ID,
            context.getString(R.string.notification_channel_timer),
            NotificationManager.IMPORTANCE_HIGH,
        ).apply {
            description = context.getString(R.string.notification_channel_timer_description)
            setSound(null, null)
            enableVibration(false)
        }
        manager.createNotificationChannel(channel)
    }

    private fun vibrate(context: Context, session: PulseSession) {
        val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager =
                context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            manager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        val pattern = when (session) {
            PulseSession.FOCUS -> longArrayOf(0, 180, 90, 280)
            PulseSession.SHORT_BREAK -> longArrayOf(0, 120, 80, 120)
            PulseSession.LONG_BREAK -> longArrayOf(0, 260, 110, 260, 110, 260)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(pattern, -1)
        }
    }

    companion object {
        const val ACTION_PAUSE =
            "com.mateusgomes.focusapp.pulse.action.PAUSE"
        const val ACTION_CONTINUE =
            "com.mateusgomes.focusapp.pulse.action.CONTINUE"
        const val ACTION_END =
            "com.mateusgomes.focusapp.pulse.action.END"
        private const val CHANNEL_ID = "focus_pulse_timer_completion"
        private const val NOTIFICATION_ID = 4102
    }
}
