//
//  TopProjectMonthWidget.swift
//  FocusWidget
//

import Foundation
import SwiftUI
import WidgetKit

private struct TopProjectMonthSnapshot:
    Decodable
{
    let month:
        TopProjectMonthPeriodSnapshot
}

private struct TopProjectMonthPeriodSnapshot:
    Decodable
{
    let topProject:
        TopProjectMonthProjectSnapshot?
}

private struct TopProjectMonthProjectSnapshot:
    Decodable
{
    let id: String
    let name: String
    let emoji: String
    let color: String
    let focusMinutes: Int
    let sharePercentage: Int
}

private struct TopProjectMonthEntry:
    TimelineEntry
{
    let date: Date

    let project:
        TopProjectMonthProjectSnapshot?
}

private struct TopProjectMonthProvider:
    TimelineProvider
{
    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "analytics_widget_snapshot"

    private let sampleEntry =
        TopProjectMonthEntry(
            date: .now,
            project:
                TopProjectMonthProjectSnapshot(
                    id: "sample-project",
                    name: "Focus App",
                    emoji: "⌨️",
                    color: "#7EE081",
                    focusMinutes: 820,
                    sharePercentage: 62
                )
        )

    func placeholder(
        in context: Context
    ) -> TopProjectMonthEntry {
        sampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            TopProjectMonthEntry
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
            Timeline<TopProjectMonthEntry>
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
        -> TopProjectMonthEntry
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
                        TopProjectMonthSnapshot.self,
                        from: payloadData
                    )
        else {
            return TopProjectMonthEntry(
                date: .now,
                project: nil
            )
        }

        return TopProjectMonthEntry(
            date: .now,
            project:
                snapshot.month.topProject
        )
    }
}

private struct TopProjectMonthView:
    View
{
    let entry: TopProjectMonthEntry

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
            monthWidgetHex:
                project.color
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

                    Text("THIS MONTH")
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

struct TopProjectMonthWidget:
    Widget
{
    let kind =
        "TopProjectMonthWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider:
                TopProjectMonthProvider()
        ) { entry in
            if #available(
                iOS 17.0,
                *
            ) {
                TopProjectMonthView(
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
                TopProjectMonthView(
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
            "Top Project — Month"
        )
        .description(
            "Shows your most focused project this month."
        )
        .supportedFamilies([
            .systemSmall,
        ])
    }
}

private extension Color {
    init(monthWidgetHex: String) {
        let cleanedHex =
            monthWidgetHex
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
    as: .systemSmall
) {
    TopProjectMonthWidget()
} timeline: {
    TopProjectMonthEntry(
        date: .now,
        project:
            TopProjectMonthProjectSnapshot(
                id: "focus-app",
                name: "Focus App",
                emoji: "⌨️",
                color: "#7EE081",
                focusMinutes: 820,
                sharePercentage: 62
            )
    )

    TopProjectMonthEntry(
        date: .now,
        project: nil
    )
}
