package com.mateusgomes.focusapp;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(
    name = "WidgetLanguageBridge"
)
public class WidgetLanguagePlugin
    extends Plugin {

    @PluginMethod
    public void setLanguage(
        PluginCall call
    ) {
        String language =
            call.getString(
                "language",
                "pt-BR"
            );

        if (!"en".equals(language)) {
            language = "pt-BR";
        }

        getContext()
            .getSharedPreferences(
                "focus_widgets",
                Context.MODE_PRIVATE
            )
            .edit()
            .putString(
                "app_language",
                language
            )
            .apply();

        updateAllWidgets();

        call.resolve();
    }

    private void updateAllWidgets() {
        Context context = getContext();

        Class<?>[] providers = new Class<?>[] {
            WeeklyActivityWidgetProvider.class,
            MonthlyActivityWidgetProvider.class,
            AnalyticsWidgetProvider.class,
            MonthlyAnalyticsWidgetProvider.class,
            GoalsWidgetProvider.class,
            MediumGoalsWidgetProvider.class,
            SmallTodayFocusWidgetProvider.class,
            SmallStreakWidgetProvider.class,
            SmallTopProjectWidgetProvider.class,
            MediumTimerWidgetProvider.class,
            MediumWeekWidgetProvider.class
        };

        AppWidgetManager manager =
            AppWidgetManager.getInstance(
                context
            );

        for (
            Class<?> provider :
            providers
        ) {
            ComponentName component =
                new ComponentName(
                    context,
                    provider
                );

            int[] ids =
                manager.getAppWidgetIds(
                    component
                );

            if (ids.length == 0) {
                continue;
            }

            try {
                Object instance =
                    provider
                        .getDeclaredConstructor()
                        .newInstance();

                if (
                    instance
                    instanceof
                        android.appwidget
                            .AppWidgetProvider
                ) {
                    (
                        (
                            android.appwidget
                                .AppWidgetProvider
                        ) instance
                    ).onUpdate(
                        context,
                        manager,
                        ids
                    );
                }
            } catch (Exception ignored) {
            }
        }
    }
}
