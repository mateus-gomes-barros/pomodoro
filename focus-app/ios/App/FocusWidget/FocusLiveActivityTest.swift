//
//  FocusLiveActivityTest.swift
//  Focus
//

import ActivityKit
import Foundation

enum FocusLiveActivityTest {
    @available(iOS 16.2, *)
    static func start() {
        guard ActivityAuthorizationInfo()
            .areActivitiesEnabled
        else {
            print(
                "Live Activities are disabled."
            )
            return
        }

        guard Activity<
            FocusActivityAttributes
        >.activities.isEmpty
        else {
            print(
                "A Focus Live Activity is already running."
            )
            return
        }

        let duration: TimeInterval = 120

        let endDate = Date()
            .addingTimeInterval(duration)

        let attributes =
            FocusActivityAttributes(
                sessionId: UUID().uuidString
            )

        let state =
            FocusActivityAttributes
                .ContentState(
                    sessionType: .work,
                    status: .running,
                    endDate: endDate,
                    remainingSeconds: Int(
                        duration
                    ),
                    projectName: "Focus App",
                    taskName:
                        "Testing Dynamic Island",
                    badgeIcon: "🔥"
                )

        let content = ActivityContent(
            state: state,
            staleDate:
                endDate.addingTimeInterval(
                    30
                )
        )

        do {
            let activity = try Activity<
                FocusActivityAttributes
            >.request(
                attributes: attributes,
                content: content,
                pushType: nil
            )

            print(
                "Live Activity started: \(activity.id)"
            )
        } catch {
            print(
                "Could not start Live Activity: \(error)"
            )
        }
    }
}