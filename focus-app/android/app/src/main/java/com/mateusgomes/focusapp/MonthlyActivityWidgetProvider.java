package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class MonthlyActivityWidgetProvider extends AppWidgetProvider {

    private static final int[] DAY_IDS = {
        R.id.month_day_1,
        R.id.month_day_2,
        R.id.month_day_3,
        R.id.month_day_4,
        R.id.month_day_5,
        R.id.month_day_6,
        R.id.month_day_7,
        R.id.month_day_8,
        R.id.month_day_9,
        R.id.month_day_10,
        R.id.month_day_11,
        R.id.month_day_12,
        R.id.month_day_13,
        R.id.month_day_14,
        R.id.month_day_15,
        R.id.month_day_16,
        R.id.month_day_17,
        R.id.month_day_18,
        R.id.month_day_19,
        R.id.month_day_20,
        R.id.month_day_21,
        R.id.month_day_22,
        R.id.month_day_23,
        R.id.month_day_24,
        R.id.month_day_25,
        R.id.month_day_26,
        R.id.month_day_27,
        R.id.month_day_28,
        R.id.month_day_29,
        R.id.month_day_30,
        R.id.month_day_31
    };

    @Override
    public void onUpdate(
        Context context,
        AppWidgetManager manager,
        int[] appWidgetIds
    ) {
        for (
            int appWidgetId :
            appWidgetIds
        ) {
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
                    "monthly_activity_snapshot",
                    "{}"
                );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_monthly_activity
            );

        WidgetLanguage.applyStaticLabels(context, views);

        resetDays(views);

        try {
            JSONObject data =
                new JSONObject(
                    payload
                );

            String monthTitle =
                data.optString(
                    "monthTitle",
                    WidgetLanguage.text(context, "monthlyActivity")
                );

            int longestStreak =
                data.optInt(
                    "longestStreak",
                    0
                );

            views.setTextViewText(
                R.id.month_widget_title,
                monthTitle
            );

            views.setTextViewText(
                R.id.month_widget_streak,
                WidgetLanguage.bestStreak(context, longestStreak)
            );

            JSONArray days =
                data.optJSONArray(
                    "days"
                );

            if (days != null) {

                for (
                    int i = 0;
                    i < Math.min(
                        days.length(),
                        DAY_IDS.length
                    );
                    i++
                ) {
                    JSONObject day =
                        days.optJSONObject(
                            i
                        );

                    if (day == null) {
                        continue;
                    }

                    int focusMinutes =
                        day.optInt(
                            "focusMinutes",
                            0
                        );

                    int color =
                        getColorForMinutes(
                            focusMinutes
                        );

                    views.setTextColor(
                        DAY_IDS[i],
                        color
                    );

                    views.setTextViewText(
                        DAY_IDS[i],
                        focusMinutes > 0
                            ? "●"
                            : "•"
                    );
                }
            }

        } catch (
            Exception ignored
        ) {
            views.setTextViewText(
                R.id.month_widget_title,
                WidgetLanguage.text(context, "monthlyActivity")
            );

            views.setTextViewText(
                R.id.month_widget_streak,
                WidgetLanguage.bestStreak(context, 0)
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
                20,
                openApp,
                PendingIntent
                    .FLAG_UPDATE_CURRENT |
                PendingIntent
                    .FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.month_widget_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }

    private void resetDays(
        RemoteViews views
    ) {
        for (
            int id :
            DAY_IDS
        ) {
            views.setTextViewText(
                id,
                "•"
            );

            views.setTextColor(
                id,
                Color.rgb(
                    63,
                    63,
                    70
                )
            );
        }
    }

    private int getColorForMinutes(
        int minutes
    ) {
        if (minutes <= 0) {
            return Color.rgb(
                63,
                63,
                70
            );
        }

        if (minutes < 30) {
            return Color.rgb(
                6,
                95,
                70
            );
        }

        if (minutes < 60) {
            return Color.rgb(
                5,
                150,
                105
            );
        }

        if (minutes < 120) {
            return Color.rgb(
                16,
                185,
                129
            );
        }

        return Color.rgb(
            52,
            211,
            153
        );
    }
}
