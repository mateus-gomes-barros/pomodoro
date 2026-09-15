package com.mateusgomes.focusapp.wear;

import android.content.Context;
import android.util.Log;

import com.google.android.gms.wearable.PutDataMapRequest;
import com.google.android.gms.wearable.Wearable;

import java.util.UUID;

public final class FocusWearDataLayer {
    private static final String TAG = "FocusWearDataLayer";

    private FocusWearDataLayer() {}

    public static void publishRunningTimer(
            Context context,
            String title,
            long endTime,
            String focusHome
    ) {
        long now = System.currentTimeMillis();
        int remainingSeconds = (int) Math.max(0L, (endTime - now + 999L) / 1000L);
        PutDataMapRequest request = PutDataMapRequest.create(FocusWearContract.TIMER_STATE_PATH);
        request.getDataMap().putString(FocusWearContract.KEY_SESSION_ID, UUID.randomUUID().toString());
        request.getDataMap().putString(FocusWearContract.KEY_STATUS, "running");
        request.getDataMap().putString(FocusWearContract.KEY_SESSION_TYPE, inferSessionType(title));
        request.getDataMap().putLong(FocusWearContract.KEY_STARTED_AT, now);
        request.getDataMap().putLong(FocusWearContract.KEY_ENDS_AT, endTime);
        request.getDataMap().putInt(FocusWearContract.KEY_DURATION_SECONDS, remainingSeconds);
        request.getDataMap().putInt(FocusWearContract.KEY_REMAINING_SECONDS, remainingSeconds);
        request.getDataMap().putString(FocusWearContract.KEY_TASK_ID, "");
        request.getDataMap().putString(FocusWearContract.KEY_TASK_NAME, title == null ? "" : title);
        request.getDataMap().putString(FocusWearContract.KEY_PROJECT_ID, "");
        request.getDataMap().putString(FocusWearContract.KEY_PROJECT_NAME, "");
        request.getDataMap().putString(FocusWearContract.KEY_FOCUS_HOME, focusHome == null ? "" : focusHome);
        request.getDataMap().putString(FocusWearContract.KEY_SOURCE_DEVICE, FocusWearContract.SOURCE_PHONE);
        request.getDataMap().putLong(FocusWearContract.KEY_VERSION, now);
        request.getDataMap().putLong(FocusWearContract.KEY_UPDATED_AT, now);

        Wearable.getDataClient(context)
                .putDataItem(request.asPutDataRequest().setUrgent())
                .addOnFailureListener(error -> Log.e(TAG, "Unable to publish timer", error));
    }

    public static void publishIdleTimer(Context context) {
        long now = System.currentTimeMillis();
        PutDataMapRequest request = PutDataMapRequest.create(FocusWearContract.TIMER_STATE_PATH);
        request.getDataMap().putString(FocusWearContract.KEY_SESSION_ID, "");
        request.getDataMap().putString(FocusWearContract.KEY_STATUS, "idle");
        request.getDataMap().putString(FocusWearContract.KEY_SESSION_TYPE, "focus");
        request.getDataMap().putLong(FocusWearContract.KEY_STARTED_AT, 0L);
        request.getDataMap().putLong(FocusWearContract.KEY_ENDS_AT, 0L);
        request.getDataMap().putInt(FocusWearContract.KEY_DURATION_SECONDS, 0);
        request.getDataMap().putInt(FocusWearContract.KEY_REMAINING_SECONDS, 0);
        request.getDataMap().putString(FocusWearContract.KEY_SOURCE_DEVICE, FocusWearContract.SOURCE_PHONE);
        request.getDataMap().putLong(FocusWearContract.KEY_VERSION, now);
        request.getDataMap().putLong(FocusWearContract.KEY_UPDATED_AT, now);

        Wearable.getDataClient(context)
                .putDataItem(request.asPutDataRequest().setUrgent())
                .addOnFailureListener(error -> Log.e(TAG, "Unable to clear timer", error));
    }

    private static String inferSessionType(String title) {
        if (title == null) return "focus";
        String normalized = title.toLowerCase();
        if (normalized.contains("longa") || normalized.contains("long")) return "long_break";
        if (normalized.contains("pausa") || normalized.contains("break")) return "short_break";
        return "focus";
    }
}
