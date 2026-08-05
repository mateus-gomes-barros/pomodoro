//
//  WeeklyActivityWidgetPlugin.swift
//  App
//

import Capacitor
import Foundation
import WidgetKit

@objc(WeeklyActivityWidgetPlugin)
public class WeeklyActivityWidgetPlugin:
    CAPPlugin,
    CAPBridgedPlugin
{
    public let identifier =
        "WeeklyActivityWidgetPlugin"

    public let jsName =
        "WeeklyActivityWidgetBridge"

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
        "weekly_activity_widget_snapshot"

    private let widgetKind =
        "WeeklyActivityWidget"

    @objc
    func saveSnapshot(
        _ call: CAPPluginCall
    ) {
        guard let payload =
            call.getString("payload")
        else {
            call.reject(
                "The weekly activity payload is required."
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
            .reloadTimelines(
                ofKind: widgetKind
            )

        call.resolve([
            "saved": true,
        ])
    }
}
