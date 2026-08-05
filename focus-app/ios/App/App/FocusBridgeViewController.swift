//
//  FocusBridgeViewController.swift
//  App
//

import Capacitor
import UIKit

class FocusBridgeViewController:
    CAPBridgeViewController
{
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(
            FocusLiveActivityPlugin()
        )

        bridge?.registerPluginInstance(
            GoalsWidgetPlugin()
        )

        bridge?.registerPluginInstance(
            MonthlyActivityWidgetPlugin()
        )

        bridge?.registerPluginInstance(
            WeeklyActivityWidgetPlugin()
        )
    }
}