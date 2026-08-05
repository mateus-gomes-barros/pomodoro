//
//  MonthlyActivityWidgetPlugin.swift
//  App
//

import Capacitor
import Foundation
import WidgetKit

@objc(MonthlyActivityWidgetPlugin)
public class MonthlyActivityWidgetPlugin:
    CAPPlugin,
    CAPBridgedPlugin
{
    public let identifier =
        "MonthlyActivityWidgetPlugin"

    public let jsName =
        "MonthlyActivityWidgetBridge"

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
        "monthly_activity_widget_snapshot"

    private let widgetKind =
        "MonthlyActivityWidget"

    @objc
    func saveSnapshot(
        _ call: CAPPluginCall
    ) {
        guard let payload =
            call.getString("payload")
        else {
            call.reject(
                "The monthly activity payload is required."
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
