//
//  SixMonthHistoryWidget.swift
//  FocusWidget
//

import Foundation
import SwiftUI
import WidgetKit

private struct SixMonthWidgetSnapshot:
    Decodable
{
    let sixMonthHistory:
        SixMonthHistorySnapshot
}

private struct SixMonthHistorySnapshot:
    Decodable
{
    let totalFocusMinutes: Int
    let averageMonthlyFocusMinutes: Int

    let latestMonthChangePercentage:
        Int?

    let bestMonth:
        SixMonthSnapshot?

    let topProject:
        SixMonthProjectSnapshot?

    let months: [
        SixMonthSnapshot
    ]
}

private struct SixMonthSnapshot:
    Decodable,
    Identifiable
{
    var id: String {
        key
    }

    let key: String
    let label: String
    let fullLabel: String
    let focusMinutes: Int
    let sessionsCompleted: Int
    let activeDays: Int

    let topProject:
        SixMonthProjectSnapshot?
}

private struct SixMonthProjectSnapshot:
    Decodable
{
    let id: String
    let name: String
    let emoji: String
    let color: String
    let focusMinutes: Int
}

private struct SixMonthHistoryEntry:
    TimelineEntry
{
    let date: Date
    let history: SixMonthHistorySnapshot
}

private struct SixMonthHistoryProvider:
    TimelineProvider
{
    private let appGroupIdentifier =
        "group.com.mateusgomes.focusapp.shared"

    private let snapshotKey =
        "analytics_widget_snapshot"

    private let sampleHistory =
        SixMonthHistorySnapshot(
            totalFocusMinutes: 3480,
            averageMonthlyFocusMinutes: 580,
            latestMonthChangePercentage: 18,
            bestMonth:
                SixMonthSnapshot(
                    key: "2026-07",
                    label: "Jul",
                    fullLabel: "July 2026",
                    focusMinutes: 820,
                    sessionsCompleted: 32,
                    activeDays: 18,
                    topProject:
                        SixMonthProjectSnapshot(
                            id: "focus-app",
                            name: "Focus App",
                            emoji: "⌨️",
                            color: "#7EE081",
                            focusMinutes: 410
                        )
                ),
            topProject:
                SixMonthProjectSnapshot(
                    id: "focus-app",
                    name: "Focus App",
                    emoji: "⌨️",
                    color: "#7EE081",
                    focusMinutes: 1280
                ),
            months: [
                SixMonthSnapshot(
                    key: "2026-03",
                    label: "Mar",
                    fullLabel: "March 2026",
                    focusMinutes: 380,
                    sessionsCompleted: 15,
                    activeDays: 9,
                    topProject:
                        SixMonthProjectSnapshot(
                            id: "studies",
                            name: "Studies",
                            emoji: "📚",
                            color: "#7EA8E0",
                            focusMinutes: 190
                        )
                ),

                SixMonthSnapshot(
                    key: "2026-04",
                    label: "Apr",
                    fullLabel: "April 2026",
                    focusMinutes: 520,
                    sessionsCompleted: 21,
                    activeDays: 12,
                    topProject:
                        SixMonthProjectSnapshot(
                            id: "focus-app",
                            name: "Focus App",
                            emoji: "⌨️",
                            color: "#7EE081",
                            focusMinutes: 260
                        )
                ),

                SixMonthSnapshot(
                    key: "2026-05",
                    label: "May",
                    fullLabel: "May 2026",
                    focusMinutes: 610,
                    sessionsCompleted: 24,
                    activeDays: 14,
                    topProject:
                        SixMonthProjectSnapshot(
                            id: "work",
                            name: "Work",
                            emoji: "🚀",
                            color: "#B67EE0",
                            focusMinutes: 280
                        )
                ),

                SixMonthSnapshot(
                    key: "2026-06",
                    label: "Jun",
                    fullLabel: "June 2026",
                    focusMinutes: 470,
                    sessionsCompleted: 18,
                    activeDays: 11,
                    topProject:
                        SixMonthProjectSnapshot(
                            id: "studies",
                            name: "Studies",
                            emoji: "📚",
                            color: "#7EA8E0",
                            focusMinutes: 220
                        )
                ),

                SixMonthSnapshot(
                    key: "2026-07",
                    label: "Jul",
                    fullLabel: "July 2026",
                    focusMinutes: 820,
                    sessionsCompleted: 32,
                    activeDays: 18,
                    topProject:
                        SixMonthProjectSnapshot(
                            id: "focus-app",
                            name: "Focus App",
                            emoji: "⌨️",
                            color: "#7EE081",
                            focusMinutes: 410
                        )
                ),

                SixMonthSnapshot(
                    key: "2026-08",
                    label: "Aug",
                    fullLabel: "August 2026",
                    focusMinutes: 680,
                    sessionsCompleted: 27,
                    activeDays: 15,
                    topProject:
                        SixMonthProjectSnapshot(
                            id: "focus-app",
                            name: "Focus App",
                            emoji: "⌨️",
                            color: "#7EE081",
                            focusMinutes: 350
                        )
                ),
            ]
        )

    func placeholder(
        in context: Context
    ) -> SixMonthHistoryEntry {
        SixMonthHistoryEntry(
            date: .now,
            history: sampleHistory
        )
    }

    func getSnapshot(
        in context: Context,
        completion: @escaping (
            SixMonthHistoryEntry
        ) -> Void
    ) {
        if context.isPreview {
            completion(
                SixMonthHistoryEntry(
                    date: .now,
                    history: sampleHistory
                )
            )

            return
        }

        completion(loadEntry())
    }

    func getTimeline(
        in context: Context,
        completion: @escaping (
            Timeline<SixMonthHistoryEntry>
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
        -> SixMonthHistoryEntry
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
                        SixMonthWidgetSnapshot.self,
                        from: payloadData
                    )
        else {
            return SixMonthHistoryEntry(
                date: .now,
                history:
                    SixMonthHistorySnapshot(
                        totalFocusMinutes: 0,
                        averageMonthlyFocusMinutes: 0,
                        latestMonthChangePercentage: nil,
                        bestMonth: nil,
                        topProject: nil,
                        months: []
                    )
            )
        }

        return SixMonthHistoryEntry(
            date: .now,
            history:
                snapshot.sixMonthHistory
        )
    }
}

private struct SixMonthHistoryView:
    View
{
    let entry: SixMonthHistoryEntry

    private var history:
        SixMonthHistorySnapshot
    {
        entry.history
    }

    private var accentColor: Color {
        guard let topProject =
            history.topProject
        else {
            return Color(
                red: 0.45,
                green: 0.95,
                blue: 0.64
            )
        }

        return Color(
            historyWidgetHex:
                topProject.color
        )
    }

    private var maximumFocusMinutes: Int {
        max(
            history.months
                .map(\.focusMinutes)
                .max() ?? 0,
            1
        )
    }

    private var hasFocusData: Bool {
        history.totalFocusMinutes > 0
    }

    var body: some View {
        ZStack {
            RadialGradient(
                colors: [
                    accentColor.opacity(
                        hasFocusData
                            ? 0.18
                            : 0.07
                    ),

                    accentColor.opacity(0),
                ],
                center: .topTrailing,
                startRadius: 0,
                endRadius: 330
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

            if hasFocusData {
                content
            } else {
                emptyState
            }
        }
    }

    private var content: some View {
        VStack(
            alignment: .leading,
            spacing: 0
        ) {
            header

            monthChart
                .padding(.top, 18)

            summaryCards
                .padding(.top, 16)
        }
        .padding(17)
    }

    private var header: some View {
        HStack(
            alignment: .top,
            spacing: 14
        ) {
            VStack(
                alignment: .leading,
                spacing: 4
            ) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(accentColor)
                        .frame(
                            width: 5,
                            height: 5
                        )

                    Text("LAST 6 MONTHS")
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
                                0.36
                            )
                        )
                }

                Text("Focus History")
                    .font(
                        .system(
                            size: 18,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.93
                        )
                    )
            }

            Spacer(minLength: 8)

            VStack(
                alignment: .trailing,
                spacing: 3
            ) {
                Text(
                    formatDuration(
                        history.totalFocusMinutes
                    )
                )
                .font(
                    .system(
                        size: 15,
                        weight: .semibold,
                        design: .monospaced
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.82
                    )
                )

                Text(
                    "\(formatDuration(history.averageMonthlyFocusMinutes)) average"
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
                        0.29
                    )
                )

                changeBadge
                    .padding(.top, 3)
            }
        }
    }

    @ViewBuilder
    private var changeBadge: some View {
        if let change =
            history.latestMonthChangePercentage
        {
            HStack(spacing: 3) {
                Image(
                    systemName:
                        change > 0
                            ? "arrow.up.right"
                            : change < 0
                                ? "arrow.down.right"
                                : "minus"
                )

                Text(
                    change > 0
                        ? "+\(change)%"
                        : "\(change)%"
                )
            }
            .font(
                .system(
                    size: 9,
                    weight: .bold,
                    design: .rounded
                )
            )
            .foregroundStyle(
                change > 0
                    ? accentColor
                    : change < 0
                        ? Color(
                            red: 0.98,
                            green: 0.45,
                            blue: 0.45
                        )
                        : Color.white.opacity(
                            0.35
                        )
            )
            .padding(
                .horizontal,
                7
            )
            .padding(
                .vertical,
                4
            )
            .background(
                Capsule()
                    .fill(
                        change > 0
                            ? accentColor.opacity(
                                0.1
                            )
                            : change < 0
                                ? Color.red.opacity(
                                    0.09
                                )
                                : Color.white.opacity(
                                    0.05
                                )
                    )
            )
        }
    }

    private var monthChart: some View {
        HStack(
            alignment: .bottom,
            spacing: 8
        ) {
            ForEach(
                Array(
                    history.months
                        .enumerated()
                ),
                id: \.element.id
            ) { index, month in
                monthColumn(
                    month: month,
                    isCurrentMonth:
                        index ==
                        history.months.count - 1
                )
            }
        }
        .frame(maxWidth: .infinity)
    }

    private func monthColumn(
        month: SixMonthSnapshot,
        isCurrentMonth: Bool
    ) -> some View {
        let projectColor = Color(
            historyWidgetHex:
                month.topProject?.color ??
                "#7EE081"
        )

        return VStack(spacing: 6) {
            Text(
                formatCompactDuration(
                    month.focusMinutes
                )
            )
            .font(
                .system(
                    size: 8,
                    weight: .semibold,
                    design: .monospaced
                )
            )
            .foregroundStyle(
                Color.white.opacity(
                    month.focusMinutes > 0
                        ? 0.5
                        : 0.18
                )
            )
            .lineLimit(1)
            .minimumScaleFactor(0.65)

            GeometryReader { proxy in
                let availableHeight =
                    max(
                        proxy.size.height - 23,
                        1
                    )

                let percentage =
                    Double(
                        month.focusMinutes
                    ) /
                    Double(
                        maximumFocusMinutes
                    )

                let barHeight =
                    month.focusMinutes > 0
                        ? max(
                            availableHeight *
                            percentage,
                            8
                        )
                        : 2

                VStack(spacing: 4) {
                    Spacer(minLength: 0)

                    Text(
                        month.topProject?.emoji ?? ""
                    )
                    .font(
                        .system(size: 15)
                    )
                    .frame(height: 18)
                    .opacity(
                        month.topProject == nil
                            ? 0
                            : 1
                    )

                    RoundedRectangle(
                        cornerRadius: 6,
                        style: .continuous
                    )
                    .fill(
                        LinearGradient(
                            colors: [
                                projectColor.opacity(
                                    month.focusMinutes > 0
                                        ? 0.95
                                        : 0.1
                                ),

                                projectColor.opacity(
                                    month.focusMinutes > 0
                                        ? 0.34
                                        : 0.04
                                ),
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                    .frame(height: barHeight)
                    .overlay {
                        if isCurrentMonth &&
                            month.focusMinutes > 0
                        {
                            RoundedRectangle(
                                cornerRadius: 6,
                                style: .continuous
                            )
                            .stroke(
                                Color.white.opacity(
                                    0.14
                                ),
                                lineWidth: 1
                            )
                        }
                    }
                }
                .frame(
                    maxWidth: .infinity,
                    maxHeight: .infinity
                )
            }
            .frame(height: 125)

            Text(
                month.label.uppercased()
            )
            .font(
                .system(
                    size: 9,
                    weight:
                        isCurrentMonth
                            ? .bold
                            : .semibold,
                    design: .rounded
                )
            )
            .foregroundStyle(
                isCurrentMonth
                    ? projectColor
                    : Color.white.opacity(
                        0.36
                    )
            )

            Text(
                "\(month.activeDays)d"
            )
            .font(
                .system(
                    size: 8,
                    weight: .medium,
                    design: .rounded
                )
            )
            .foregroundStyle(
                Color.white.opacity(
                    0.2
                )
            )
        }
        .frame(maxWidth: .infinity)
    }

    private var summaryCards: some View {
        HStack(spacing: 10) {
            bestMonthCard

            topProjectCard
        }
    }

    private var bestMonthCard: some View {
        HStack(spacing: 10) {
            ZStack {
                RoundedRectangle(
                    cornerRadius: 11,
                    style: .continuous
                )
                .fill(
                    Color(
                        red: 1,
                        green: 0.75,
                        blue: 0.25
                    )
                    .opacity(0.09)
                )

                Image(
                    systemName: "trophy.fill"
                )
                .font(
                    .system(size: 14)
                )
                .foregroundStyle(
                    Color(
                        red: 1,
                        green: 0.75,
                        blue: 0.25
                    )
                    .opacity(0.85)
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
                Text("BEST MONTH")
                    .font(
                        .system(
                            size: 8,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .tracking(0.75)
                    .foregroundStyle(
                        Color.white.opacity(
                            0.24
                        )
                    )

                Text(
                    history.bestMonth?.fullLabel ??
                    "No data"
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
                        0.7
                    )
                )
                .lineLimit(1)
                .minimumScaleFactor(0.7)

                Text(
                    formatDuration(
                        history.bestMonth?.focusMinutes ?? 0
                    )
                )
                .font(
                    .system(
                        size: 9,
                        weight: .medium,
                        design: .monospaced
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.32
                    )
                )
            }

            Spacer(minLength: 0)
        }
        .padding(11)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(
                cornerRadius: 15,
                style: .continuous
            )
            .fill(
                Color.white.opacity(
                    0.028
                )
            )
            .overlay {
                RoundedRectangle(
                    cornerRadius: 15,
                    style: .continuous
                )
                .stroke(
                    Color.white.opacity(
                        0.055
                    ),
                    lineWidth: 1
                )
            }
        )
    }

    private var topProjectCard: some View {
        HStack(spacing: 10) {
            ZStack {
                RoundedRectangle(
                    cornerRadius: 11,
                    style: .continuous
                )
                .fill(
                    accentColor.opacity(
                        0.09
                    )
                )

                Text(
                    history.topProject?.emoji ?? "—"
                )
                .font(
                    .system(size: 17)
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
                Text("TOP PROJECT")
                    .font(
                        .system(
                            size: 8,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .tracking(0.75)
                    .foregroundStyle(
                        Color.white.opacity(
                            0.24
                        )
                    )

                Text(
                    history.topProject?.name ??
                    "No project"
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
                        0.7
                    )
                )
                .lineLimit(1)
                .minimumScaleFactor(0.7)

                Text(
                    formatDuration(
                        history.topProject?.focusMinutes ?? 0
                    )
                )
                .font(
                    .system(
                        size: 9,
                        weight: .medium,
                        design: .monospaced
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.32
                    )
                )
            }

            Spacer(minLength: 0)
        }
        .padding(11)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(
                cornerRadius: 15,
                style: .continuous
            )
            .fill(
                Color.white.opacity(
                    0.028
                )
            )
            .overlay {
                RoundedRectangle(
                    cornerRadius: 15,
                    style: .continuous
                )
                .stroke(
                    Color.white.opacity(
                        0.055
                    ),
                    lineWidth: 1
                )
            }
        )
    }

    private var emptyState: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(
                        accentColor.opacity(
                            0.08
                        )
                    )

                Image(
                    systemName: "chart.bar.fill"
                )
                .font(
                    .system(size: 25)
                )
                .foregroundStyle(
                    Color.white.opacity(
                        0.2
                    )
                )
            }
            .frame(
                width: 62,
                height: 62
            )

            VStack(spacing: 5) {
                Text("No focus history yet")
                    .font(
                        .system(
                            size: 15,
                            weight: .semibold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.48
                        )
                    )

                Text(
                    "Complete Pomodoro sessions to build your six-month history."
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
                        0.25
                    )
                )
                .multilineTextAlignment(
                    .center
                )
                .frame(maxWidth: 210)
            }
        }
        .frame(
            maxWidth: .infinity,
            maxHeight: .infinity
        )
        .padding(20)
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

    private func formatCompactDuration(
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

        return "\(hours)h\(remainingMinutes)"
    }
}

struct SixMonthHistoryWidget:
    Widget
{
    let kind =
        "SixMonthHistoryWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(
            kind: kind,
            provider:
                SixMonthHistoryProvider()
        ) { entry in
            if #available(
                iOS 17.0,
                *
            ) {
                SixMonthHistoryView(
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
                SixMonthHistoryView(
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
            "Six-Month Focus History"
        )
        .description(
            "Shows your focus history from the last six months."
        )
        .supportedFamilies([
            .systemLarge,
        ])
    }
}

private extension Color {
    init(historyWidgetHex: String) {
        let cleanedHex =
            historyWidgetHex
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
    as: .systemLarge
) {
    SixMonthHistoryWidget()
} timeline: {
    SixMonthHistoryEntry(
        date: .now,
        history:
            SixMonthHistorySnapshot(
                totalFocusMinutes: 3480,
                averageMonthlyFocusMinutes: 580,
                latestMonthChangePercentage: 18,
                bestMonth:
                    SixMonthSnapshot(
                        key: "2026-07",
                        label: "Jul",
                        fullLabel: "July 2026",
                        focusMinutes: 820,
                        sessionsCompleted: 32,
                        activeDays: 18,
                        topProject:
                            SixMonthProjectSnapshot(
                                id: "focus-app",
                                name: "Focus App",
                                emoji: "⌨️",
                                color: "#7EE081",
                                focusMinutes: 410
                            )
                    ),
                topProject:
                    SixMonthProjectSnapshot(
                        id: "focus-app",
                        name: "Focus App",
                        emoji: "⌨️",
                        color: "#7EE081",
                        focusMinutes: 1280
                    ),
                months: [
                    SixMonthSnapshot(
                        key: "2026-03",
                        label: "Mar",
                        fullLabel: "March 2026",
                        focusMinutes: 380,
                        sessionsCompleted: 15,
                        activeDays: 9,
                        topProject:
                            SixMonthProjectSnapshot(
                                id: "studies",
                                name: "Studies",
                                emoji: "📚",
                                color: "#7EA8E0",
                                focusMinutes: 190
                            )
                    ),

                    SixMonthSnapshot(
                        key: "2026-04",
                        label: "Apr",
                        fullLabel: "April 2026",
                        focusMinutes: 520,
                        sessionsCompleted: 21,
                        activeDays: 12,
                        topProject:
                            SixMonthProjectSnapshot(
                                id: "focus-app",
                                name: "Focus App",
                                emoji: "⌨️",
                                color: "#7EE081",
                                focusMinutes: 260
                            )
                    ),

                    SixMonthSnapshot(
                        key: "2026-05",
                        label: "May",
                        fullLabel: "May 2026",
                        focusMinutes: 610,
                        sessionsCompleted: 24,
                        activeDays: 14,
                        topProject:
                            SixMonthProjectSnapshot(
                                id: "work",
                                name: "Work",
                                emoji: "🚀",
                                color: "#B67EE0",
                                focusMinutes: 280
                            )
                    ),

                    SixMonthSnapshot(
                        key: "2026-06",
                        label: "Jun",
                        fullLabel: "June 2026",
                        focusMinutes: 470,
                        sessionsCompleted: 18,
                        activeDays: 11,
                        topProject:
                            SixMonthProjectSnapshot(
                                id: "studies",
                                name: "Studies",
                                emoji: "📚",
                                color: "#7EA8E0",
                                focusMinutes: 220
                            )
                    ),

                    SixMonthSnapshot(
                        key: "2026-07",
                        label: "Jul",
                        fullLabel: "July 2026",
                        focusMinutes: 820,
                        sessionsCompleted: 32,
                        activeDays: 18,
                        topProject:
                            SixMonthProjectSnapshot(
                                id: "focus-app",
                                name: "Focus App",
                                emoji: "⌨️",
                                color: "#7EE081",
                                focusMinutes: 410
                            )
                    ),

                    SixMonthSnapshot(
                        key: "2026-08",
                        label: "Aug",
                        fullLabel: "August 2026",
                        focusMinutes: 680,
                        sessionsCompleted: 27,
                        activeDays: 15,
                        topProject:
                            SixMonthProjectSnapshot(
                                id: "focus-app",
                                name: "Focus App",
                                emoji: "⌨️",
                                color: "#7EE081",
                                focusMinutes: 350
                            )
                    ),
                ]
            )
    )
}
