package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class AnalyticsWidgetProvider extends AppWidgetProvider {

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
                    "analytics_snapshot",
                    "{}"
                );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_analytics
            );

        WidgetLanguage.applyStaticLabels(context, views);

        try {
            JSONObject root =
                new JSONObject(payload);

            JSONObject week =
                root.optJSONObject("week");

            if (week == null) {
                throw new Exception(
                    "week snapshot missing"
                );
            }

            int totalMinutes =
                week.optInt(
                    "totalFocusMinutes",
                    0
                );

            int activeDays =
                week.optInt(
                    "activeDays",
                    0
                );

            views.setTextViewText(
                R.id.analytics_total,
                formatMinutes(totalMinutes)
            );

            views.setTextViewText(
                R.id.analytics_days,
                activeDays +
                (activeDays == 1
                    ? " active day"
                    : " active days")
            );

            JSONObject topProject =
                week.optJSONObject(
                    "topProject"
                );

            if (topProject != null) {
                String emoji =
                    topProject.optString(
                        "emoji",
                        "⏱️"
                    );

                String name =
                    topProject.optString(
                        "name",
                        WidgetLanguage.text(context, "noProject")
                    );

                int share =
                    topProject.optInt(
                        "sharePercentage",
                        0
                    );

                views.setTextViewText(
                    R.id.analytics_top_project,
                    emoji + " " + name
                );

                views.setTextViewText(
                    R.id.analytics_share,
                    WidgetLanguage.percentOfFocus(context, share)
                );
            } else {
                views.setTextViewText(
                    R.id.analytics_top_project,
                    WidgetLanguage.text(context, "noFocusYet")
                );

                views.setTextViewText(
                    R.id.analytics_share,
                    ""
                );
            }

            JSONArray projects =
                week.optJSONArray(
                    "topProjects"
                );

            int[] projectIds = {
                R.id.analytics_project_1,
                R.id.analytics_project_2,
                R.id.analytics_project_3
            };

            for (int i = 0; i < projectIds.length; i++) {
                String text = "";

                if (
                    projects != null &&
                    i < projects.length()
                ) {
                    JSONObject project =
                        projects.optJSONObject(i);

                    if (project != null) {
                        String emoji =
                            project.optString(
                                "emoji",
                                "•"
                            );

                        String name =
                            project.optString(
                                "name",
                                ""
                            );

                        int minutes =
                            project.optInt(
                                "focusMinutes",
                                0
                            );

                        text =
                            emoji +
                            " " +
                            name +
                            "  ·  " +
                            formatMinutes(minutes);
                    }
                }

                views.setTextViewText(
                    projectIds[i],
                    text
                );
            }

        } catch (Exception ignored) {
            views.setTextViewText(
                R.id.analytics_total,
                "0m"
            );

            views.setTextViewText(
                R.id.analytics_days,
                WidgetLanguage.activeDays(context, 0)
            );

            views.setTextViewText(
                R.id.analytics_top_project,
                WidgetLanguage.text(context, "noFocusYet")
            );

            views.setTextViewText(
                R.id.analytics_share,
                ""
            );

            views.setTextViewText(
                R.id.analytics_project_1,
                ""
            );

            views.setTextViewText(
                R.id.analytics_project_2,
                ""
            );

            views.setTextViewText(
                R.id.analytics_project_3,
                ""
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
                30,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.analytics_widget_root,
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
            return hours +
                "h " +
                minutes +
                "m";
        }

        return minutes + "m";
    }
}
