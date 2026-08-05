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

    private var streakText: String {
        entry.currentStreak == 1
            ? "day streak"
            : "days streak"
    }

    var body: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            HStack(
                alignment: .top,
                spacing: 10
            ) {
                ZStack {
                    RoundedRectangle(
                        cornerRadius: 14,
                        style: .continuous
                    )
                    .fill(
                        Color.white.opacity(0.07)
                    )

                    RoundedRectangle(
                        cornerRadius: 14,
                        style: .continuous
                    )
                    .stroke(
                        Color.white.opacity(0.08),
                        lineWidth: 1
                    )

                    Text(entry.badgeIcon)
                        .font(.system(size: 27))
                }
                .frame(
                    width: 48,
                    height: 48
                )

                Spacer(minLength: 4)

                Text(
                    "\(entry.currentStreak)"
                )
                .font(
                    .system(
                        size: 42,
                        weight: .bold,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    Color(
                        red: 0.45,
                        green: 0.95,
                        blue: 0.64
                    )
                )
                .minimumScaleFactor(0.75)
            }

            Spacer(minLength: 8)

            Text(entry.badgeName)
                .font(
                    .system(
                        size: 15,
                        weight: .semibold,
                        design: .rounded
                    )
                )
                .foregroundStyle(.white)
                .lineLimit(1)

            Text(streakText)
                .font(
                    .system(
                        size: 12,
                        weight: .medium
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(0.5)
                )

            HStack(spacing: 5) {
                Image(
                    systemName: "trophy.fill"
                )
                .font(.system(size: 9))

                Text(
                    "Best \(entry.longestStreak)"
                )
                .font(
                    .system(
                        size: 10,
                        weight: .semibold
                    )
                )
            }
            .foregroundStyle(
                Color.white.opacity(0.35)
            )
            .padding(.top, 7)
        }
        .padding(16)
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