//
//  FocusWidgetBundle.swift
//  FocusWidget
//
//  Created by Mateus Gomes on 04/08/26.
//

import SwiftUI
import WidgetKit

@main
struct FocusWidgetBundle: WidgetBundle {
    var body: some Widget {
        FocusWidget()
        TopProjectWeekWidget()
        TopProjectMonthWidget()
        TopProjectsWeekWidget()
        SixMonthHistoryWidget()
        WeeklyActivityWidget()
        MonthlyActivityWidget()
        GoalsWidget()
        FocusLiveActivity()

        if #available(iOS 18.0, *) {
            FocusWidgetControl()
        }
    }
}
