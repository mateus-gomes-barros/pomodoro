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
import com.mateusgomes.focusapp.wear.FocusWearDataLayer;

@CapacitorPlugin(name = "PomodoroService")
public class PomodoroServicePlugin extends Plugin {

    private static final String TAG = "PomodoroPlugin";
    private static PomodoroServicePlugin instance;

    @Override
    public void load() {
        super.load();
        instance = this;
        String pendingWearAction = getContext()
                .getSharedPreferences("focus_wear_actions", Context.MODE_PRIVATE)
                .getString("pending_action_json", "");
        String pendingWearActionId = getContext()
                .getSharedPreferences("focus_wear_actions", Context.MODE_PRIVATE)
                .getString("pending_action_id", "");
        if (pendingWearAction != null && !pendingWearAction.isEmpty()) {
            onWearActionReceived(pendingWearAction);
            FocusWearDataLayer.acknowledgeAction(
                    getContext(),
                    pendingWearActionId
            );
            getContext()
                    .getSharedPreferences("focus_wear_actions", Context.MODE_PRIVATE)
                    .edit()
                    .remove("pending_action_json")
                    .remove("pending_action_id")
                    .apply();
        }
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

    public static boolean onWearActionReceived(String actionJson) {
        if (instance == null) return false;
        com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
        ret.put("actionJson", actionJson);
        instance.notifyListeners("onWearAction", ret, true);
        return true;
    }

    public static void onWearTimerStateReceived(
            com.google.android.gms.wearable.DataMap state
    ) {
        if (instance == null) {
            return;
        }

        com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
        ret.put(
                "status",
                state.getString(
                        com.mateusgomes.focusapp.wear.FocusWearContract.KEY_STATUS,
                        "idle"
                )
        );
        ret.put(
                "sessionType",
                state.getString(
                        com.mateusgomes.focusapp.wear.FocusWearContract.KEY_SESSION_TYPE,
                        "focus"
                )
        );
        ret.put(
                "remainingSeconds",
                state.getInt(
                        com.mateusgomes.focusapp.wear.FocusWearContract.KEY_REMAINING_SECONDS,
                        0
                )
        );
        ret.put(
                "endsAt",
                state.getLong(
                        com.mateusgomes.focusapp.wear.FocusWearContract.KEY_ENDS_AT,
                        0L
                )
        );
        ret.put(
                "version",
                state.getLong(
                        com.mateusgomes.focusapp.wear.FocusWearContract.KEY_VERSION,
                        0L
                )
        );
        instance.notifyListeners("onWearTimerState", ret);
    }

    @PluginMethod
    public void getFocusPulseStatus(PluginCall call) {
        android.content.SharedPreferences delivery =
                getContext().getSharedPreferences(
                        FocusWearDataLayer.DELIVERY_PREFERENCES,
                        android.content.Context.MODE_PRIVATE
                );

        long sentVersion = delivery.getLong(
                FocusWearDataLayer.KEY_LAST_SENT_VERSION,
                0L
        );
        long acknowledgedVersion = delivery.getLong(
                FocusWearDataLayer.KEY_LAST_ACK_VERSION,
                0L
        );
        String acknowledgedStatus = delivery.getString(
                FocusWearDataLayer.KEY_LAST_ACK_STATUS,
                ""
        );

        com.google.android.gms.wearable.Wearable
                .getCapabilityClient(getContext())
                .getCapability(
                        com.mateusgomes.focusapp.wear.FocusWearContract.CAPABILITY_WATCH,
                        com.google.android.gms.wearable.CapabilityClient.FILTER_REACHABLE
                )
                .addOnSuccessListener(capability -> {
                    com.getcapacitor.JSObject result =
                            new com.getcapacitor.JSObject();
                    boolean connected = !capability.getNodes().isEmpty();
                    result.put("connected", connected);
                    result.put("sentVersion", sentVersion);
                    result.put("acknowledgedVersion", acknowledgedVersion);
                    result.put(
                            "acknowledged",
                            sentVersion > 0L &&
                            acknowledgedVersion >= sentVersion
                    );
                    result.put(
                            "acknowledgedStatus",
                            acknowledgedStatus == null ? "" : acknowledgedStatus
                    );
                    if (connected && !capability.getNodes().isEmpty()) {
                        result.put(
                                "watchName",
                                capability.getNodes().iterator().next().getDisplayName()
                        );
                    }
                    call.resolve(result);
                })
                .addOnFailureListener(error ->
                        call.reject(
                                "Unable to check Focus Pulse connection",
                                error
                        )
                );
    }

    @PluginMethod
    public void retryFocusPulse(PluginCall call) {
        boolean retried =
                FocusWearDataLayer.retryLastTimerState(getContext());
        com.getcapacitor.JSObject result =
                new com.getcapacitor.JSObject();
        result.put("retried", retried);
        call.resolve(result);
    }

    @PluginMethod
    public void consumeWearTimerState(PluginCall call) {
        android.content.SharedPreferences preferences =
                getContext().getSharedPreferences(
                        "focus_wear_sync",
                        android.content.Context.MODE_PRIVATE
                );

        long version = preferences.getLong(
                com.mateusgomes.focusapp.wear.FocusWearContract.KEY_VERSION,
                0L
        );

        com.getcapacitor.JSObject result = new com.getcapacitor.JSObject();
        result.put("pending", version > 0L);

        if (version > 0L) {
            result.put(
                    "status",
                    preferences.getString(
                            com.mateusgomes.focusapp.wear.FocusWearContract.KEY_STATUS,
                            "idle"
                    )
            );
            result.put(
                    "sessionType",
                    preferences.getString(
                            com.mateusgomes.focusapp.wear.FocusWearContract.KEY_SESSION_TYPE,
                            "focus"
                    )
            );
            result.put(
                    "remainingSeconds",
                    preferences.getInt(
                            com.mateusgomes.focusapp.wear.FocusWearContract.KEY_REMAINING_SECONDS,
                            0
                    )
            );
            result.put(
                    "endsAt",
                    preferences.getLong(
                            com.mateusgomes.focusapp.wear.FocusWearContract.KEY_ENDS_AT,
                            0L
                    )
            );
            result.put("version", version);

            preferences.edit()
                    .remove(com.mateusgomes.focusapp.wear.FocusWearContract.KEY_VERSION)
                    .apply();
        }

        call.resolve(result);
    }

    @PluginMethod
    public void publishFocusPulseSnapshot(PluginCall call) {
        String snapshotJson = call.getString("snapshotJson", "{}");
        FocusWearDataLayer.publishFocusSnapshot(getContext(), snapshotJson);
        call.resolve();
    }

    @PluginMethod
    public void startService(PluginCall call) {

        Log.d(TAG, "startService() called");

        String title = call.getString("title", "Tempo de Foco");
        String body = call.getString("body", "Focando...");
        long endTime = call.getLong("endTime", 0L);
        int badgeLevel = call.getInt("badgeLevel", 0);
        String timerStatus = call.getString("status", "running");
        String sessionType = call.getString("sessionType", "focus");
        int durationSeconds = call.getInt("durationSeconds", Math.max(1, call.getInt("remainingSeconds", 0)));
        int remainingSeconds = call.getInt("remainingSeconds", 0);
        String taskId = call.getString("taskId", "");
        String taskName = call.getString("taskName", "");
        String projectId = call.getString("projectId", "");
        String projectName = call.getString("projectName", "");
        String focusHome = call.getString("focusHome", "");
        boolean syncToWear = call.getBoolean("syncToWear", false);

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

            android.content.SharedPreferences wearMode =
                    getContext().getSharedPreferences(
                            "focus_wear_mode",
                            android.content.Context.MODE_PRIVATE
                    );
            boolean wasWearActive =
                    wearMode.getBoolean("pulse_session_active", false);

            if (syncToWear) {
                FocusWearDataLayer.publishTimerState(
                        getContext(),
                        timerStatus,
                        sessionType,
                        durationSeconds,
                        remainingSeconds,
                        endTime,
                        title,
                        taskId,
                        taskName,
                        projectId,
                        projectName,
                        focusHome
                );
                wearMode.edit()
                        .putBoolean("pulse_session_active", true)
                        .apply();
            } else if (wasWearActive) {
                FocusWearDataLayer.publishIdleTimer(getContext());
                wearMode.edit()
                        .putBoolean("pulse_session_active", false)
                        .apply();
            }

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

        android.content.SharedPreferences wearMode =
                getContext().getSharedPreferences(
                        "focus_wear_mode",
                        android.content.Context.MODE_PRIVATE
                );
        if (wearMode.getBoolean("pulse_session_active", false)) {
            FocusWearDataLayer.publishIdleTimer(getContext());
            wearMode.edit()
                    .putBoolean("pulse_session_active", false)
                    .apply();
        }

        call.resolve();
    }
}
