//
//  GoalsWidget.swift
//  FocusWidget
//

import SwiftUI
import WidgetKit

struct GoalsWidgetGoal: Identifiable {
    let id: String
    let title: String
    let completed: Bool
}

struct GoalsWidgetEntry: TimelineEntry {
    let date: Date
    let year: Int
    let completedCount: Int
    let totalCount: Int
    let goals: [GoalsWidgetGoal]
}

struct GoalsWidgetProvider: TimelineProvider {
    private let sampleEntry =
        GoalsWidgetEntry(
            date: .now,
            year: Calendar.current.component(
                .year,
                from: .now
            ),
            completedCount: 2,
            totalCount: 6,
            goals: [
                GoalsWidgetGoal(
                    id: "goal-1",
                    title: "Finish the Focus App",
                    completed: false
                ),
                GoalsWidgetGoal(
                    id: "goal-2",
                    title: "Update my portfolio",
                    completed: false
                ),
                GoalsWidgetGoal(
                    id: "goal-3",
                    title: "Get an international role",
                    completed: false
                )
            ]
        )

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
        completion(sampleEntry)
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (
            Timeline<GoalsWidgetEntry>
        ) -> Void
    ) {
        let nextUpdate =
            Calendar.current.date(
                byAdding: .hour,
                value: 1,
                to: .now
            ) ?? .now.addingTimeInterval(
                3600
            )

        completion(
            Timeline(
                entries: [
                    sampleEntry
                ],
                policy: .after(
                    nextUpdate
                )
            )
        )
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

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
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
                            systemName:
                                "target"
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
                            "\(entry.completedCount) goals completed"
                        )
                        .font(
                            .system(
                                size: 16,
                                weight: .semibold,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(
                            .white
                        )
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

            Spacer(minLength: 12)

            VStack(
                alignment: .leading,
                spacing: 8
            ) {
                ForEach(
                    entry.goals.prefix(3)
                ) { goal in
                    HStack(spacing: 9) {
                        ZStack {
                            Circle()
                                .stroke(
                                    goal.completed
                                        ? accentColor
                                        : Color.white
                                            .opacity(
                                                0.18
                                            ),
                                    lineWidth: 1.5
                                )

                            if goal.completed {
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
                            width: 15,
                            height: 15
                        )

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

                        Spacer(
                            minLength: 0
                        )
                    }
                }
            }

            Spacer(minLength: 12)

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
        .padding(16)
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
        year: Calendar.current.component(
            .year,
            from: .now
        ),
        completedCount: 2,
        totalCount: 6,
        goals: [
            GoalsWidgetGoal(
                id: "goal-1",
                title: "Finish the Focus App",
                completed: false
            ),
            GoalsWidgetGoal(
                id: "goal-2",
                title: "Update my portfolio",
                completed: false
            ),
            GoalsWidgetGoal(
                id: "goal-3",
                title: "Get an international role",
                completed: false
            )
        ]
    )
}
