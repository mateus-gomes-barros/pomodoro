package com.mateusgomes.focusapp.wear;

import android.content.Intent;

import com.google.android.gms.wearable.DataEvent;
import com.google.android.gms.wearable.DataEventBuffer;
import com.google.android.gms.wearable.DataMap;
import com.google.android.gms.wearable.DataMapItem;
import com.google.android.gms.wearable.WearableListenerService;

public class FocusWearListenerService extends WearableListenerService {
    public static final String ACTION_TIMER_STATE_CHANGED =
            "com.mateusgomes.focusapp.wear.TIMER_STATE_CHANGED";
    private static final String PREFERENCES = "focus_wear_sync";

    @Override
    public void onDataChanged(DataEventBuffer events) {
        for (DataEvent event : events) {
            if (event.getType() != DataEvent.TYPE_CHANGED) continue;
            if (!FocusWearContract.TIMER_STATE_PATH.equals(event.getDataItem().getUri().getPath())) continue;

            DataMap state = DataMapItem.fromDataItem(event.getDataItem()).getDataMap();
            if (FocusWearContract.SOURCE_PHONE.equals(
                    state.getString(FocusWearContract.KEY_SOURCE_DEVICE, "")
            )) continue;

            getSharedPreferences(PREFERENCES, MODE_PRIVATE)
                    .edit()
                    .putString(FocusWearContract.KEY_SESSION_ID, state.getString(FocusWearContract.KEY_SESSION_ID, ""))
                    .putString(FocusWearContract.KEY_STATUS, state.getString(FocusWearContract.KEY_STATUS, "idle"))
                    .putString(FocusWearContract.KEY_SESSION_TYPE, state.getString(FocusWearContract.KEY_SESSION_TYPE, "focus"))
                    .putLong(FocusWearContract.KEY_ENDS_AT, state.getLong(FocusWearContract.KEY_ENDS_AT, 0L))
                    .putInt(FocusWearContract.KEY_DURATION_SECONDS, state.getInt(FocusWearContract.KEY_DURATION_SECONDS, 0))
                    .putInt(FocusWearContract.KEY_REMAINING_SECONDS, state.getInt(FocusWearContract.KEY_REMAINING_SECONDS, 0))
                    .putLong(FocusWearContract.KEY_VERSION, state.getLong(FocusWearContract.KEY_VERSION, 0L))
                    .putLong(FocusWearContract.KEY_UPDATED_AT, state.getLong(FocusWearContract.KEY_UPDATED_AT, 0L))
                    .apply();

            sendBroadcast(new Intent(ACTION_TIMER_STATE_CHANGED).setPackage(getPackageName()));
        }
    }
}
