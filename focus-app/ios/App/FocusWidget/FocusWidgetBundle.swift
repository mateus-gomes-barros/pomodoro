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
        WeeklyActivityWidget()
        MonthlyActivityWidget()
        GoalsWidget()
        FocusLiveActivity()
        FocusWidgetControl()
    }
}