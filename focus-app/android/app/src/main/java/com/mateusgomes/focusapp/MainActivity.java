package com.mateusgomes.focusapp;

import android.content.Intent;
import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(
        Bundle savedInstanceState
    ) {
        registerPlugin(
            PomodoroServicePlugin.class
        );

        registerPlugin(
            WeeklyActivityWidgetPlugin.class
        );

        registerPlugin(
            MonthlyActivityWidgetPlugin.class
        );

        registerPlugin(
            AnalyticsWidgetPlugin.class
        );

        registerPlugin(
            GoalsWidgetPlugin.class
        );

        super.onCreate(savedInstanceState);

        registerPlugin(
            WidgetLanguagePlugin.class
        );

        handleWidgetNavigation(
            getIntent()
        );
    }

    @Override
    protected void onNewIntent(
        Intent intent
    ) {
        super.onNewIntent(intent);

        setIntent(intent);

        handleWidgetNavigation(
            intent
        );
    }

    private void handleWidgetNavigation(
        Intent intent
    ) {
        if (
            intent == null ||
            getBridge() == null
        ) {
            return;
        }

        String route =
            intent.getStringExtra(
                WidgetNavigation.EXTRA_ROUTE
            );

        if (
            route == null ||
            route.isEmpty()
        ) {
            return;
        }

        getBridge()
            .getWebView()
            .post(() -> {
                String javascript =
                    "window.history.pushState({}, '', '" +
                    route +
                    "');" +
                    "window.dispatchEvent(new PopStateEvent('popstate'));";

                getBridge()
                    .getWebView()
                    .evaluateJavascript(
                        javascript,
                        null
                    );
            });
    }
}
