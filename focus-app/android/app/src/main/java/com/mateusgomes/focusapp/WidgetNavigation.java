package com.mateusgomes.focusapp;

import android.content.Context;
import android.content.Intent;

public final class WidgetNavigation {

    public static final String EXTRA_ROUTE = "widget_route";

    private WidgetNavigation() {}

    public static Intent intent(
        Context context,
        String route
    ) {
        Intent intent =
            new Intent(
                context,
                MainActivity.class
            );

        intent.putExtra(
            EXTRA_ROUTE,
            route
        );

        // Torna cada destino um Intent diferente.
        // Isso evita que PendingIntents de widgets diferentes
        // sobrescrevam a rota uns dos outros.
        intent.setAction(
            "com.mateusgomes.focusapp.WIDGET_NAVIGATE_" +
            route
        );

        intent.addFlags(
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_SINGLE_TOP
        );

        return intent;
    }
}
