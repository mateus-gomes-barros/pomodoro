package com.mateusgomes.focusapp.wear;

import android.content.Intent;
import android.content.SharedPreferences;

import com.mateusgomes.focusapp.PomodoroServicePlugin;
import com.google.android.gms.wearable.DataEvent;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.DataMap;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.WearableListenerService;

public class FocusWearListenerService extends WearableListenerService {
    public static final String ACTION_TIMER_STATE_CHANGED =
            "com.mateusgomes.focusapp.wear.TIMER_STATE_CHANGED";
    private static final String PREFERENCES = "focus_wear_sync";
    private static final String KEY_LAST_RECEIVED_VERSION =
            "last_received_watch_version";

    @Override
    public void onDataChanged(DataEventBuffer events) {
        for (DataEvent event : events) {
            if (event.getType() != DataEvent.TYPE_CHANGED) {
                continue;
            }

            String path = event.getDataItem().getUri().getPath();
            DataMap data = DataMapItem.fromDataItem(event.getDataItem()).getDataMap();

            if (FocusWearContract.TIMER_ACK_PATH.equals(path)) {
                receiveAcknowledgement(data);
            } else if (FocusWearContract.TIMER_STATE_PATH.equals(path)) {
                receiveWatchState(data);
            } else if (FocusWearContract.ACTION_PATH.equals(path)) {
                PomodoroServicePlugin.onWearActionReceived(
                        data.getString(FocusWearContract.KEY_ACTION_JSON, "{}")
                );
            }
        }
    }

    private void receiveAcknowledgement(DataMap acknowledgement) {
        if (!FocusWearContract.SOURCE_WATCH.equals(
                acknowledgement.getString(
                        FocusWearContract.KEY_SOURCE_DEVICE,
                        ""
                )
        )) {
            return;
        }

        long acknowledgedVersion = acknowledgement.getLong(
                FocusWearContract.KEY_ACK_VERSION,
                0L
        );
        SharedPreferences delivery = getSharedPreferences(
                FocusWearDataLayer.DELIVERY_PREFERENCES,
                MODE_PRIVATE
        );
        long currentAcknowledgement = delivery.getLong(
                FocusWearDataLayer.KEY_LAST_ACK_VERSION,
                0L
        );
        if (acknowledgedVersion < currentAcknowledgement) {
            return;
        }

        delivery.edit()
                .putLong(
                        FocusWearDataLayer.KEY_LAST_ACK_VERSION,
                        acknowledgedVersion
                )
                .putString(
                        FocusWearDataLayer.KEY_LAST_ACK_STATUS,
                        acknowledgement.getString(
                                FocusWearContract.KEY_ACK_STATUS,
                                ""
                        )
                )
                .apply();
    }

    private void receiveWatchState(DataMap state) {
        if (FocusWearContract.SOURCE_PHONE.equals(
                state.getString(FocusWearContract.KEY_SOURCE_DEVICE, "")
        )) {
            return;
        }

        SharedPreferences preferences =
                getSharedPreferences(PREFERENCES, MODE_PRIVATE);
        long incomingVersion = state.getLong(
                FocusWearContract.KEY_VERSION,
                0L
        );
        long lastReceivedVersion = preferences.getLong(
                KEY_LAST_RECEIVED_VERSION,
                0L
        );
        if (incomingVersion <= lastReceivedVersion) {
            return;
        }

        preferences.edit()
                .putString(FocusWearContract.KEY_SESSION_ID, state.getString(FocusWearContract.KEY_SESSION_ID, ""))
                .putString(FocusWearContract.KEY_STATUS, state.getString(FocusWearContract.KEY_STATUS, "idle"))
                .putString(FocusWearContract.KEY_SESSION_TYPE, state.getString(FocusWearContract.KEY_SESSION_TYPE, "focus"))
                .putLong(FocusWearContract.KEY_ENDS_AT, state.getLong(FocusWearContract.KEY_ENDS_AT, 0L))
                .putInt(FocusWearContract.KEY_DURATION_SECONDS, state.getInt(FocusWearContract.KEY_DURATION_SECONDS, 0))
                .putInt(FocusWearContract.KEY_REMAINING_SECONDS, state.getInt(FocusWearContract.KEY_REMAINING_SECONDS, 0))
                .putLong(FocusWearContract.KEY_VERSION, incomingVersion)
                .putLong(FocusWearContract.KEY_UPDATED_AT, state.getLong(FocusWearContract.KEY_UPDATED_AT, 0L))
                .putLong(KEY_LAST_RECEIVED_VERSION, incomingVersion)
                .apply();

        PomodoroServicePlugin.onWearTimerStateReceived(state);
        sendBroadcast(
                new Intent(ACTION_TIMER_STATE_CHANGED)
                        .setPackage(getPackageName())
        );
    }
}
