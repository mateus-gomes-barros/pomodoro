package com.mateusgomes.focusapp;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        // Agora sim, registramos o plugin sem medo da tela preta
        registerPlugin(PomodoroServicePlugin.class);
        registerPlugin(WeeklyActivityWidgetPlugin.class);
        registerPlugin(MonthlyActivityWidgetPlugin.class);
        registerPlugin(AnalyticsWidgetPlugin.class);
        registerPlugin(GoalsWidgetPlugin.class);
        super.onCreate(savedInstanceState); 
    }
}
