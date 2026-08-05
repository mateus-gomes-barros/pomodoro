//
//  FocusLiveActivityPlugin.swift
//  App
//

import ActivityKit
import Capacitor
import Foundation

@objc(FocusLiveActivityPlugin)
public class FocusLiveActivityPlugin:
    CAPPlugin,
    CAPBridgedPlugin
{
    public let identifier =
        "FocusLiveActivityPlugin"

    public let jsName =
        "FocusLiveActivity"

    public let pluginMethods: [
        CAPPluginMethod
    ] = [
        CAPPluginMethod(
            name: "start",
            returnType:
                CAPPluginReturnPromise
        ),
        CAPPluginMethod(
            name: "update",
            returnType:
                CAPPluginReturnPromise
        ),
        CAPPluginMethod(
            name: "end",
            returnType:
                CAPPluginReturnPromise
        ),
    ]

    @objc
    func start(
        _ call: CAPPluginCall
    ) {
        guard #available(iOS 16.2, *) else {
            call.reject(
                "Live Activities require iOS 16.2 or later."
            )
            return
        }

        guard ActivityAuthorizationInfo()
            .areActivitiesEnabled
        else {
            call.reject(
                "Live Activities are disabled."
            )
            return
        }

        guard let state = makeState(
            from: call
        ) else {
            return
        }

        let content = makeContent(
            state: state
        )

        if let existingActivity =
            Activity<
                FocusActivityAttributes
            >.activities.first
        {
            Task {
                await existingActivity.update(
                    content
                )

                call.resolve([
                    "activityId":
                        existingActivity.id,
                    "created": false,
                ])
            }

            return
        }

        let attributes =
            FocusActivityAttributes(
                sessionId:
                    call.getString(
                        "sessionId"
                    ) ??
                    UUID().uuidString
            )

        do {
            let activity = try Activity<
                FocusActivityAttributes
            >.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )

            call.resolve([
                "activityId": activity.id,
                "created": true,
            ])
        } catch {
            call.reject(
                "Could not start Live Activity.",
                nil,
                error
            )
        }
    }

    @objc
    func update(
        _ call: CAPPluginCall
    ) {
        guard #available(iOS 16.2, *) else {
            call.reject(
                "Live Activities require iOS 16.2 or later."
            )
            return
        }

        guard let state = makeState(
            from: call
        ) else {
            return
        }

        let activities =
            Activity<
                FocusActivityAttributes
            >.activities

        guard !activities.isEmpty else {
            call.resolve([
                "updated": false,
            ])
            return
        }

        let content = makeContent(
            state: state
        )

        Task {
            for activity in activities {
                await activity.update(
                    content
                )
            }

            call.resolve([
                "updated": true,
            ])
        }
    }

    @objc
    func end(
        _ call: CAPPluginCall
    ) {
        guard #available(iOS 16.2, *) else {
            call.reject(
                "Live Activities require iOS 16.2 or later."
            )
            return
        }

        let activities =
            Activity<
                FocusActivityAttributes
            >.activities

        guard !activities.isEmpty else {
            call.resolve([
                "ended": false,
            ])
            return
        }

        let finalContent:
            ActivityContent<
                FocusActivityAttributes
                    .ContentState
            >?

        if let state = makeState(
            from: call,
            rejectInvalidValues: false
        ) {
            finalContent = makeContent(
                state: state
            )
        } else {
            finalContent = nil
        }

        Task {
            for activity in activities {
                await activity.end(
                    finalContent,
                    dismissalPolicy:
                        .immediate
                )
            }

            call.resolve([
                "ended": true,
            ])
        }
    }

    @available(iOS 16.2, *)
    private func makeState(
        from call: CAPPluginCall,
        rejectInvalidValues: Bool = true
    ) -> FocusActivityAttributes
        .ContentState?
    {
        guard let sessionTypeValue =
            call.getString(
                "sessionType"
            )
        else {
            if rejectInvalidValues {
                call.reject(
                    "sessionType is required."
                )
            }

            return nil
        }

        let sessionType:
            FocusActivityAttributes
                .SessionType

        switch sessionTypeValue {
        case "work":
            sessionType = .work

        case "short_break":
            sessionType = .shortBreak

        case "long_break":
            sessionType = .longBreak

        default:
            if rejectInvalidValues {
                call.reject(
                    "Invalid sessionType."
                )
            }

            return nil
        }

        guard let statusValue =
            call.getString("status")
        else {
            if rejectInvalidValues {
                call.reject(
                    "status is required."
                )
            }

            return nil
        }

        let status:
            FocusActivityAttributes
                .TimerStatus

        switch statusValue {
        case "running":
            status = .running

        case "paused":
            status = .paused

        default:
            if rejectInvalidValues {
                call.reject(
                    "Invalid timer status."
                )
            }

            return nil
        }

        let endDate: Date?

        if let endDateMilliseconds =
            call.getDouble("endDate"),
           endDateMilliseconds > 0
        {
            endDate = Date(
                timeIntervalSince1970:
                    endDateMilliseconds /
                    1000
            )
        } else {
            endDate = nil
        }

        return FocusActivityAttributes
            .ContentState(
                sessionType: sessionType,
                status: status,
                endDate: endDate,
                remainingSeconds: max(
                    0,
                    call.getInt(
                        "remainingSeconds"
                    ) ?? 0
                ),
                projectName:
                    normalizedText(
                        call.getString(
                            "projectName"
                        )
                    ),
                taskName:
                    normalizedText(
                        call.getString(
                            "taskName"
                        )
                    ),
                badgeIcon:
                    normalizedText(
                        call.getString(
                            "badgeIcon"
                        )
                    )
            )
    }

    @available(iOS 16.2, *)
    private func makeContent(
        state:
            FocusActivityAttributes
                .ContentState
    ) -> ActivityContent<
        FocusActivityAttributes
            .ContentState
    > {
        let staleDate =
            state.endDate?
                .addingTimeInterval(60)

        return ActivityContent(
            state: state,
            staleDate: staleDate
        )
    }

    private func normalizedText(
        _ value: String?
    ) -> String? {
        guard let value else {
            return nil
        }

        let trimmedValue =
            value.trimmingCharacters(
                in: .whitespacesAndNewlines
            )

        return trimmedValue.isEmpty
            ? nil
            : trimmedValue
    }
}