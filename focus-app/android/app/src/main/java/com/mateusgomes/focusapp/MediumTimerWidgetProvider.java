package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.os.SystemClock;
import android.view.View;
import android.widget.RemoteViews;

public class MediumTimerWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(
        Context context,
        AppWidgetManager manager,
        int[] appWidgetIds
    ) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, manager, appWidgetId);
        }
    }

    public static void updateAll(Context context) {
        AppWidgetManager manager =
            AppWidgetManager.getInstance(context);

        android.content.ComponentName component =
            new android.content.ComponentName(
                context,
                MediumTimerWidgetProvider.class
            );

        int[] ids =
            manager.getAppWidgetIds(component);

        for (int id : ids) {
            updateWidget(context, manager, id);
        }
    }

    private static int badgeResource(
        int badgeLevel
    ) {
        if (badgeLevel >= 2000) return R.drawable.ic_badge_infinity;
        if (badgeLevel >= 1500) return R.drawable.ic_badge_trophy;
        if (badgeLevel >= 1000) return R.drawable.ic_badge_crown;
        if (badgeLevel >= 750) return R.drawable.ic_badge_crystal;
        if (badgeLevel >= 600) return R.drawable.ic_badge_diamond;
        if (badgeLevel >= 200) return R.drawable.ic_badge_medal;
        if (badgeLevel >= 100) return R.drawable.ic_badge_star;
        if (badgeLevel >= 75) return R.drawable.ic_badge_moon;
        if (badgeLevel >= 50) return R.drawable.ic_badge_rocket;
        if (badgeLevel >= 30) return R.drawable.ic_badge_bolt;
        if (badgeLevel >= 14) return R.drawable.ic_badge_heart;
        if (badgeLevel >= 7) return R.drawable.ic_badge_fire;
        if (badgeLevel >= 3) return R.drawable.ic_badge_sprout;
        return R.drawable.ic_badge_drop;
    }

    private static void updateWidget(
        Context context,
        AppWidgetManager manager,
        int appWidgetId
    ) {
        android.content.SharedPreferences prefs =
            context.getSharedPreferences(
                "focus_widgets",
                Context.MODE_PRIVATE
            );

        String title =
            prefs.getString(
                "timer_widget_title",
                WidgetLanguage.focusTitle(context)
            );

        String body =
            prefs.getString(
                "timer_widget_body",
                ""
            );

        int badgeLevel =
            prefs.getInt(
                "timer_widget_badge_level",
                0
            );

        long endTime =
            prefs.getLong(
                "timer_widget_end_time",
                0L
            );

        boolean running =
            prefs.getBoolean(
                "timer_widget_running",
                false
            );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_medium_timer
            );

        WidgetLanguage.applyStaticLabels(context, views);

        views.setImageViewResource(
            R.id.medium_timer_badge,
            badgeResource(badgeLevel)
        );

        views.setTextViewText(
            R.id.medium_timer_title,
            title == null || title.isEmpty()
                ? WidgetLanguage.focusTitle(context) : title
        );

        if (
            body != null &&
            !body.isEmpty()
        ) {
            views.setViewVisibility(
                R.id.medium_timer_body,
                View.VISIBLE
            );

            views.setTextViewText(
                R.id.medium_timer_body,
                body
            );
        } else {
            views.setViewVisibility(
                R.id.medium_timer_body,
                View.GONE
            );
        }

        long now =
            System.currentTimeMillis();

        if (
            running &&
            endTime > now
        ) {
            long remaining =
                endTime - now;

            long chronometerBase =
                SystemClock.elapsedRealtime() +
                remaining;

            views.setViewVisibility(
                R.id.medium_timer_chronometer,
                View.VISIBLE
            );

            views.setViewVisibility(
                R.id.medium_timer_ready,
                View.GONE
            );

            views.setChronometer(
                R.id.medium_timer_chronometer,
                chronometerBase,
                null,
                true
            );

            views.setChronometerCountDown(
                R.id.medium_timer_chronometer,
                true
            );

            views.setTextViewText(
                R.id.medium_timer_status,
                WidgetLanguage.text(context, "focusing")
            );

        } else {
            views.setViewVisibility(
                R.id.medium_timer_chronometer,
                View.GONE
            );

            views.setViewVisibility(
                R.id.medium_timer_ready,
                View.VISIBLE
            );

            views.setTextViewText(
                R.id.medium_timer_ready,
                "Ready"
            );

            views.setTextViewText(
                R.id.medium_timer_status,
                WidgetLanguage.text(context, "focus")
            );
        }

        Intent openApp =
            WidgetNavigation.intent(context, "/timer");

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                80,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.medium_timer_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }
}
