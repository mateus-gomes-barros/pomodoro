package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class SmallStreakWidgetProvider extends AppWidgetProvider {

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
                R.layout.widget_small_streak
            );

        WidgetLanguage.applyStaticLabels(context, views);

        int streak = 0;

        try {
            JSONObject data =
                new JSONObject(payload);

            streak =
                data.optInt(
                    "currentStreak",
                    0
                );
        } catch (Exception ignored) {}

        views.setTextViewText(
            R.id.small_streak_badge,
            getBadge(streak)
        );

        views.setTextViewText(
            R.id.small_streak_value,
            String.valueOf(streak)
        );

        views.setTextViewText(
            R.id.small_streak_label,
            WidgetLanguage.isPt(context)
                ? "dias de ofensiva"
                : "day streak"
        );

        Intent openApp =
            WidgetNavigation.intent(context, "/streaks");

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                60,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.small_streak_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }

    private String getBadge(int streak) {
        if (streak >= 2000) return "♾️";
        if (streak >= 1500) return "🏆";
        if (streak >= 1000) return "👑";
        if (streak >= 750) return "🔮";
        if (streak >= 600) return "💎";
        if (streak >= 500) return "🥇";
        if (streak >= 365) return "🥈";
        if (streak >= 300) return "🥉";
        if (streak >= 200) return "🏅";
        if (streak >= 150) return "🌟";
        if (streak >= 100) return "⭐";
        if (streak >= 75) return "🌙";
        if (streak >= 50) return "🚀";
        if (streak >= 30) return "⚡";
        if (streak >= 14) return "❤️‍🔥";
        if (streak >= 7) return "🔥";
        if (streak >= 3) return "🌱";
        return "💧";
    }
}
