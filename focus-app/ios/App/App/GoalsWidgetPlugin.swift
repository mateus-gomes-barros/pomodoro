//
//  GoalsWidgetPlugin.swift
//  App
//

import Capacitor
import Foundation
import WidgetKit

@objc(GoalsWidgetPlugin)
public class GoalsWidgetPlugin:
    CAPPlugin,
    CAPBridgedPlugin
{
    public let identifier =
        "GoalsWidgetPlugin"

    public let jsName =
        "GoalsWidget"

    public let pluginMethods: [
        CAPPluginMethod
    ] = [
        CAPPluginMethod(
            name: "saveSnapshot",
            returnType:
                CAPPluginReturnPromise
        ),
        CAPPluginMethod(
            name: "getPendingCompletions",
            returnType:
                CAPPluginReturnPromise
        ),
        CAPPluginMethod(
            name: "removePendingCompletions",
            returnType:
                CAPPluginReturnPromise
        ),
    ]

    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "goals_widget_snapshot"

    private let pendingCompletionsKey =
        "goals_widget_pending_completions"

    private let widgetKind =
        "GoalsWidget"

    @objc
    func saveSnapshot(
        _ call: CAPPluginCall
    ) {
        guard let payload =
            call.getString("payload")
        else {
            call.reject(
                "The Goals widget payload is required."
            )

            return
        }

        guard let sharedDefaults =
            sharedDefaults()
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

        reloadWidget()

        call.resolve([
            "saved": true,
        ])
    }

    @objc
    func getPendingCompletions(
        _ call: CAPPluginCall
    ) {
        guard let sharedDefaults =
            sharedDefaults()
        else {
            call.reject(
                "Unable to access the shared App Group."
            )

            return
        }

        let goalIDs =
            sharedDefaults.stringArray(
                forKey:
                    pendingCompletionsKey
            ) ?? []

        call.resolve([
            "goalIDs": goalIDs,
        ])
    }

    @objc
    func removePendingCompletions(
        _ call: CAPPluginCall
    ) {
        guard let goalIDs =
            call.getArray(
                "goalIDs",
                String.self
            )
        else {
            call.reject(
                "The completed goal IDs are required."
            )

            return
        }

        guard let sharedDefaults =
            sharedDefaults()
        else {
            call.reject(
                "Unable to access the shared App Group."
            )

            return
        }

        let currentGoalIDs =
            sharedDefaults.stringArray(
                forKey:
                    pendingCompletionsKey
            ) ?? []

        let removedGoalIDs =
            Set(goalIDs)

        let remainingGoalIDs =
            currentGoalIDs.filter {
                !removedGoalIDs.contains($0)
            }

        sharedDefaults.set(
            remainingGoalIDs,
            forKey:
                pendingCompletionsKey
        )

        reloadWidget()

        call.resolve([
            "removed": true,
        ])
    }

    private func sharedDefaults()
        -> UserDefaults?
    {
        UserDefaults(
            suiteName:
                appGroupIdentifier
        )
    }

    private func reloadWidget() {
        WidgetCenter.shared
            .reloadTimelines(
                ofKind: widgetKind
            )
    }
}