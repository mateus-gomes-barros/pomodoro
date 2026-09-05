package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class MediumWeekWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(
        Context context,
        AppWidgetManager manager,
        int[] appWidgetIds
    ) {
        for (int id : appWidgetIds) {
            updateWidget(context, manager, id);
        }
    }

    private void updateWidget(
        Context context,
        AppWidgetManager manager,
        int appWidgetId
    ) {
        String payload =
            context.getSharedPreferences(
                "focus_widgets",
                Context.MODE_PRIVATE
            ).getString(
                "weekly_activity_snapshot",
                "{}"
            );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_medium_week
            );

        WidgetLanguage.applyStaticLabels(context, views);

        try {
            JSONObject data =
                new JSONObject(payload);

            int total =
                data.optInt(
                    "totalFocusMinutes",
                    0
                );

            int streak =
                data.optInt(
                    "currentStreak",
                    0
                );

            views.setTextViewText(
                R.id.medium_week_total,
                formatMinutes(total)
            );

            views.setTextViewText(
                R.id.medium_week_streak,
                "🔥 " + streak
            );

            JSONArray days =
                data.optJSONArray("days");

            int[] ids = {
                R.id.medium_week_day_1,
                R.id.medium_week_day_2,
                R.id.medium_week_day_3,
                R.id.medium_week_day_4,
                R.id.medium_week_day_5,
                R.id.medium_week_day_6,
                R.id.medium_week_day_7
            };

            for (int i = 0; i < ids.length; i++) {
                String marker = "○";

                if (
                    days != null &&
                    i < days.length()
                ) {
                    JSONObject day =
                        days.optJSONObject(i);

                    if (day != null) {
                        if (
                            day.optBoolean(
                                "isToday",
                                false
                            )
                        ) {
                            marker = "◉";
                        } else if (
                            day.optInt(
                                "focusMinutes",
                                0
                            ) > 0
                        ) {
                            marker = "●";
                        }
                    }
                }

                views.setTextViewText(
                    ids[i],
                    marker
                );
            }

        } catch (Exception ignored) {}

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                90,
                new Intent(
                    context,
                    MainActivity.class
                ),
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.medium_week_root,
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
        int hours = totalMinutes / 60;
        int minutes = totalMinutes % 60;

        return hours > 0
            ? hours + "h " + minutes + "m"
            : minutes + "m";
    }
}
