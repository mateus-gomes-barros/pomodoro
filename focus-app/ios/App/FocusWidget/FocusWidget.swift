//
//  FocusWidget.swift
//  FocusWidget
//
//  Created by Mateus Gomes on 04/08/26.
//

import SwiftUI
import WidgetKit

struct StreakBadgeEntry: TimelineEntry {
    let date: Date
    let currentStreak: Int
    let longestStreak: Int
    let badgeName: String
    let badgeIcon: String
}

struct StreakBadgeProvider: TimelineProvider {
    private let sampleEntry = StreakBadgeEntry(
        date: .now,
        currentStreak: 4,
        longestStreak: 12,
        badgeName: "First Drop",
        badgeIcon: "💧"
    )

    func placeholder(
        in context: Context
    ) -> StreakBadgeEntry {
        sampleEntry
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            StreakBadgeEntry
        ) -> Void
    ) {
        completion(sampleEntry)
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (
            Timeline<StreakBadgeEntry>
        ) -> Void
    ) {
        let nextUpdate =
            Calendar.current.date(
                byAdding: .hour,
                value: 1,
                to: .now
            ) ?? .now.addingTimeInterval(3600)

        let timeline = Timeline(
            entries: [sampleEntry],
            policy: .after(nextUpdate)
        )

        completion(timeline)
    }
}

struct StreakBadgeView: View {
    let entry: StreakBadgeEntry

    private let accentColor = Color(
        red: 0.45,
        green: 0.95,
        blue: 0.64
    )

    private var streakUnit: String {
        entry.currentStreak == 1
            ? "day"
            : "days"
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            HStack {
                Text("STREAK")
                    .font(
                        .system(
                            size: 10,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .tracking(1.2)
                    .foregroundStyle(
                        Color.white.opacity(0.35)
                    )

                Spacer()

                HStack(spacing: 4) {
                    Image(
                        systemName: "trophy.fill"
                    )

                    Text(
                        "\(entry.longestStreak)"
                    )
                }
                .font(
                    .system(
                        size: 10,
                        weight: .semibold,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(0.4)
                )
            }

            Spacer(minLength: 8)

            HStack(
                alignment: .center,
                spacing: 12
            ) {
                ZStack {
                    RoundedRectangle(
                        cornerRadius: 16,
                        style: .continuous
                    )
                    .fill(
                        accentColor.opacity(0.1)
                    )

                    RoundedRectangle(
                        cornerRadius: 16,
                        style: .continuous
                    )
                    .stroke(
                        accentColor.opacity(0.18),
                        lineWidth: 1
                    )

                    Text(entry.badgeIcon)
                        .font(
                            .system(size: 29)
                        )
                }
                .frame(
                    width: 54,
                    height: 54
                )

                VStack(
                    alignment: .leading,
                    spacing: -2
                ) {
                    Text(
                        "\(entry.currentStreak)"
                    )
                    .font(
                        .system(
                            size: 40,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        accentColor
                    )
                    .minimumScaleFactor(0.7)

                    Text(streakUnit)
                        .font(
                            .system(
                                size: 11,
                                weight: .semibold,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(
                            Color.white.opacity(0.45)
                        )
                }
            }

            Spacer(minLength: 8)

            Text(entry.badgeName)
                .font(
                    .system(
                        size: 14,
                        weight: .semibold,
                        design: .rounded
                    )
                )
                .foregroundStyle(.white)
                .lineLimit(1)

            Text("Current badge")
                .font(
                    .system(
                        size: 10,
                        weight: .medium
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(0.3)
                )
                .padding(.top, 2)
        }
        .padding(15)
    }
}

struct FocusWidget: Widget {
    let kind = "StreakBadgeWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider: StreakBadgeProvider()
        ) { entry in
            if #available(iOS 17.0, *) {
                StreakBadgeView(
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
                StreakBadgeView(
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
            "Streak Badge"
        )
        .description(
            "Mostra sua ofensiva e sua insígnia atual."
        )
        .supportedFamilies([
            .systemSmall
        ])
    }
}

#Preview(
    as: .systemSmall
) {
    FocusWidget()
} timeline: {
    StreakBadgeEntry(
        date: .now,
        currentStreak: 4,
        longestStreak: 12,
        badgeName: "First Drop",
        badgeIcon: "💧"
    )
}