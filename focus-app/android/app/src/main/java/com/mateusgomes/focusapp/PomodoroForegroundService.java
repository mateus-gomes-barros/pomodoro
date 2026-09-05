package com.mateusgomes.focusapp;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Intent;
import android.content.pm.ServiceInfo;
import android.graphics.drawable.Drawable;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Bitmap;
import android.os.Build;
import android.os.IBinder;
import android.util.Log;

import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.drawable.IconCompat;

public class PomodoroForegroundService extends Service {

    private static final String TAG = "PomodoroFGS";

    public static final String CHANNEL_ID = "pomodoro_live_timer_v4";
    public static final int NOTIFICATION_ID = 1002;

    public static final String EXTRA_TITLE = "title";
    public static final String EXTRA_BODY = "body";
    public static final String EXTRA_END_TIME = "endTime";
    public static final String EXTRA_BADGE_ICON = "badgeIcon";

    public static final String ACTION_PAUSE =
            "com.mateusgomes.focusapp.ACTION_PAUSE";

    public static final String ACTION_STOP =
            "com.mateusgomes.focusapp.ACTION_STOP";

    @Override
    public void onCreate() {
        super.onCreate();

        Log.d(TAG, "onCreate()");

        createNotificationChannel();

        Log.d(TAG, "Notification channel created");
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {

        Log.d(TAG, "onStartCommand()");

        // ---------------------------------------------------------
        // ACTIONS
        // ---------------------------------------------------------

        if (intent != null && intent.getAction() != null) {

            String action = intent.getAction();

            Log.d(TAG, "Action received: " + action);

            if (ACTION_PAUSE.equals(action) ||
                    ACTION_STOP.equals(action)) {

                PomodoroServicePlugin.onActionReceived(action);

                if (ACTION_STOP.equals(action)) {
                    stopSelf();
                    return START_NOT_STICKY;
                }
            }
        }

        // ---------------------------------------------------------
        // TIMER DATA
        // ---------------------------------------------------------

        String title = "Foco";
        String body = "";
        String badgeIcon = "";
        long endTime = 0;

        if (intent != null) {

            Log.d(TAG, "Intent received");

            if (intent.hasExtra(EXTRA_TITLE)) {
                title = intent.getStringExtra(EXTRA_TITLE);
            }

            if (intent.hasExtra(EXTRA_BODY)) {
                body = intent.getStringExtra(EXTRA_BODY);
            }

            if (intent.hasExtra(EXTRA_BADGE_ICON)) {
                badgeIcon = intent.getStringExtra(EXTRA_BADGE_ICON);
            }

            if (intent.hasExtra(EXTRA_END_TIME)) {
                endTime = intent.getLongExtra(EXTRA_END_TIME, 0);
            }
        }

        Log.d(TAG, "title=" + title);
        Log.d(TAG, "body=" + body);
        Log.d(TAG, "badgeIcon=" + badgeIcon);
        Log.d(TAG, "endTime=" + endTime);

        // ---------------------------------------------------------
        // PAUSE / RESUME STATE
        // ---------------------------------------------------------

        boolean isPaused =
                title != null && title.contains("(Pausado)");

        String pauseActionTitle =
                isPaused ? "Retomar" : "Pausar";

        int pauseIcon =
                isPaused
                        ? android.R.drawable.ic_media_play
                        : android.R.drawable.ic_media_pause;

        // ---------------------------------------------------------
        // OPEN APP
        // ---------------------------------------------------------

        Intent mainIntent =
                new Intent(this, MainActivity.class);

        mainIntent.setFlags(
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_CLEAR_TOP
        );

        int pendingIntentFlags =
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.M
                        ? PendingIntent.FLAG_UPDATE_CURRENT |
                          PendingIntent.FLAG_IMMUTABLE
                        : PendingIntent.FLAG_UPDATE_CURRENT;

        PendingIntent contentIntent =
                PendingIntent.getActivity(
                        this,
                        0,
                        mainIntent,
                        pendingIntentFlags
                );

        // ---------------------------------------------------------
        // PAUSE / RESUME ACTION
        // ---------------------------------------------------------

        Intent pauseIntent =
                new Intent(this, MainActivity.class);

        pauseIntent.setAction(ACTION_PAUSE);

        pauseIntent.setFlags(
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_CLEAR_TOP
        );

        PendingIntent pausePendingIntent =
                PendingIntent.getActivity(
                        this,
                        1,
                        pauseIntent,
                        pendingIntentFlags
                );

        // ---------------------------------------------------------
        // STOP ACTION
        // ---------------------------------------------------------

        Intent stopIntent =
                new Intent(this, MainActivity.class);

        stopIntent.setAction(ACTION_STOP);

        stopIntent.setFlags(
                Intent.FLAG_ACTIVITY_SINGLE_TOP |
                Intent.FLAG_ACTIVITY_CLEAR_TOP
        );

        PendingIntent stopPendingIntent =
                PendingIntent.getActivity(
                        this,
                        2,
                        stopIntent,
                        pendingIntentFlags
                );

        // ---------------------------------------------------------
        // NOTIFICATION
        // ---------------------------------------------------------

       NotificationCompat.Builder builder =
        new NotificationCompat.Builder(this, CHANNEL_ID)
                .setSmallIcon(getBadgeIconResource(badgeIcon))
                .setLargeIcon(createBadgeLargeIcon(badgeIcon))
                .setContentTitle(title)
                .setOngoing(true)
                .setOnlyAlertOnce(true)
                .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setRequestPromotedOngoing(true)
                .setContentIntent(contentIntent)
                .addAction(pauseIcon, pauseActionTitle, pausePendingIntent)
                .addAction(
                        android.R.drawable.ic_menu_close_clear_cancel,
                        "Encerrar",
                        stopPendingIntent
                );

if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N && endTime > 0) {
    builder
            .setWhen(endTime)
            .setUsesChronometer(true)
            .setChronometerCountDown(true);

    if (Build.VERSION.SDK_INT >= 36) {

        long now = System.currentTimeMillis();
        long remainingMs = Math.max(0L, endTime - now);

        // Temporário: usamos 25 min apenas para validar o visual.
        // Depois enviaremos a duração real da sessão pelo bridge.
        long totalMs = 25L * 60L * 1000L;

        int progress = (int) Math.max(
                0,
                Math.min(
                        100,
                        100 - ((remainingMs * 100L) / totalMs)
                )
        );

        NotificationCompat.ProgressStyle progressStyle =
                new NotificationCompat.ProgressStyle()
                        .setProgress(progress)
                        .setStyledByProgress(true)
                        .setProgressTrackerIcon(
                                IconCompat.createWithResource(
                                        this,
                                        getBadgeIconResource(badgeIcon)
                                )
                        );

        builder.setStyle(progressStyle);

        Log.d(
                TAG,
                "ProgressStyle enabled, progress=" + progress
        );
    }
}
        else {

            Log.d(TAG, "Chronometer disabled");

            builder.setUsesChronometer(false);
        }

        Notification notification = builder.build();

        Log.d(TAG, "Notification built");

        // ---------------------------------------------------------
        // ANDROID 16 / PROMOTED NOTIFICATION DEBUG
        // ---------------------------------------------------------

        if (Build.VERSION.SDK_INT >= 36) {

            NotificationManager manager =
                    getSystemService(NotificationManager.class);

            Log.d(
                    TAG,
                    "requestPromotedOngoing=" +
                            NotificationCompat
                                    .isRequestPromotedOngoing(
                                            notification
                                    )
            );

            Log.d(
                    TAG,
                    "hasPromotableCharacteristics=" +
                            NotificationCompat
                                    .hasPromotableCharacteristics(
                                            notification
                                    )
            );

            if (manager != null) {

                Log.d(
                        TAG,
                        "canPostPromotedNotifications=" +
                                manager
                                        .canPostPromotedNotifications()
                );
            }
        }

        // ---------------------------------------------------------
        // START FOREGROUND SERVICE
        // ---------------------------------------------------------

        try {

            Log.d(TAG, "Calling startForeground()");

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {

                startForeground(
                        NOTIFICATION_ID,
                        notification,
                        ServiceInfo
                                .FOREGROUND_SERVICE_TYPE_SPECIAL_USE
                );

            } else {

                startForeground(
                        NOTIFICATION_ID,
                        notification
                );
            }

            Log.d(TAG, "startForeground() SUCCESS");

        } catch (Exception e) {

            Log.e(
                    TAG,
                    "startForeground() FAILED",
                    e
            );

            stopSelf();
        }

        return START_STICKY;
    }

    // -------------------------------------------------------------
    // NOTIFICATION CHANNEL
    // -------------------------------------------------------------

    private void createNotificationChannel() {

        Log.d(TAG, "createNotificationChannel()");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

            NotificationChannel channel =
                    new NotificationChannel(
                            CHANNEL_ID,
                            "Pomodoro Timer",
                            NotificationManager.IMPORTANCE_HIGH
                    );

            channel.setDescription(
                    "Contagem do timer na tela de bloqueio e barra de status"
            );

            channel.enableVibration(false);
            channel.setVibrationPattern(null);

            channel.setLockscreenVisibility(
                    Notification.VISIBILITY_PUBLIC
            );

            NotificationManager manager =
                    getSystemService(NotificationManager.class);

            if (manager != null) {

                manager.createNotificationChannel(channel);

                Log.d(
                        TAG,
                        "Channel registered: " + CHANNEL_ID
                );

            } else {

                Log.e(
                        TAG,
                        "NotificationManager is NULL"
                );
            }
        }
    }


    // -------------------------------------------------------------
    // CURRENT STREAK BADGE -> ANDROID NOTIFICATION ICON
    // -------------------------------------------------------------


    // -------------------------------------------------------------
    // CURRENT BADGE -> LARGE NOTIFICATION ICON
    // -------------------------------------------------------------

    private Bitmap createBadgeLargeIcon(String badgeIcon) {

        int resourceId = getBadgeIconResource(badgeIcon);

        Drawable drawable =
                ContextCompat.getDrawable(this, resourceId);

        if (drawable == null) {
            return null;
        }

        int size = (int) (
                48 * getResources().getDisplayMetrics().density
        );

        Bitmap bitmap = Bitmap.createBitmap(
                size,
                size,
                Bitmap.Config.ARGB_8888
        );

        Canvas canvas = new Canvas(bitmap);

        // Fundo circular escuro para manter contraste
        // na tela de bloqueio / One UI.
        Paint backgroundPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        backgroundPaint.setColor(Color.rgb(24, 24, 27));

        float radius = size / 2f;

        canvas.drawCircle(
                radius,
                radius,
                radius,
                backgroundPaint
        );

        // Margem interna para a insígnia não encostar no círculo.
        int padding = (int) (size * 0.22f);

        drawable.setBounds(
                padding,
                padding,
                size - padding,
                size - padding
        );

        drawable.draw(canvas);

        return bitmap;
    }

    private int getBadgeIconResource(String badgeIcon) {

        if (badgeIcon == null) {
            return R.drawable.ic_stat_name;
        }

        switch (badgeIcon) {

            case "💧":
                return R.drawable.ic_badge_drop;

            case "🌱":
                return R.drawable.ic_badge_sprout;

            case "🔥":
                return R.drawable.ic_badge_fire;

            case "❤️‍🔥":
                return R.drawable.ic_badge_heart;

            case "⚡":
                return R.drawable.ic_badge_bolt;

            case "🚀":
                return R.drawable.ic_badge_rocket;

            case "��":
                return R.drawable.ic_badge_moon;

            case "⭐":
            case "🌟":
                return R.drawable.ic_badge_star;

            case "🏅":
            case "🥉":
            case "🥈":
            case "🥇":
                return R.drawable.ic_badge_medal;

            case "💎":
                return R.drawable.ic_badge_diamond;

            case "🔮":
                return R.drawable.ic_badge_crystal;

            case "👑":
                return R.drawable.ic_badge_crown;

            case "🏆":
                return R.drawable.ic_badge_trophy;

            case "♾️":
                return R.drawable.ic_badge_infinity;

            default:
                return R.drawable.ic_stat_name;
        }
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
}