package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class SmallTodayFocusWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(
        Context context,
        AppWidgetManager manager,
        int[] appWidgetIds
    ) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(
                context,
                manager,
                appWidgetId
            );
        }
    }

    private void updateWidget(
        Context context,
        AppWidgetManager manager,
        int appWidgetId
    ) {
        String payload =
            context
                .getSharedPreferences(
                    "focus_widgets",
                    Context.MODE_PRIVATE
                )
                .getString(
                    "weekly_activity_snapshot",
                    "{}"
                );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_small_today_focus
            );

        WidgetLanguage.applyStaticLabels(context, views);

        int todayMinutes = 0;

        try {
            JSONObject data =
                new JSONObject(payload);

            JSONArray days =
                data.optJSONArray("days");

            if (days != null) {
                for (int i = 0; i < days.length(); i++) {
                    JSONObject day =
                        days.optJSONObject(i);

                    if (
                        day != null &&
                        day.optBoolean(
                            "isToday",
                            false
                        )
                    ) {
                        todayMinutes =
                            day.optInt(
                                "focusMinutes",
                                0
                            );
                        break;
                    }
                }
            }
        } catch (Exception ignored) {}

        views.setTextViewText(
            R.id.today_focus_value,
            formatMinutes(todayMinutes)
        );

        views.setTextViewText(
            R.id.today_focus_subtitle,
            WidgetLanguage.text(context, "focusedToday")
        );

        Intent openApp =
            WidgetNavigation.intent(context, "/timer");

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                70,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.today_focus_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }

    private String formatMinutes(
        int totalMinutes
    ) {
        int hours =
            totalMinutes / 60;

        int minutes =
            totalMinutes % 60;

        if (hours > 0) {
            return hours + "h " + minutes + "m";
        }

        return minutes + "m";
    }
}
