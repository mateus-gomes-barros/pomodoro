//
//  TopProjectWeekWidget.swift
//  FocusWidget
//

import Foundation
import SwiftUI
import WidgetKit

private struct TopProjectWeekSnapshot:
    Decodable
{
    let week: TopProjectPeriodSnapshot
}

private struct TopProjectPeriodSnapshot:
    Decodable
{
    let topProject:
        TopProjectSnapshot?
}

private struct TopProjectSnapshot:
    Decodable
{
    let id: String
    let name: String
    let emoji: String
    let color: String
    let focusMinutes: Int
    let sharePercentage: Int
}

private struct TopProjectWeekEntry:
    TimelineEntry
{
    let date: Date
    let project: TopProjectSnapshot?
}

private struct TopProjectWeekProvider:
    TimelineProvider
{
    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "analytics_widget_snapshot"

    private let sampleEntry =
        TopProjectWeekEntry(
            date: .now,
            project: TopProjectSnapshot(
                id: "sample-project",
                name: "Focus App",
                emoji: "⌨️",
                color: "#7EE081",
                focusMinutes: 245,
                sharePercentage: 58
            )
        )

    func placeholder(
        in context: Context
    ) -> TopProjectWeekEntry {
        sampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            TopProjectWeekEntry
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
            Timeline<TopProjectWeekEntry>
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
        -> TopProjectWeekEntry
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
                        TopProjectWeekSnapshot.self,
                        from: payloadData
                    )
        else {
            return TopProjectWeekEntry(
                date: .now,
                project: nil
            )
        }

        return TopProjectWeekEntry(
            date: .now,
            project:
                snapshot.week.topProject
        )
    }
}

private struct TopProjectWeekView:
    View
{
    let entry: TopProjectWeekEntry

    private var accentColor: Color {
        guard let project =
            entry.project
        else {
            return Color(
                red: 0.45,
                green: 0.95,
                blue: 0.64
            )
        }

        return Color(
            hex: project.color
        )
    }

    private var projectEmoji: String {
        entry.project?.emoji ?? "✦"
    }

    private var projectName: String {
        entry.project?.name ??
            "No project yet"
    }

    var body: some View {
        ZStack {
            RadialGradient(
                colors: [
                    accentColor.opacity(
                        entry.project == nil
                            ? 0.08
                            : 0.24
                    ),
                    accentColor.opacity(0),
                ],
                center: .topTrailing,
                startRadius: 0,
                endRadius: 175
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
                        .tracking(1.15)
                        .foregroundStyle(
                            Color.white.opacity(
                                0.38
                            )
                        )
                }

                Spacer(minLength: 8)

                HStack {
                    Spacer(minLength: 0)

                    Text(projectEmoji)
                        .font(
                            .system(size: 58)
                        )
                        .minimumScaleFactor(
                            0.75
                        )
                        .opacity(
                            entry.project == nil
                                ? 0.32
                                : 1
                        )

                    Spacer(minLength: 0)
                }

                Spacer(minLength: 8)

                Text(projectName)
                    .font(
                        .system(
                            size: 14,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        entry.project == nil
                            ? Color.white
                                .opacity(0.35)
                            : Color.white
                                .opacity(0.92)
                    )
                    .lineLimit(1)
                    .minimumScaleFactor(0.72)
            }
            .padding(16)
        }
    }
}

struct TopProjectWeekWidget:
    Widget
{
    let kind =
        "TopProjectWeekWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider:
                TopProjectWeekProvider()
        ) { entry in
            if #available(
                iOS 17.0,
                *
            ) {
                TopProjectWeekView(
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
                TopProjectWeekView(
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
            "Top Project — Week"
        )
        .description(
            "Shows your most focused project this week."
        )
        .supportedFamilies([
            .systemSmall,
        ])
    }
}

private extension Color {
    init(hex: String) {
        let cleanedHex =
            hex.trimmingCharacters(
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
    as: .systemSmall
) {
    TopProjectWeekWidget()
} timeline: {
    TopProjectWeekEntry(
        date: .now,
        project: TopProjectSnapshot(
            id: "focus-app",
            name: "Focus App",
            emoji: "⌨️",
            color: "#7EE081",
            focusMinutes: 245,
            sharePercentage: 58
        )
    )

    TopProjectWeekEntry(
        date: .now,
        project: nil
    )
}
