package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class WeeklyActivityWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(
        Context context,
        AppWidgetManager appWidgetManager,
        int[] appWidgetIds
    ) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(
                context,
                appWidgetManager,
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
                R.layout.widget_weekly_activity
            );

        try {
            JSONObject data =
                new JSONObject(payload);

            int streak =
                data.optInt(
                    "currentStreak",
                    0
                );

            int totalMinutes =
                data.optInt(
                    "totalFocusMinutes",
                    0
                );

            int hours =
                totalMinutes / 60;

            int minutes =
                totalMinutes % 60;

            views.setTextViewText(
                R.id.widget_streak,
                "🔥 " + streak + " day streak"
            );

            views.setTextViewText(
                R.id.widget_total,
                hours > 0
                    ? hours + "h " + minutes + "m focused"
                    : minutes + "m focused"
            );

            JSONArray days =
                data.optJSONArray("days");

            int[] dayIds = {
                R.id.day_1,
                R.id.day_2,
                R.id.day_3,
                R.id.day_4,
                R.id.day_5,
                R.id.day_6,
                R.id.day_7
            };

            if (days != null) {
                for (
                    int i = 0;
                    i < Math.min(
                        days.length(),
                        dayIds.length
                    );
                    i++
                ) {
                    JSONObject day =
                        days.optJSONObject(i);

                    int focusMinutes =
                        day != null
                            ? day.optInt(
                                "focusMinutes",
                                0
                            )
                            : 0;

                    boolean isToday =
                        day != null &&
                        day.optBoolean(
                            "isToday",
                            false
                        );

                    String marker =
                        focusMinutes > 0
                            ? "●"
                            : "○";

                    if (isToday) {
                        marker = "◉";
                    }

                    views.setTextViewText(
                        dayIds[i],
                        marker
                    );
                }
            }
        } catch (Exception ignored) {
            views.setTextViewText(
                R.id.widget_streak,
                "🔥 0 day streak"
            );

            views.setTextViewText(
                R.id.widget_total,
                "0m focused"
            );
        }

        Intent openApp =
            new Intent(
                context,
                MainActivity.class
            );

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                0,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.widget_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }
}
