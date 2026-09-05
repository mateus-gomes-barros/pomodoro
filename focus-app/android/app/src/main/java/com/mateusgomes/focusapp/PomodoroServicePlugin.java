package com.mateusgomes.focusapp;

import android.content.Intent;
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
        String badgeIcon = call.getString("badgeIcon", "");

        Log.d(TAG, "endTime=" + endTime);
        Log.d(TAG, "badgeIcon=" + badgeIcon);

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
                PomodoroForegroundService.EXTRA_BADGE_ICON,
                badgeIcon
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
    public void stopService(PluginCall call) {

        Log.d(TAG, "stopService() called");

        Intent intent =
                new Intent(
                        getContext(),
                        PomodoroForegroundService.class
                );

        getContext().stopService(intent);

        call.resolve();
    }
}