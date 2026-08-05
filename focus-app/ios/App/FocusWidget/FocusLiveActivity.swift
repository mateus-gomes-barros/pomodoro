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
                if
                    let projectName =
                        state.projectName,
                    !projectName.isEmpty
                {
                    Text(projectName)
                        .font(
                            .system(
                                size: 15,
                                weight: .bold,
                                design: .rounded
                            )
                        )
                        .foregroundStyle(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.65)
                        .truncationMode(.tail)
                }

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
            if
                let projectName =
                    state.projectName,
                !projectName.isEmpty
            {
                Text(projectName)
                    .font(
                        .system(
                            size: 12,
                            weight: .bold,
                            design: .rounded
                        )
                    )
                    .foregroundStyle(.white)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                    .truncationMode(.tail)
            }

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
