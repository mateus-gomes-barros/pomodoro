//
//  FocusLiveActivity.swift
//  FocusWidget
//

import ActivityKit
import Foundation
import SwiftUI
import WidgetKit

private let focusAccentColor = Color(
    red: 0.45,
    green: 0.95,
    blue: 0.64
)

private struct NativeStreakBadgeMark:
    View
{
    let level: Int
    let size: CGFloat

    private var symbolName: String {
        if level >= 2000 {
            return "infinity"
        }

        if level >= 1500 {
            return "trophy.fill"
        }

        if level >= 1000 {
            return "crown.fill"
        }

        if level >= 750 {
            return "eye.fill"
        }

        if level >= 600 {
            return "diamond.fill"
        }

        if level >= 500 {
            return "sun.max.fill"
        }

        if level >= 365 {
            return "calendar"
        }

        if level >= 300 {
            return "3.circle.fill"
        }

        if level >= 200 {
            return "medal.fill"
        }

        if level >= 150 {
            return "sparkles"
        }

        if level >= 100 {
            return "star.fill"
        }

        if level >= 75 {
            return "moon.stars.fill"
        }

        if level >= 50 {
            return "rocket.fill"
        }

        if level >= 30 {
            return "bolt.fill"
        }

        if level >= 14 {
            return "heart.fill"
        }

        if level >= 7 {
            return "flame.fill"
        }

        if level >= 3 {
            return "leaf.fill"
        }

        return "drop.fill"
    }

    var body: some View {
        ZStack {
            Circle()
                .fill(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(
                                0.16
                            ),
                            focusAccentColor
                                .opacity(0.12),
                            Color.black.opacity(
                                0.34
                            ),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )

            Circle()
                .stroke(
                    LinearGradient(
                        colors: [
                            Color.white.opacity(
                                0.38
                            ),
                            focusAccentColor
                                .opacity(0.55),
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth:
                        max(0.8, size * 0.045)
                )

            Circle()
                .stroke(
                    focusAccentColor
                        .opacity(0.14),
                    lineWidth:
                        max(0.6, size * 0.025)
                )
                .padding(size * 0.13)

            Image(
                systemName: symbolName
            )
            .font(
                .system(
                    size: size * 0.42,
                    weight: .semibold
                )
            )
            .foregroundStyle(
                LinearGradient(
                    colors: [
                        .white,
                        focusAccentColor,
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
        }
        .frame(
            width: size,
            height: size
        )
        .shadow(
            color:
                focusAccentColor
                    .opacity(0.16),
            radius: size * 0.16,
            y: size * 0.08
        )
        .accessibilityHidden(true)
    }
}

private extension FocusActivityAttributes.SessionType {
    var title: String {
        switch self {
        case .work:
            return "FOCUS"

        case .shortBreak:
            return "SHORT BREAK"

        case .longBreak:
            return "LONG BREAK"
        }
    }

    var compactIcon: String {
        switch self {
        case .work:
            return "timer"

        case .shortBreak:
            return "cup.and.saucer.fill"

        case .longBreak:
            return "moon.stars.fill"
        }
    }
}

private extension FocusActivityAttributes.TimerStatus {
    var title: String {
        switch self {
        case .running:
            return "Running"

        case .paused:
            return "Paused"
        }
    }
}

private struct FocusActivityTimerText: View {
    let state: FocusActivityAttributes.ContentState
    let fontSize: CGFloat

    private var formattedRemainingTime: String {
        let safeSeconds = max(
            0,
            state.remainingSeconds
        )

        let hours = safeSeconds / 3600
        let minutes =
            (safeSeconds % 3600) / 60
        let seconds = safeSeconds % 60

        if hours > 0 {
            return String(
                format: "%d:%02d:%02d",
                hours,
                minutes,
                seconds
            )
        }

        return String(
            format: "%02d:%02d",
            minutes,
            seconds
        )
    }

    var body: some View {
        Group {
            if
                state.status == .running,
                let endDate = state.endDate
            {
                Text(
                    timerInterval:
                        Date()...max(
                            endDate,
                            Date().addingTimeInterval(1)
                        ),
                    countsDown: true
                )
            } else {
                Text(formattedRemainingTime)
            }
        }
        .font(
            .system(
                size: fontSize,
                weight: .bold,
                design: .rounded
            )
        )
        .monospacedDigit()
        .lineLimit(1)
        .minimumScaleFactor(0.65)
    }
}

private struct FocusProjectTitleView: View {
    let state: FocusActivityAttributes.ContentState
    let fontSize: CGFloat

    var body: some View {
        if
            let projectName = state.projectName,
            !projectName.isEmpty
        {
            HStack(spacing: 6) {
                NativeStreakBadgeMark(
                    level: state.badgeLevel,
                    size: fontSize + 9
                )

                Text(projectName)
                    .font(
                        .system(
                            size: fontSize,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                    .truncationMode(.tail)
            }
            .frame(
                maxWidth: .infinity,
                alignment: .center
            )
            .multilineTextAlignment(.center)
        }
    }
}

private struct FocusLockScreenDetailsView: View {
    let state: FocusActivityAttributes.ContentState

    private var hasProject: Bool {
        guard let projectName =
            state.projectName
        else {
            return false
        }

        return !projectName.isEmpty
    }

    private var hasTask: Bool {
        guard let taskName =
            state.taskName
        else {
            return false
        }

        return !taskName.isEmpty
    }

    var body: some View {
        if hasProject || hasTask {
            VStack(spacing: 4) {
                FocusProjectTitleView(
                    state: state,
                    fontSize: 15
                )

                if
                    let taskName =
                        state.taskName,
                    !taskName.isEmpty
                {
                    Text(taskName)
                        .font(
                            .system(
                                size: 11,
                                weight: .medium,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(
                            Color.white.opacity(
                                0.55
                            )
                        )
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                        .truncationMode(.tail)
                }
            }
            .frame(
                maxWidth: .infinity,
                alignment: .center
            )
            .multilineTextAlignment(.center)
            .padding(.horizontal, 16)
        }
    }
}

private struct FocusExpandedDetailsView: View {
    let state: FocusActivityAttributes.ContentState

    var body: some View {
        VStack(spacing: 2) {
            FocusProjectTitleView(
                state: state,
                fontSize: 12
            )

            if
                let taskName =
                    state.taskName,
                !taskName.isEmpty
            {
                Text(taskName)
                    .font(
                        .system(
                            size: 10,
                            weight: .medium,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(
                        Color.white.opacity(
                            0.55
                        )
                    )
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                    .truncationMode(.tail)
            }
        }
        .frame(
            maxWidth: .infinity,
            alignment: .center
        )
        .multilineTextAlignment(.center)
        .padding(.horizontal, 38)
        .padding(.top, 1)
        .padding(.bottom, 2)
    }
}

private struct FocusLockScreenActivityView: View {
    let context:
        ActivityViewContext<
            FocusActivityAttributes
        >

    private var state:
        FocusActivityAttributes.ContentState
    {
        context.state
    }

    var body: some View {
        VStack(spacing: 10) {
            HStack(spacing: 6) {
                Image(
                    systemName:
                        state.sessionType
                            .compactIcon
                )
                .font(
                    .system(
                        size: 13,
                        weight: .semibold
                    )
                )

                Text(
                    state.sessionType.title
                )
                .font(
                    .system(
                        size: 12,
                        weight: .bold,
                        design: .rounded
                    )
                )
                .tracking(1.3)
            }
            .foregroundStyle(
                focusAccentColor
            )
            .lineLimit(1)

            FocusActivityTimerText(
                state: state,
                fontSize: 38
            )
            .foregroundStyle(.white)
            .frame(
                maxWidth: .infinity,
                alignment: .center
            )

            Text(state.status.title)
                .font(
                    .system(
                        size: 11,
                        weight: .medium,
                        design: .rounded
                    )
                )
                .foregroundStyle(
                    Color.white.opacity(0.45)
                )

            Rectangle()
                .fill(
                    Color.white.opacity(0.08)
                )
                .frame(height: 1)
                .padding(.horizontal, 2)

            FocusLockScreenDetailsView(
                state: state
            )
        }
        .frame(
            maxWidth: .infinity,
            alignment: .center
        )
        .multilineTextAlignment(.center)
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .activityBackgroundTint(
            Color(
                red: 0.035,
                green: 0.035,
                blue: 0.04
            )
        )
        .activitySystemActionForegroundColor(
            .white
        )
    }
}

struct FocusLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(
            for: FocusActivityAttributes.self
        ) { context in
            FocusLockScreenActivityView(
                context: context
            )
            .widgetURL(
                URL(
                    string:
                        "com.mateusgomes.focusapp://timer"
                )
            )
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(
                    .leading
                ) {
                    HStack {
                        ZStack {
                            Circle()
                                .fill(
                                    focusAccentColor
                                        .opacity(0.14)
                                )

                            Image(
                                systemName:
                                    context
                                        .state
                                        .sessionType
                                        .compactIcon
                            )
                            .font(
                                .system(
                                    size: 14,
                                    weight: .semibold
                                )
                            )
                            .foregroundStyle(
                                focusAccentColor
                            )
                        }
                        .frame(
                            width: 36,
                            height: 36
                        )
                    }
                    .frame(
                        width: 72,
                        alignment: .center
                    )
                }

                DynamicIslandExpandedRegion(
                    .trailing
                ) {
                    HStack {
                        FocusActivityTimerText(
                            state: context.state,
                            fontSize: 18
                        )
                        .foregroundStyle(.white)
                    }
                    .frame(
                        width: 72,
                        alignment: .center
                    )
                }

                DynamicIslandExpandedRegion(
                    .center
                ) {
                    Text(
                        context
                            .state
                            .sessionType
                            .title
                    )
                    .font(
                        .system(
                            size: 10,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .tracking(1.2)
                    .foregroundStyle(
                        focusAccentColor
                    )
                    .lineLimit(1)
                    .frame(
                        maxWidth: .infinity,
                        alignment: .center
                    )
                }

                DynamicIslandExpandedRegion(
                    .bottom
                ) {
                    FocusExpandedDetailsView(
                        state: context.state
                    )
                }
            } compactLeading: {
                Image(
                    systemName:
                        context
                            .state
                            .sessionType
                            .compactIcon
                )
                .font(
                    .system(
                        size: 13,
                        weight: .semibold
                    )
                )
                .foregroundStyle(
                    focusAccentColor
                )
            } compactTrailing: {
                FocusActivityTimerText(
                    state: context.state,
                    fontSize: 13
                )
                .foregroundStyle(
                    focusAccentColor
                )
                .frame(
                    width: 54,
                    alignment: .center
                )
            } minimal: {
                Image(
                    systemName:
                        context
                            .state
                            .sessionType
                            .compactIcon
                )
                .font(
                    .system(
                        size: 12,
                        weight: .bold
                    )
                )
                .foregroundStyle(
                    focusAccentColor
                )
            }
            .widgetURL(
                URL(
                    string:
                        "com.mateusgomes.focusapp://timer"
                )
            )
            .keylineTint(
                focusAccentColor
            )
        }
    }
}