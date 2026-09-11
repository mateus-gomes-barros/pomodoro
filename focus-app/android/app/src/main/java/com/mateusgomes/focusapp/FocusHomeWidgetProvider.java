package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

public class FocusHomeWidgetProvider
        extends AppWidgetProvider {

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

    public static void updateWidget(
        Context context,
        AppWidgetManager manager,
        int appWidgetId
    ) {
        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_focushome
            );

        views.setTextViewText(
            R.id.focushome_widget_eyebrow,
            WidgetLanguage.isPt(context)
                ? "Sua identidade"
                : "Your identity"
        );

        views.setTextViewText(
            R.id.focushome_widget_name,
            "FocushoMe"
        );

        views.setImageViewResource(
            R.id.focushome_widget_symbol,
            R.drawable.ic_focushome_default
        );

        Intent openApp =
            WidgetNavigation.intent(
                context,
                "/focusme"
            );

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                170,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.focushome_widget_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }
}
