package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONObject;

public class SmallTopProjectWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(
        Context context,
        AppWidgetManager manager,
        int[] ids
    ) {
        for (int id : ids) {
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
                "analytics_snapshot",
                "{}"
            );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_small_top_project
            );

        WidgetLanguage.applyStaticLabels(context, views);

        try {
            JSONObject root =
                new JSONObject(payload);

            JSONObject week =
                root.optJSONObject("week");

            JSONObject project =
                week != null
                    ? week.optJSONObject(
                        "topProject"
                    )
                    : null;

            if (project != null) {
                views.setTextViewText(
                    R.id.small_top_project_emoji,
                    project.optString(
                        "emoji",
                        "⏱️"
                    )
                );

                views.setTextViewText(
                    R.id.small_top_project_name,
                    project.optString(
                        "name",
                        WidgetLanguage.text(context, "noProject")
                    )
                );

                views.setTextViewText(
                    R.id.small_top_project_time,
                    formatMinutes(
                        project.optInt(
                            "focusMinutes",
                            0
                        )
                    )
                );
            } else {
                views.setTextViewText(
                    R.id.small_top_project_emoji,
                    "⏱️"
                );

                views.setTextViewText(
                    R.id.small_top_project_name,
                    WidgetLanguage.text(context, "noProject")
                );

                views.setTextViewText(
                    R.id.small_top_project_time,
                    "0m"
                );
            }

        } catch (Exception ignored) {}

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                110,
                new Intent(
                    context,
                    MainActivity.class
                ),
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.small_top_project_root,
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
