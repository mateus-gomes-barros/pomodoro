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

@CapacitorPlugin(name = "GoalsWidget")
public class GoalsWidgetPlugin extends Plugin {

    @PluginMethod
    public void saveSnapshot(PluginCall call) {
        String payload = call.getString("payload", "{}");

        getContext()
            .getSharedPreferences(
                "focus_widgets",
                Context.MODE_PRIVATE
            )
            .edit()
            .putString(
                "goals_snapshot",
                payload
            )
            .apply();

        AppWidgetManager manager =
            AppWidgetManager.getInstance(
                getContext()
            );

        ComponentName component =
            new ComponentName(
                getContext(),
                GoalsWidgetProvider.class
            );

        int[] ids =
            manager.getAppWidgetIds(
                component
            );

        Intent intent =
            new Intent(
                getContext(),
                GoalsWidgetProvider.class
            );

        intent.setAction(
            AppWidgetManager.ACTION_APPWIDGET_UPDATE
        );

        intent.putExtra(
            AppWidgetManager.EXTRA_APPWIDGET_IDS,
            ids
        );

        getContext().sendBroadcast(
            intent
        );

        JSObject result =
            new JSObject();

        result.put("saved", true);

        call.resolve(result);
    }

    @PluginMethod
    public void getPendingCompletions(PluginCall call) {
        JSObject result =
            new JSObject();

        result.put(
            "goalIDs",
            new org.json.JSONArray()
        );

        call.resolve(result);
    }

    @PluginMethod
    public void removePendingCompletions(PluginCall call) {
        JSObject result =
            new JSObject();

        result.put(
            "removed",
            true
        );

        call.resolve(result);
    }
}
