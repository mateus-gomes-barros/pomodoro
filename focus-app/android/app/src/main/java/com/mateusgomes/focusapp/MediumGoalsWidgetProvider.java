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

public class MediumGoalsWidgetProvider extends AppWidgetProvider {

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
                "goals_snapshot",
                "{}"
            );

        RemoteViews views =
            new RemoteViews(
                context.getPackageName(),
                R.layout.widget_medium_goals
            );

        try {
            JSONObject data =
                new JSONObject(payload);

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
                R.id.medium_goals_progress,
                completed + " / " + total
            );

            JSONArray goals =
                data.optJSONArray("goals");

            int[] titleIds = {
                R.id.medium_goal_1,
                R.id.medium_goal_2
            };

            for (int i = 0; i < 2; i++) {
                String text = "";

                if (
                    goals != null &&
                    i < goals.length()
                ) {
                    JSONObject goal =
                        goals.optJSONObject(i);

                    if (goal != null) {
                        text =
                            (goal.optBoolean(
                                "completed",
                                false
                            )
                                ? "✓ "
                                : "○ ")
                            +
                            goal.optString(
                                "title",
                                ""
                            );
                    }
                }

                views.setTextViewText(
                    titleIds[i],
                    text
                );

                views.setViewVisibility(
                    titleIds[i],
                    text.isEmpty()
                        ? View.GONE
                        : View.VISIBLE
                );
            }

        } catch (Exception ignored) {}

        PendingIntent pendingIntent =
            PendingIntent.getActivity(
                context,
                100,
                new Intent(
                    context,
                    MainActivity.class
                ),
                PendingIntent.FLAG_UPDATE_CURRENT |
                PendingIntent.FLAG_IMMUTABLE
            );

        views.setOnClickPendingIntent(
            R.id.medium_goals_root,
            pendingIntent
        );

        manager.updateAppWidget(
            appWidgetId,
            views
        );
    }
}
