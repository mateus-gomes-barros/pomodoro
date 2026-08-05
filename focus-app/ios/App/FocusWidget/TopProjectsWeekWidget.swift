//
//  TopProjectsWeekWidget.swift
//  FocusWidget
//

import Foundation
import SwiftUI
import UIKit
import WidgetKit

private struct TopProjectsWeekSnapshot:
    Decodable
{
    let week:
        TopProjectsWeekPeriodSnapshot
}

private struct TopProjectsWeekPeriodSnapshot:
    Decodable
{
    let totalFocusMinutes: Int
    let activeDays: Int
    let topProjects: [
        TopProjectsWeekProjectSnapshot
    ]
}

private struct TopProjectsWeekProjectSnapshot:
    Decodable,
    Identifiable
{
    let id: String
    let name: String
    let emoji: String
    let color: String
    let focusMinutes: Int
    let sharePercentage: Int
}

private struct TopProjectsWeekEntry:
    TimelineEntry
{
    let date: Date
    let totalFocusMinutes: Int
    let activeDays: Int

    let projects: [
        TopProjectsWeekProjectSnapshot
    ]
}

private struct TopProjectsWeekProvider:
    TimelineProvider
{
    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "analytics_widget_snapshot"

    private let sampleEntry =
        TopProjectsWeekEntry(
            date: .now,
            totalFocusMinutes: 635,
            activeDays: 5,
            projects: [
                TopProjectsWeekProjectSnapshot(
                    id: "focus-app",
                    name: "Focus App",
                    emoji: "⌨️",
                    color: "#7EE081",
                    focusMinutes: 285,
                    sharePercentage: 45
                ),

                TopProjectsWeekProjectSnapshot(
                    id: "studies",
                    name: "Studies",
                    emoji: "📚",
                    color: "#7EA8E0",
                    focusMinutes: 210,
                    sharePercentage: 33
                ),

                TopProjectsWeekProjectSnapshot(
                    id: "workout",
                    name: "Workout",
                    emoji: "🏋️",
                    color: "#E0A87E",
                    focusMinutes: 140,
                    sharePercentage: 22
                ),
            ]
        )

    func placeholder(
        in context: Context
    ) -> TopProjectsWeekEntry {
        sampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            TopProjectsWeekEntry
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
            Timeline<TopProjectsWeekEntry>
        ) -> Void
    ) {
        let entry = loadEntry()

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
                entries: [entry],
                policy: .after(nextUpdate)
            )
        )
    }

    private func loadEntry()
        -> TopProjectsWeekEntry
    {
        guard let sharedDefaults =
            UserDefaults(
                suiteName:
                    appGroupIdentifier
            ),
            let payload =
                sharedDefaults.string(
                    forKey: snapshotKey
                ),
            let payloadData =
                payload.data(
                    using: .utf8
                ),
            let snapshot =
                try? JSONDecoder()
                    .decode(
                        TopProjectsWeekSnapshot.self,
                        from: payloadData
                    )
        else {
            return TopProjectsWeekEntry(
                date: .now,
                totalFocusMinutes: 0,
                activeDays: 0,
                projects: []
            )
        }

        return TopProjectsWeekEntry(
            date: .now,
            totalFocusMinutes:
                snapshot.week
                    .totalFocusMinutes,
            activeDays:
                snapshot.week.activeDays,
            projects:
                Array(
                    snapshot.week
                        .topProjects
                        .prefix(3)
                )
        )
    }
}

private struct TopProjectsWeekView:
    View
{
    let entry: TopProjectsWeekEntry

    private var isPad: Bool {
        UIDevice.current.userInterfaceIdiom ==
            .pad
    }

    private var accentColor: Color {
        guard let topProject =
            entry.projects.first
        else {
            return Color(
                red: 0.45,
                green: 0.95,
                blue: 0.64
            )
        }

        return Color(
            topProjectsHex:
                topProject.color
        )
    }

    private var formattedTotal: String {
        formatDuration(
            entry.totalFocusMinutes
        )
    }

    var body: some View {
        ZStack {
            RadialGradient(
                colors: [
                    accentColor.opacity(
                        entry.projects.isEmpty
                            ? 0.07
                            : 0.18
                    ),

                    accentColor.opacity(0),
                ],
                center: .topTrailing,
                startRadius: 0,
                endRadius: 245
            )

            LinearGradient(
                colors: [
                    Color.white.opacity(
                        0.025
                    ),

                    Color.clear,
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            VStack(
                alignment: .leading,
                spacing: 0
            ) {
                header

                if entry.projects.isEmpty {
                    emptyState
                } else {
                    projectList
                }
            }
            .padding(
                .horizontal,
                isPad ? 13 : 16
            )
            .padding(
                .top,
                isPad ? 10 : 16
            )
            .padding(
                .bottom,
                isPad ? 7 : 16
            )
        }
    }

    private var header: some View {
        HStack(
            alignment: .top,
            spacing: isPad ? 6 : 12
        ) {
            VStack(
                alignment: .leading,
                spacing: 3
            ) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(accentColor)
                        .frame(
                            width: 5,
                            height: 5
                        )

                    Text("THIS WEEK")
                        .font(
                            .system(
                                size: 9,
                                weight: .bold,
                                design: .rounded
                            )
                        )
                        .tracking(1.1)
                        .foregroundStyle(
                            Color.white.opacity(
                                0.36
                            )
                        )
                }

                Text("Top Projects")
                    .font(
                        .system(
                            size: isPad ? 12 : 15,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.92
                        )
                    )
            }

            Spacer(minLength: 8)

            VStack(
                alignment: .trailing,
                spacing: 2
            ) {
                Text(formattedTotal)
                    .font(
                        .system(
                            size: 13,
                            weight: .semibold,
                            design: .monospaced
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.72
                        )
                    )

                Text(
                    "\(entry.activeDays) active \(entry.activeDays == 1 ? "day" : "days")"
                )
                .font(
                    .system(
                        size: 9,
                        weight: .medium,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.28
                    )
                )
            }
        }
    }

    private var projectList: some View {
        VStack(
            spacing: isPad ? 2 : 9
        ) {
            Spacer(
                minLength: isPad ? 0 : 8
            )

            ForEach(
                Array(
                    entry.projects.enumerated()
                ),
                id: \.element.id
            ) { index, project in
                projectRow(
                    project: project,
                    rank: index + 1
                )
            }
        }
    }

    private func projectRow(
        project:
            TopProjectsWeekProjectSnapshot,
        rank: Int
    ) -> some View {
        let projectColor = Color(
            topProjectsHex:
                project.color
        )

        return HStack(
            spacing: isPad ? 5 : 9
        ) {
            ZStack {
                Circle()
                    .fill(
                        projectColor.opacity(
                            rank == 1
                                ? 0.16
                                : 0.08
                        )
                    )

                Text("\(rank)")
                    .font(
                        .system(
                            size: 9,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        rank == 1
                            ? projectColor
                            : Color.white
                                .opacity(0.38)
                    )
            }
            .frame(
                width: isPad ? 17 : 22,
                height: isPad ? 17 : 22
            )

            Text(project.emoji)
                .font(
                    .system(
                        size: isPad ? 14 : 19
                    )
                )
                .frame(
                    width: isPad ? 18 : 24,
                    alignment: .center
                )

            VStack(
                alignment: .leading,
                spacing: isPad ? 2 : 4
            ) {
                HStack(spacing: 8) {
                    Text(project.name)
                        .font(
                            .system(
                                size: isPad ? 10 : 11,
                                weight: .semibold,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(
                            Color.white.opacity(
                                0.78
                            )
                        )
                        .lineLimit(1)
                        .minimumScaleFactor(0.72)

                    Spacer(minLength: 5)

                    Text(
                        formatDuration(
                            project.focusMinutes
                        )
                    )
                    .font(
                        .system(
                            size: isPad ? 8 : 9,
                            weight: .semibold,
                            design: .monospaced
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.38
                        )
                    )

                    Text(
                        "\(project.sharePercentage)%"
                    )
                    .font(
                        .system(
                            size: isPad ? 8 : 9,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        projectColor.opacity(
                            0.9
                        )
                    )
                    .frame(
                        width: 29,
                        alignment: .trailing
                    )
                }

                GeometryReader { proxy in
                    ZStack(
                        alignment: .leading
                    ) {
                        Capsule()
                            .fill(
                                Color.white.opacity(
                                    0.055
                                )
                            )

                        Capsule()
                            .fill(projectColor)
                            .frame(
                                width:
                                    proxy.size.width *
                                    min(
                                        max(
                                            Double(
                                                project
                                                    .sharePercentage
                                            ) / 100,
                                            0
                                        ),
                                        1
                                    )
                            )
                    }
                }
                .frame(
                    height: isPad ? 2 : 3
                )
            }
        }
    }

    private var emptyState: some View {
        HStack(spacing: 12) {
            Spacer(minLength: 0)

            ZStack {
                Circle()
                    .fill(
                        accentColor.opacity(
                            0.08
                        )
                    )

                Text("✦")
                    .font(
                        .system(size: 24)
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.22
                        )
                    )
            }
            .frame(
                width: 48,
                height: 48
            )

            VStack(
                alignment: .leading,
                spacing: 4
            ) {
                Text("No project focus yet")
                    .font(
                        .system(
                            size: 12,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.45
                        )
                    )

                Text(
                    "Connect a Pomodoro to a project."
                )
                .font(
                    .system(
                        size: 9,
                        weight: .medium,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.24
                    )
                )
            }

            Spacer(minLength: 0)
        }
        .frame(maxHeight: .infinity)
    }

    private func formatDuration(
        _ minutes: Int
    ) -> String {
        if minutes < 60 {
            return "\(minutes)m"
        }

        let hours = minutes / 60
        let remainingMinutes =
            minutes % 60

        if remainingMinutes == 0 {
            return "\(hours)h"
        }

        return "\(hours)h \(remainingMinutes)m"
    }
}

struct TopProjectsWeekWidget:
    Widget
{
    let kind =
        "TopProjectsWeekWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider:
                TopProjectsWeekProvider()
        ) { entry in
            if #available(
                iOS 17.0,
                *
            ) {
                TopProjectsWeekView(
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
            } else {
                TopProjectsWeekView(
                    entry: entry
                )
                .background(
                    Color(
                        red: 0.035,
                        green: 0.035,
                        blue: 0.04
                    )
                )
            }
        }
        .configurationDisplayName(
            "Top Projects — Week"
        )
        .description(
            "Shows your three most focused projects this week."
        )
        .supportedFamilies([
            .systemMedium,
        ])
    }
}

private extension Color {
    init(topProjectsHex: String) {
        let cleanedHex =
            topProjectsHex
                .trimmingCharacters(
                    in: CharacterSet
                        .alphanumerics
                        .inverted
                )

        var hexValue: UInt64 = 0

        Scanner(
            string: cleanedHex
        ).scanHexInt64(&hexValue)

        let red: Double
        let green: Double
        let blue: Double

        if cleanedHex.count == 3 {
            red = Double(
                (hexValue >> 8) * 17
            ) / 255

            green = Double(
                (
                    hexValue >> 4
                ) & 0xF
            ) * 17 / 255

            blue = Double(
                hexValue & 0xF
            ) * 17 / 255
        } else {
            red = Double(
                (hexValue >> 16) &
                    0xFF
            ) / 255

            green = Double(
                (hexValue >> 8) &
                    0xFF
            ) / 255

            blue = Double(
                hexValue & 0xFF
            ) / 255
        }

        self.init(
            red: red,
            green: green,
            blue: blue
        )
    }
}

#Preview(
    as: .systemMedium
) {
    TopProjectsWeekWidget()
} timeline: {
    TopProjectsWeekEntry(
        date: .now,
        totalFocusMinutes: 635,
        activeDays: 5,
        projects: [
            TopProjectsWeekProjectSnapshot(
                id: "focus-app",
                name: "Focus App",
                emoji: "⌨️",
                color: "#7EE081",
                focusMinutes: 285,
                sharePercentage: 45
            ),

            TopProjectsWeekProjectSnapshot(
                id: "studies",
                name: "Studies",
                emoji: "📚",
                color: "#7EA8E0",
                focusMinutes: 210,
                sharePercentage: 33
            ),

            TopProjectsWeekProjectSnapshot(
                id: "workout",
                name: "Workout",
                emoji: "🏋️",
                color: "#E0A87E",
                focusMinutes: 140,
                sharePercentage: 22
            ),
        ]
    )

    TopProjectsWeekEntry(
        date: .now,
        totalFocusMinutes: 0,
        activeDays: 0,
        projects: []
    )
}
