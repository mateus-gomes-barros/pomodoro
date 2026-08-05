//
//  CompleteGoalIntent.swift
//  FocusWidget
//

import AppIntents
import Foundation
import WidgetKit

private struct InteractiveGoal:
    Codable
{
    let id: String
    let title: String
    var completed: Bool
}

private struct InteractiveGoalsSnapshot:
    Codable
{
    let year: Int
    var completedCount: Int
    let totalCount: Int
    var goals: [InteractiveGoal]
}

@available(iOS 17.0, *)
struct CompleteGoalIntent:
    AppIntent
{
    static var title:
        LocalizedStringResource
    {
        "Complete Goal"
    }

    static var description:
        IntentDescription
    {
        IntentDescription(
            "Marks a yearly goal as completed."
        )
    }

    static var openAppWhenRun: Bool {
        false
    }

    @Parameter(
        title: "Goal ID"
    )
    var goalID: String

    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "goals_widget_snapshot"

    private let pendingCompletionsKey =
        "goals_widget_pending_completions"

    private let widgetKind =
        "GoalsWidget"

    init() {}

    init(
        goalID: String
    ) {
        self.goalID = goalID
    }

    func perform() async throws
        -> some IntentResult
    {
        guard let sharedDefaults =
            UserDefaults(
                suiteName:
                    appGroupIdentifier
            )
        else {
            return .result()
        }

        var shouldQueueCompletion =
            true

        if
            let payload =
                sharedDefaults.string(
                    forKey: snapshotKey
                ),
            let payloadData =
                payload.data(
                    using: .utf8
                ),
            var snapshot =
                try? JSONDecoder()
                    .decode(
                        InteractiveGoalsSnapshot
                            .self,
                        from: payloadData
                    ),
            let goalIndex =
                snapshot.goals
                    .firstIndex(
                        where: {
                            $0.id == goalID
                        }
                    )
        {
            if snapshot.goals[
                goalIndex
            ].completed {
                shouldQueueCompletion =
                    false
            } else {
                snapshot.goals[
                    goalIndex
                ].completed = true

                snapshot.completedCount =
                    min(
                        snapshot
                            .completedCount +
                            1,
                        snapshot.totalCount
                    )

                if
                    let updatedData =
                        try? JSONEncoder()
                            .encode(
                                snapshot
                            ),
                    let updatedPayload =
                        String(
                            data:
                                updatedData,
                            encoding: .utf8
                        )
                {
                    sharedDefaults.set(
                        updatedPayload,
                        forKey:
                            snapshotKey
                    )
                }
            }
        }

        if shouldQueueCompletion {
            var pendingGoalIDs =
                sharedDefaults
                    .stringArray(
                        forKey:
                            pendingCompletionsKey
                    ) ?? []

            if !pendingGoalIDs
                .contains(goalID)
            {
                pendingGoalIDs.append(
                    goalID
                )

                sharedDefaults.set(
                    pendingGoalIDs,
                    forKey:
                        pendingCompletionsKey
                )
            }
        }

        WidgetCenter.shared
            .reloadTimelines(
                ofKind: widgetKind
            )

        return .result()
    }
}
