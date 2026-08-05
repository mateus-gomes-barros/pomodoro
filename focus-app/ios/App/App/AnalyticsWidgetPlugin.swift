//
//  AnalyticsWidgetPlugin.swift
//  App
//

import Capacitor
import Foundation
import WidgetKit

@objc(AnalyticsWidgetPlugin)
public class AnalyticsWidgetPlugin:
    CAPPlugin,
    CAPBridgedPlugin
{
    public let identifier =
        "AnalyticsWidgetPlugin"

    public let jsName =
        "AnalyticsWidgetBridge"

    public let pluginMethods: [
        CAPPluginMethod
    ] = [
        CAPPluginMethod(
            name: "saveSnapshot",
            returnType:
                CAPPluginReturnPromise
        ),
    ]

    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "analytics_widget_snapshot"

    @objc
    func saveSnapshot(
        _ call: CAPPluginCall
    ) {
        guard let payload =
            call.getString("payload")
        else {
            call.reject(
                "The Analytics widget payload is required."
            )

            return
        }

        guard let sharedDefaults =
            UserDefaults(
                suiteName:
                    appGroupIdentifier
            )
        else {
            call.reject(
                "Unable to access the shared App Group."
            )

            return
        }

        sharedDefaults.set(
            payload,
            forKey: snapshotKey
        )

        WidgetCenter.shared
            .reloadAllTimelines()

        call.resolve([
            "saved": true,
        ])
    }
}
