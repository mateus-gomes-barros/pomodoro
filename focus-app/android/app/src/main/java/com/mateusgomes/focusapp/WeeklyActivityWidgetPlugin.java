package com.mateusgomes.focusapp;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WeeklyActivityWidgetBridge")
public class WeeklyActivityWidgetPlugin extends Plugin {

    private void updateProvider(
        AppWidgetManager manager,
        Class<?> providerClass
    ) {
        ComponentName component =
            new ComponentName(
                getContext(),
                providerClass
            );

        int[] ids =
            manager.getAppWidgetIds(component);

        if (ids.length == 0) {
            return;
        }

        Intent intent =
            new Intent(
                getContext(),
                providerClass
            );

        intent.setAction(
            AppWidgetManager.ACTION_APPWIDGET_UPDATE
        );

        intent.putExtra(
            AppWidgetManager.EXTRA_APPWIDGET_IDS,
            ids
        );

        getContext().sendBroadcast(intent);
    }


    @PluginMethod
    public void saveSnapshot(PluginCall call) {
        String payload = call.getString("payload", "{}");

        getContext()
            .getSharedPreferences("focus_widgets", Context.MODE_PRIVATE)
            .edit()
            .putString("weekly_activity_snapshot", payload)
            .apply();

        AppWidgetManager manager =
            AppWidgetManager.getInstance(getContext());

        updateProvider(
            manager,
            WeeklyActivityWidgetProvider.class
        );

        updateProvider(
            manager,
            SmallStreakWidgetProvider.class
        );

        updateProvider(
            manager,
            SmallTodayFocusWidgetProvider.class
        );

        updateProvider(
            manager,
            MediumWeekWidgetProvider.class
        );

        JSObject result = new JSObject();
        result.put("saved", true);
        call.resolve(result);
    }
}
