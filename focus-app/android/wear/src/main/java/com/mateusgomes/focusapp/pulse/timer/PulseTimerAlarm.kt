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
        if (intent.action != PulseTimerAlarmScheduler.ACTION_TIMER_FINISHED) return

        val session = runCatching {
            PulseSession.valueOf(
                intent.getStringExtra(PulseTimerAlarmScheduler.EXTRA_SESSION).orEmpty(),
            )
        }.getOrDefault(PulseSession.FOCUS)

        createNotificationChannel(context)
        vibrate(context)

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

        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_focus_pulse)
            .setContentTitle(context.getString(R.string.notification_timer_complete))
            .setContentText(text)
            .setContentIntent(openApp)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setSilent(true)
            .build()

        val manager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
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

    private fun vibrate(context: Context) {
        val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager =
                context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
            manager.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
        }
        val pattern = longArrayOf(0, 180, 90, 280)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createWaveform(pattern, -1))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(pattern, -1)
        }
    }

    companion object {
        private const val CHANNEL_ID = "focus_pulse_timer_completion"
        private const val NOTIFICATION_ID = 4102
    }
}
