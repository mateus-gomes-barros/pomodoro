//
//  GoalsWidget.swift
//  FocusWidget
//

import AppIntents
import Foundation
import SwiftUI
import WidgetKit

struct GoalsWidgetGoal:
    Codable,
    Identifiable
{
    let id: String
    let title: String
    let completed: Bool
}

private struct GoalsWidgetSnapshot:
    Codable
{
    let year: Int
    let completedCount: Int
    let totalCount: Int
    let goals: [GoalsWidgetGoal]
}

struct GoalsWidgetEntry:
    TimelineEntry
{
    let date: Date
    let year: Int
    let completedCount: Int
    let totalCount: Int
    let goals: [GoalsWidgetGoal]
}

struct GoalsWidgetProvider:
    TimelineProvider
{
    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "goals_widget_snapshot"

    private var currentYear: Int {
        Calendar.current.component(
            .year,
            from: .now
        )
    }

    private var sampleEntry:
        GoalsWidgetEntry
    {
        GoalsWidgetEntry(
            date: .now,
            year: currentYear,
            completedCount: 2,
            totalCount: 6,
            goals: [
                GoalsWidgetGoal(
                    id: "goal-1",
                    title:
                        "Finish the Focus App",
                    completed: false
                ),
                GoalsWidgetGoal(
                    id: "goal-2",
                    title:
                        "Update my portfolio",
                    completed: false
                ),
                GoalsWidgetGoal(
                    id: "goal-3",
                    title:
                        "Get an international role",
                    completed: true
                )
            ]
        )
    }

    private var emptyEntry:
        GoalsWidgetEntry
    {
        GoalsWidgetEntry(
            date: .now,
            year: currentYear,
            completedCount: 0,
            totalCount: 0,
            goals: []
        )
    }

    func placeholder(
        in context: Context
    ) -> GoalsWidgetEntry {
        sampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            GoalsWidgetEntry
        ) -> Void
    ) {
        if context.isPreview {
            completion(sampleEntry)

            return
        }

        completion(loadEntry())
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (
            Timeline<GoalsWidgetEntry>
        ) -> Void
    ) {
        let entry = loadEntry()

        let nextUpdate =
            Calendar.current.date(
                byAdding: .hour,
                value: 1,
                to: .now
            ) ??
            .now.addingTimeInterval(
                3600
            )

        completion(
            Timeline(
                entries: [entry],
                policy: .after(
                    nextUpdate
                )
            )
        )
    }

    private func loadEntry()
        -> GoalsWidgetEntry
    {
        guard
            let sharedDefaults =
                UserDefaults(
                    suiteName:
                        appGroupIdentifier
                ),
            let payload =
                sharedDefaults.string(
                    forKey: snapshotKey
                ),
            let data =
                payload.data(
                    using: .utf8
                )
        else {
            return emptyEntry
        }

        do {
            let snapshot =
                try JSONDecoder()
                    .decode(
                        GoalsWidgetSnapshot
                            .self,
                        from: data
                    )

            return GoalsWidgetEntry(
                date: .now,
                year: snapshot.year,
                completedCount:
                    snapshot.completedCount,
                totalCount:
                    snapshot.totalCount,
                goals: snapshot.goals
            )
        } catch {
            print(
                "Unable to decode Goals widget snapshot: \(error)"
            )

            return emptyEntry
        }
    }
}

struct GoalsWidgetView: View {
    let entry: GoalsWidgetEntry

    private let accentColor = Color(
        red: 0.45,
        green: 0.95,
        blue: 0.64
    )

    private var progress: Double {
        guard entry.totalCount > 0 else {
            return 0
        }

        return min(
            max(
                Double(
                    entry.completedCount
                ) /
                Double(
                    entry.totalCount
                ),
                0
            ),
            1
        )
    }

    private var completedLabel: String {
        if entry.completedCount == 1 {
            return "1 goal completed"
        }

        return
            "\(entry.completedCount) goals completed"
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            header

            Spacer(minLength: 11)

            goalsContent

            Spacer(minLength: 11)

            progressContent
        }
        .padding(16)
    }

    private var header: some View {
        HStack(
            alignment: .center
        ) {
            HStack(spacing: 9) {
                ZStack {
                    RoundedRectangle(
                        cornerRadius: 10,
                        style: .continuous
                    )
                    .fill(
                        accentColor.opacity(
                            0.12
                        )
                    )

                    Image(
                        systemName: "target"
                    )
                    .font(
                        .system(
                            size: 14,
                            weight: .bold
                        )
                    )
                    .foregroundStyle(
                        accentColor
                    )
                }
                .frame(
                    width: 34,
                    height: 34
                )

                VStack(
                    alignment: .leading,
                    spacing: 2
                ) {
                    Text(
                        "GOALS \(entry.year)"
                    )
                    .font(
                        .system(
                            size: 10,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .tracking(1.1)
                    .foregroundStyle(
                        Color.white.opacity(
                            0.35
                        )
                    )

                    Text(
                        entry.totalCount > 0
                            ? completedLabel
                            : "Plan your year"
                    )
                    .font(
                        .system(
                            size: 16,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(
                        0.75
                    )
                }
            }

            Spacer()

            Text(
                "\(entry.completedCount)/\(entry.totalCount)"
            )
            .font(
                .system(
                    size: 13,
                    weight: .bold,
                    design: .rounded
                )
            )
            .foregroundStyle(
                accentColor
            )
            .padding(
                .horizontal,
                10
            )
            .padding(
                .vertical,
                7
            )
            .background(
                accentColor.opacity(
                    0.1
                ),
                in: Capsule()
            )
        }
    }

    @ViewBuilder
    private var goalsContent: some View {
        if entry.goals.isEmpty {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(
                            accentColor.opacity(
                                0.1
                            )
                        )

                    Image(
                        systemName:
                            "plus"
                    )
                    .font(
                        .system(
                            size: 10,
                            weight: .bold
                        )
                    )
                    .foregroundStyle(
                        accentColor
                    )
                }
                .frame(
                    width: 25,
                    height: 25
                )

                VStack(
                    alignment: .leading,
                    spacing: 2
                ) {
                    Text(
                        "No goals yet"
                    )
                    .font(
                        .system(
                            size: 12,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.8
                        )
                    )

                    Text(
                        "Open Focus to add your first goal."
                    )
                    .font(
                        .system(
                            size: 10,
                            weight: .medium,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.3
                        )
                    )
                    .lineLimit(1)
                }

                Spacer(
                    minLength: 0
                )
            }
            .frame(
                maxHeight: .infinity,
                alignment: .center
            )
        } else {
            VStack(
                alignment: .leading,
                spacing: 8
            ) {
                ForEach(
                    entry.goals.prefix(3)
                ) { goal in
                    goalRow(for: goal)
                }
            }
        }
    }

    private func goalRow(
        for goal: GoalsWidgetGoal
    ) -> some View {
        HStack(spacing: 9) {
            goalControl(for: goal)

            Text(goal.title)
                .font(
                    .system(
                        size: 12,
                        weight: .medium,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    goal.completed
                        ? Color.white
                            .opacity(
                                0.35
                            )
                        : Color.white
                            .opacity(
                                0.82
                            )
                )
                .strikethrough(
                    goal.completed
                )
                .lineLimit(1)
                .minimumScaleFactor(
                    0.75
                )

            Spacer(
                minLength: 0
            )
        }
    }

    @ViewBuilder
    private func goalControl(
        for goal: GoalsWidgetGoal
    ) -> some View {
        if goal.completed {
            goalIndicator(
                completed: true
            )
        } else {
            if #available(
                iOS 17.0,
                *
            ) {
                Button(
                    intent:
                        CompleteGoalIntent(
                            goalID: goal.id
                        )
                ) {
                    goalIndicator(
                        completed: false
                    )
                }
                .buttonStyle(.plain)
                .accessibilityLabel(
                    "Complete \(goal.title)"
                )
            } else {
                goalIndicator(
                    completed: false
                )
            }
        }
    }

    private func goalIndicator(
        completed: Bool
    ) -> some View {
        ZStack {
            Circle()
                .stroke(
                    completed
                        ? accentColor
                        : Color.white
                            .opacity(
                                0.18
                            ),
                    lineWidth: 1.5
                )

            if completed {
                Circle()
                    .fill(
                        accentColor
                    )
                    .padding(3)

                Image(
                    systemName:
                        "checkmark"
                )
                .font(
                    .system(
                        size: 6,
                        weight: .bold
                    )
                )
                .foregroundStyle(
                    .black
                )
            }
        }
        .frame(
            width: 18,
            height: 18
        )
        .contentShape(
            Circle()
        )
    }

    private var progressContent: some View {
        VStack(spacing: 7) {
            GeometryReader { geometry in
                ZStack(
                    alignment: .leading
                ) {
                    Capsule()
                        .fill(
                            Color.white
                                .opacity(
                                    0.06
                                )
                        )

                    Capsule()
                        .fill(
                            accentColor
                        )
                        .frame(
                            width:
                                geometry
                                    .size
                                    .width *
                                progress
                        )
                }
            }
            .frame(height: 5)

            HStack {
                Text(
                    "\(Int(progress * 100))% completed"
                )
                .font(
                    .system(
                        size: 10,
                        weight: .semibold,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.35
                    )
                )

                Spacer()

                Image(
                    systemName:
                        "trophy.fill"
                )
                .font(
                    .system(
                        size: 10
                    )
                )
                .foregroundStyle(
                    accentColor.opacity(
                        0.75
                    )
                )
            }
        }
    }
}

struct GoalsWidget: Widget {
    let kind = "GoalsWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider:
                GoalsWidgetProvider()
        ) { entry in
            GoalsWidgetView(
                entry: entry
            )
            .containerBackground(
                for: .widget
            ) {
                Color(
                    red: 0.035,
                    green: 0.035,
                    blue: 0.04
                )
            }
        }
        .configurationDisplayName(
            "Yearly Goals"
        )
        .description(
            "Mostra o progresso das suas metas do ano."
        )
        .supportedFamilies([
            .systemMedium
        ])
    }
}

#Preview(
    as: .systemMedium
) {
    GoalsWidget()
} timeline: {
    GoalsWidgetEntry(
        date: .now,
        year: Calendar.current
            .component(
                .year,
                from: .now
            ),
        completedCount: 2,
        totalCount: 6,
        goals: [
            GoalsWidgetGoal(
                id: "goal-1",
                title:
                    "Finish the Focus App",
                completed: false
            ),
            GoalsWidgetGoal(
                id: "goal-2",
                title:
                    "Update my portfolio",
                completed: false
            ),
            GoalsWidgetGoal(
                id: "goal-3",
                title:
                    "Get an international role",
                completed: true
            )
        ]
    )
}