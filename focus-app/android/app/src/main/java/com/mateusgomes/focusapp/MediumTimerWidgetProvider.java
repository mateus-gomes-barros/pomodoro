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
                "Focus"
            );

        String body =
            prefs.getString(
                "timer_widget_body",
                ""
            );

        String badge =
            prefs.getString(
                "timer_widget_badge",
                "💧"
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

        views.setTextViewText(
            R.id.medium_timer_badge,
            badge == null || badge.isEmpty()
                ? "💧"
                : badge
        );

        views.setTextViewText(
            R.id.medium_timer_title,
            title == null || title.isEmpty()
                ? "Focus"
                : title
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
                "FOCUSING"
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
                "FOCUS"
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
