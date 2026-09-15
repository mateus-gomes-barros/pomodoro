package com.mateusgomes.focusapp.wear;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;

import java.util.UUID;

public final class FocusWearDataLayer {
    private static final String TAG = "FocusWearDataLayer";
    public static final String DELIVERY_PREFERENCES = "focus_wear_delivery";
    public static final String KEY_LAST_SENT_VERSION = "last_sent_version";
    public static final String KEY_LAST_ACK_VERSION = "last_ack_version";
    public static final String KEY_LAST_ACK_STATUS = "last_ack_status";

    private FocusWearDataLayer() {}

    public static void publishRunningTimer(
            Context context,
            String title,
            long endTime,
            String focusHome
    ) {
        long now = System.currentTimeMillis();
        int remainingSeconds = (int) Math.max(0L, (endTime - now + 999L) / 1000L);
        publishTimerState(
                context,
                "running",
                inferSessionType(title),
                remainingSeconds,
                remainingSeconds,
                endTime,
                title,
                "",
                title,
                "",
                "",
                focusHome
        );
    }

    public static void publishIdleTimer(Context context) {
        publishTimerState(
                context, "idle", "focus", 1, 0, 0L,
                "", "", "", "", "", ""
        );
    }

    public static void publishTimerState(
            Context context,
            String status,
            String sessionType,
            int durationSeconds,
            int remainingSeconds,
            long endTime,
            String title,
            String taskId,
            String taskName,
            String projectId,
            String projectName,
            String focusHome
    ) {
        SharedPreferences delivery = context.getSharedPreferences(
                DELIVERY_PREFERENCES,
                Context.MODE_PRIVATE
        );
        long now = System.currentTimeMillis();
        long lastVersion = delivery.getLong(KEY_LAST_SENT_VERSION, 0L);
        long version = Math.max(now, lastVersion + 1L);
        int safeDuration = Math.max(1, durationSeconds);
        int safeRemaining = Math.max(0, remainingSeconds);
        String safeStatus = status == null ? "idle" : status;
        String safeSessionType =
                sessionType == null ? inferSessionType(title) : sessionType;
        String sessionId = delivery.getString(FocusWearContract.KEY_SESSION_ID, "");
        if (sessionId == null || sessionId.isEmpty()) {
            sessionId = UUID.randomUUID().toString();
        }

        PutDataMapRequest request =
                PutDataMapRequest.create(FocusWearContract.TIMER_STATE_PATH);
        request.getDataMap().putString(FocusWearContract.KEY_SESSION_ID, sessionId);
        request.getDataMap().putString(FocusWearContract.KEY_STATUS, safeStatus);
        request.getDataMap().putString(FocusWearContract.KEY_SESSION_TYPE, safeSessionType);
        request.getDataMap().putLong(FocusWearContract.KEY_STARTED_AT, now);
        request.getDataMap().putLong(FocusWearContract.KEY_ENDS_AT, endTime);
        request.getDataMap().putInt(FocusWearContract.KEY_DURATION_SECONDS, safeDuration);
        request.getDataMap().putInt(FocusWearContract.KEY_REMAINING_SECONDS, safeRemaining);
        request.getDataMap().putString(
                FocusWearContract.KEY_TASK_ID,
                taskId == null ? "" : taskId
        );
        request.getDataMap().putString(
                FocusWearContract.KEY_TASK_NAME,
                taskName == null ? "" : taskName
        );
        request.getDataMap().putString(
                FocusWearContract.KEY_PROJECT_ID,
                projectId == null ? "" : projectId
        );
        request.getDataMap().putString(
                FocusWearContract.KEY_PROJECT_NAME,
                projectName == null ? "" : projectName
        );
        request.getDataMap().putString(
                FocusWearContract.KEY_FOCUS_HOME,
                focusHome == null ? "" : focusHome
        );
        request.getDataMap().putString(
                FocusWearContract.KEY_SOURCE_DEVICE,
                FocusWearContract.SOURCE_PHONE
        );
        request.getDataMap().putLong(FocusWearContract.KEY_VERSION, version);
        request.getDataMap().putLong(FocusWearContract.KEY_UPDATED_AT, now);

        delivery.edit()
                .putString(FocusWearContract.KEY_SESSION_ID, sessionId)
                .putString(FocusWearContract.KEY_STATUS, safeStatus)
                .putString(FocusWearContract.KEY_SESSION_TYPE, safeSessionType)
                .putInt(FocusWearContract.KEY_DURATION_SECONDS, safeDuration)
                .putInt(FocusWearContract.KEY_REMAINING_SECONDS, safeRemaining)
                .putLong(FocusWearContract.KEY_ENDS_AT, endTime)
                .putString(FocusWearContract.KEY_TASK_ID, taskId == null ? "" : taskId)
                .putString(FocusWearContract.KEY_TASK_NAME, taskName == null ? "" : taskName)
                .putString(FocusWearContract.KEY_PROJECT_ID, projectId == null ? "" : projectId)
                .putString(FocusWearContract.KEY_PROJECT_NAME, projectName == null ? "" : projectName)
                .putString(FocusWearContract.KEY_FOCUS_HOME, focusHome == null ? "" : focusHome)
                .putLong(KEY_LAST_SENT_VERSION, version)
                .apply();

        Wearable.getDataClient(context)
                .putDataItem(request.asPutDataRequest().setUrgent())
                .addOnFailureListener(error ->
                        Log.e(TAG, "Unable to publish timer state", error)
                );
    }

    public static boolean retryLastTimerState(Context context) {
        SharedPreferences delivery = context.getSharedPreferences(
                DELIVERY_PREFERENCES,
                Context.MODE_PRIVATE
        );
        String status = delivery.getString(FocusWearContract.KEY_STATUS, "");
        if (status == null || status.isEmpty()) {
            return false;
        }
        publishTimerState(
                context,
                status,
                delivery.getString(FocusWearContract.KEY_SESSION_TYPE, "focus"),
                delivery.getInt(FocusWearContract.KEY_DURATION_SECONDS, 1),
                delivery.getInt(FocusWearContract.KEY_REMAINING_SECONDS, 0),
                delivery.getLong(FocusWearContract.KEY_ENDS_AT, 0L),
                delivery.getString(FocusWearContract.KEY_TASK_NAME, ""),
                delivery.getString(FocusWearContract.KEY_TASK_ID, ""),
                delivery.getString(FocusWearContract.KEY_TASK_NAME, ""),
                delivery.getString(FocusWearContract.KEY_PROJECT_ID, ""),
                delivery.getString(FocusWearContract.KEY_PROJECT_NAME, ""),
                delivery.getString(FocusWearContract.KEY_FOCUS_HOME, "")
        );
        return true;
    }

    private static String inferSessionType(String title) {
        if (title == null) return "focus";
        String normalized = title.toLowerCase();
        if (normalized.contains("longa") || normalized.contains("long")) {
            return "long_break";
        }
        if (normalized.contains("pausa") || normalized.contains("break")) {
            return "short_break";
        }
        return "focus";
    }
}
