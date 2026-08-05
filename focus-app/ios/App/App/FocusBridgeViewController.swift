//
//  FocusBridgeViewController.swift
//  App
//

import Capacitor
import UIKit

class FocusBridgeViewController:
    CAPBridgeViewController
{
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(
            FocusLiveActivityPlugin()
        )
    }
}
