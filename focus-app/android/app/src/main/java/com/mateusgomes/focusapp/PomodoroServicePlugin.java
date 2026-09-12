package com.mateusgomes.focusapp;

import android.content.Intent;
import androidx.core.app.NotificationManagerCompat;
import android.provider.Settings;
import android.content.Context;
import android.app.NotificationManager;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "PomodoroService")
public class PomodoroServicePlugin extends Plugin {

    private static final String TAG = "PomodoroPlugin";
    private static PomodoroServicePlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
    }

    @Override
    public void handleOnNewIntent(Intent intent) {
        super.handleOnNewIntent(intent);
        if (intent != null && intent.getAction() != null) {
            String action = intent.getAction();
            if (PomodoroForegroundService.ACTION_PAUSE.equals(action) || 
                PomodoroForegroundService.ACTION_STOP.equals(action)) {
                onActionReceived(action);
            }
        }
    }

    public static void onActionReceived(String action) {
        if (instance != null) {
            com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
            ret.put("action", action);
            instance.notifyListeners("onNotificationAction", ret);
        }
    }

    @PluginMethod
    public void startService(PluginCall call) {

        Log.d(TAG, "startService() called");

        String title = call.getString("title", "Tempo de Foco");
        String body = call.getString("body", "Focando...");
        long endTime = call.getLong("endTime", 0L);
        int badgeLevel = call.getInt("badgeLevel", 0);

        getContext()
            .getSharedPreferences(
                "focus_widgets",
                android.content.Context.MODE_PRIVATE
            )
            .edit()
            .putString("timer_widget_title", title)
            .putString("timer_widget_body", body)
            .putInt("timer_widget_badge_level", badgeLevel)
            .putLong("timer_widget_end_time", endTime)
            .putBoolean("timer_widget_running", endTime > System.currentTimeMillis())
            .apply();

        MediumTimerWidgetProvider.updateAll(
            getContext()
        );

        Log.d(TAG, "endTime=" + endTime);
        Log.d(TAG, "badgeLevel=" + badgeLevel);

        Intent intent =
                new Intent(getContext(), PomodoroForegroundService.class);

        intent.putExtra(
                PomodoroForegroundService.EXTRA_TITLE,
                title
        );

        intent.putExtra(
                PomodoroForegroundService.EXTRA_BODY,
                body
        );

        intent.putExtra(
                PomodoroForegroundService.EXTRA_END_TIME,
                endTime
        );

        intent.putExtra(
                PomodoroForegroundService.EXTRA_BADGE_LEVEL,
                badgeLevel
        );

        try {

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

                Log.d(TAG, "Calling startForegroundService()");

                getContext().startForegroundService(intent);

            } else {

                Log.d(TAG, "Calling startService()");

                getContext().startService(intent);
            }

            Log.d(TAG, "Service start request SUCCESS");

            call.resolve();

        } catch (Exception e) {

            Log.e(TAG, "FAILED TO START SERVICE", e);

            call.reject(
                    "Failed to start Pomodoro service",
                    e
            );
        }
    }

    @PluginMethod
    public void checkNotificationSetup(
        PluginCall call
    ) {
        boolean notificationsEnabled =
            NotificationManagerCompat
                .from(getContext())
                .areNotificationsEnabled();

        boolean liveNotificationsSupported =
            Build.VERSION.SDK_INT >= 36;

        boolean liveNotificationsEnabled = false;

        if (liveNotificationsSupported) {
            NotificationManager manager =
                (NotificationManager)
                    getContext().getSystemService(
                        Context.NOTIFICATION_SERVICE
                    );

            if (manager != null) {
                liveNotificationsEnabled =
                    manager
                        .canPostPromotedNotifications();
            }
        }

        com.getcapacitor.JSObject result =
            new com.getcapacitor.JSObject();

        result.put(
            "notificationsEnabled",
            notificationsEnabled
        );

        result.put(
            "liveNotificationsSupported",
            liveNotificationsSupported
        );

        result.put(
            "liveNotificationsEnabled",
            liveNotificationsEnabled
        );

        call.resolve(result);
    }

    @PluginMethod
    public void openNotificationSettings(
        PluginCall call
    ) {
        try {
            Intent intent =
                new Intent(
                    Settings
                        .ACTION_APP_NOTIFICATION_SETTINGS
                );

            intent.putExtra(
                Settings.EXTRA_APP_PACKAGE,
                getContext().getPackageName()
            );

            intent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
            );

            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject(
                "Unable to open notification settings",
                error
            );
        }
    }

    @PluginMethod
    public void openLiveNotificationSettings(
        PluginCall call
    ) {
        try {
            Intent intent;

            if (Build.VERSION.SDK_INT >= 36) {
                intent =
                    new Intent(
                        Settings
                            .ACTION_APP_NOTIFICATION_PROMOTION_SETTINGS
                    );

                intent.putExtra(
                    Settings.EXTRA_APP_PACKAGE,
                    getContext().getPackageName()
                );
            } else {
                intent =
                    new Intent(
                        Settings
                            .ACTION_APP_NOTIFICATION_SETTINGS
                    );

                intent.putExtra(
                    Settings.EXTRA_APP_PACKAGE,
                    getContext().getPackageName()
                );
            }

            intent.addFlags(
                Intent.FLAG_ACTIVITY_NEW_TASK
            );

            getContext().startActivity(intent);
            call.resolve();
        } catch (Exception error) {
            call.reject(
                "Unable to open live notification settings",
                error
            );
        }
    }

    @PluginMethod
    public void stopService(PluginCall call) {

        Log.d(TAG, "stopService() called");

        Intent intent =
                new Intent(
                        getContext(),
                        PomodoroForegroundService.class
                );

        getContext().stopService(intent);

        getContext()
            .getSharedPreferences(
                "focus_widgets",
                android.content.Context.MODE_PRIVATE
            )
            .edit()
            .putLong("timer_widget_end_time", 0L)
            .putBoolean("timer_widget_running", false)
            .apply();

        MediumTimerWidgetProvider.updateAll(
            getContext()
        );

        call.resolve();
    }
}