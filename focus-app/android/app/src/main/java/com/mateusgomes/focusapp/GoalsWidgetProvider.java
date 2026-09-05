package com.mateusgomes.focusapp;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.view.View;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

public class GoalsWidgetProvider extends AppWidgetProvider {

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
                    "goals_snapshot",
                    "{}"
                );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_goals
            );

        try {
            JSONObject data =
                new JSONObject(payload);

            int year =
                data.optInt(
                    "year",
                    java.util.Calendar
                        .getInstance()
                        .get(
                            java.util.Calendar.YEAR
                        )
                );

            int completed =
                data.optInt(
                    "completedCount",
                    0
                );

            int total =
                data.optInt(
                    "totalCount",
                    0
                );

            views.setTextViewText(
                R.id.goals_year,
                String.valueOf(year)
            );

            views.setTextViewText(
                R.id.goals_progress,
                completed +
                " / " +
                total +
                " completed"
            );

            int[] titleIds = {
                R.id.goal_1_title,
                R.id.goal_2_title,
                R.id.goal_3_title
            };

            int[] iconIds = {
                R.id.goal_1_icon,
                R.id.goal_2_icon,
                R.id.goal_3_icon
            };

            int[] rowIds = {
                R.id.goal_1_row,
                R.id.goal_2_row,
                R.id.goal_3_row
            };

            for (int i = 0; i < 3; i++) {
                views.setViewVisibility(
                    rowIds[i],
                    View.GONE
                );
            }

            JSONArray goals =
                data.optJSONArray(
                    "goals"
                );

            if (goals != null) {
                for (
                    int i = 0;
                    i < Math.min(
                        goals.length(),
                        3
                    );
                    i++
                ) {
                    JSONObject goal =
                        goals.optJSONObject(i);

                    if (goal == null) {
                        continue;
                    }

                    String title =
                        goal.optString(
                            "title",
                            "Goal"
                        );

                    boolean completedGoal =
                        goal.optBoolean(
                            "completed",
                            false
                        );

                    views.setViewVisibility(
                        rowIds[i],
                        View.VISIBLE
                    );

                    views.setTextViewText(
                        titleIds[i],
                        title
                    );

                    views.setTextViewText(
                        iconIds[i],
                        completedGoal
                            ? "✓"
                            : "○"
                    );
                }
            }

        } catch (Exception ignored) {
            views.setTextViewText(
                R.id.goals_progress,
                "0 / 0 completed"
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
                40,
                openApp,
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.goals_widget_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }
}
