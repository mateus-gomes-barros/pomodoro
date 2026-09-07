package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class MonthlyAnalyticsWidgetProvider extends AppWidgetProvider {

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
                R.layout.widget_monthly_analytics
            );

        WidgetLanguage.applyStaticLabels(context, views);

        try {
            JSONObject root =
                new JSONObject(payload);

            JSONObject month =
                root.optJSONObject("month");

            if (month == null) {
                throw new Exception("month missing");
            }

            int totalMinutes =
                month.optInt(
                    "totalFocusMinutes",
                    0
                );

            int activeDays =
                month.optInt(
                    "activeDays",
                    0
                );

            views.setTextViewText(
                R.id.monthly_analytics_total,
                formatMinutes(totalMinutes)
            );

            views.setTextViewText(
                R.id.monthly_analytics_days,
                activeDays +
                (activeDays == 1
                    ? " active day"
                    : " active days")
            );

            JSONObject topProject =
                month.optJSONObject(
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
                    R.id.monthly_analytics_top,
                    emoji + " " + name
                );

                views.setTextViewText(
                    R.id.monthly_analytics_share,
                    WidgetLanguage.percentOfFocus(context, share)
                );
            } else {
                views.setTextViewText(
                    R.id.monthly_analytics_top,
                    WidgetLanguage.text(context, "noFocusYet")
                );

                views.setTextViewText(
                    R.id.monthly_analytics_share,
                    ""
                );
            }

            JSONArray projects =
                month.optJSONArray(
                    "topProjects"
                );

            int[] ids = {
                R.id.monthly_project_1,
                R.id.monthly_project_2,
                R.id.monthly_project_3
            };

            for (int i = 0; i < ids.length; i++) {
                String text = "";

                if (
                    projects != null &&
                    i < projects.length()
                ) {
                    JSONObject project =
                        projects.optJSONObject(i);

                    if (project != null) {
                        text =
                            project.optString(
                                "emoji",
                                "•"
                            ) +
                            " " +
                            project.optString(
                                "name",
                                ""
                            ) +
                            "  ·  " +
                            formatMinutes(
                                project.optInt(
                                    "focusMinutes",
                                    0
                                )
                            );
                    }
                }

                views.setTextViewText(
                    ids[i],
                    text
                );
            }

        } catch (Exception ignored) {
            views.setTextViewText(
                R.id.monthly_analytics_total,
                "0m"
            );

            views.setTextViewText(
                R.id.monthly_analytics_days,
                WidgetLanguage.activeDays(context, 0)
            );

            views.setTextViewText(
                R.id.monthly_analytics_top,
                WidgetLanguage.text(context, "noFocusYet")
            );
        }

        Intent openApp =
            WidgetNavigation.intent(context, "/analytics");

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                50,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.monthly_analytics_root,
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

        return hours > 0
            ? hours + "h " + minutes + "m"
            : minutes + "m";
    }
}
