package com.mateusgomes.focusapp;

import android.content.Context;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

public final class WidgetLanguage {

    private static final String PREFS =
        "focus_widgets";

    private static final String LANGUAGE_KEY =
        "app_language";

    private WidgetLanguage() {}

    public static String getLanguage(
        Context context
    ) {
        SharedPreferences prefs =
            context.getSharedPreferences(
                PREFS,
                Context.MODE_PRIVATE
            );

        String language =
            prefs.getString(
                LANGUAGE_KEY,
                "pt-BR"
            );

        return "en".equals(language)
            ? "en"
            : "pt-BR";
    }

    public static boolean isPt(
        Context context
    ) {
        return !"en".equals(
            getLanguage(context)
        );
    }

    public static String text(
        Context context,
        String key
    ) {
        boolean pt = isPt(context);

        switch (key) {
            case "weeklyFocus":
                return pt
                    ? "Foco semanal"
                    : "Weekly Focus";

            case "monthlyActivity":
                return pt
                    ? "Atividade mensal"
                    : "Monthly Activity";

            case "weeklyAnalytics":
                return pt
                    ? "Análises semanais"
                    : "Weekly Analytics";

            case "monthlyAnalytics":
                return pt
                    ? "Análises mensais"
                    : "Monthly Analytics";

            case "goals":
                return pt
                    ? "Metas"
                    : "Goals";

            case "today":
                return pt
                    ? "Hoje"
                    : "Today";

            case "thisWeek":
                return pt
                    ? "Esta semana"
                    : "This Week";

            case "topProject":
                return pt
                    ? "Projeto principal"
                    : "Top Project";

            case "project":
                return pt
                    ? "Projeto"
                    : "Project";

            case "focusedToday":
                return pt
                    ? "focado hoje"
                    : "focused today";

            case "dayStreak":
                return pt
                    ? "dias de ofensiva"
                    : "day streak";

            case "noProject":
                return pt
                    ? "Sem projeto"
                    : "No project";

            case "noFocusYet":
                return pt
                    ? "Sem foco ainda"
                    : "No focus yet";

            case "goal":
                return pt
                    ? "Meta"
                    : "Goal";

            case "ready":
                return pt
                    ? "Pronto"
                    : "Ready";

            case "focus":
                return pt
                    ? "FOCO"
                    : "FOCUS";

            case "focusing":
                return pt
                    ? "FOCANDO"
                    : "FOCUSING";

            case "activeDay":
                return pt
                    ? "dia ativo"
                    : "active day";

            case "activeDays":
                return pt
                    ? "dias ativos"
                    : "active days";

            case "completed":
                return pt
                    ? "concluídas"
                    : "completed";

            case "focused":
                return pt
                    ? "de foco"
                    : "focused";

            default:
                return key;
        }
    }

    public static String activeDays(
        Context context,
        int count
    ) {
        if (count == 1) {
            return count + " " +
                text(
                    context,
                    "activeDay"
                );
        }

        return count + " " +
            text(
                context,
                "activeDays"
            );
    }

    public static String dayStreak(
        Context context,
        int count
    ) {
        if (isPt(context)) {
            return count == 1
                ? "1 dia de ofensiva"
                : count +
                    " dias de ofensiva";
        }

        return count == 1
            ? "1 day streak"
            : count + " day streak";
    }

    public static String bestStreak(
        Context context,
        int count
    ) {
        if (isPt(context)) {
            return count == 1
                ? "🔥 1 dia de melhor ofensiva"
                : "🔥 " + count +
                    " dias de melhor ofensiva";
        }

        return count == 1
            ? "🔥 1 day best streak"
            : "🔥 " + count +
                " day best streak";
    }

    public static String completedGoals(
        Context context,
        int completed,
        int total
    ) {
        if (isPt(context)) {
            return completed + " / " +
                total + " concluídas";
        }

        return completed + " / " +
            total + " completed";
    }

    public static String percentOfFocus(
        Context context,
        int percentage
    ) {
        return isPt(context)
            ? percentage + "% do foco"
            : percentage + "% of focus";
    }

    public static String focusTitle(
        Context context
    ) {
        return isPt(context)
            ? "Foco"
            : "Focus";
    }

    public static String focusSession(
        Context context
    ) {
        return isPt(context)
            ? "Sessão de foco"
            : "Focus session";
    }

    public static String focusedMinutes(
        Context context,
        String duration
    ) {
        if (isPt(context)) {
            return duration + " de foco";
        }

        return duration + " focused";
    }

    public static void applyStaticLabels(
        Context context,
        RemoteViews views
    ) {
        boolean pt = isPt(context);

        apply(
            context,
            views,
            "analytics_top_project",
            pt ? "Sem foco ainda" : "No focus yet"
        );
        apply(
            context,
            views,
            "medium_timer_ready",
            pt ? "Pronto" : "Ready"
        );
        apply(
            context,
            views,
            "medium_timer_status",
            pt ? "FOCO" : "FOCUS"
        );
        apply(
            context,
            views,
            "month_widget_title",
            pt ? "Atividade mensal" : "Monthly Activity"
        );
        apply(
            context,
            views,
            "monthly_analytics_top",
            pt ? "Sem foco ainda" : "No focus yet"
        );
        apply(
            context,
            views,
            "small_streak_label",
            pt ? "dias de ofensiva" : "day streak"
        );
        apply(
            context,
            views,
            "small_top_project_name",
            pt ? "Projeto" : "Project"
        );
        apply(
            context,
            views,
            "today_focus_subtitle",
            pt ? "focado hoje" : "focused today"
        );
        apply(
            context,
            views,
            "widget_title",
            pt ? "Foco semanal" : "Weekly Focus"
        );
    }

    private static void apply(
        Context context,
        RemoteViews views,
        String idName,
        String value
    ) {
        int id =
            context
                .getResources()
                .getIdentifier(
                    idName,
                    "id",
                    context.getPackageName()
                );

        if (id != 0) {
            views.setTextViewText(
                id,
                value
            );
        }
    }
}
