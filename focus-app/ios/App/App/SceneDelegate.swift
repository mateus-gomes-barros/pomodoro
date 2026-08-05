import UIKit
import Capacitor

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(
        _ scene: UIScene,
        willConnectTo session: UISceneSession,
        options connectionOptions: UIScene.ConnectionOptions
    ) {
        guard let windowScene = scene as? UIWindowScene else {
            return
        }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = CAPBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(
            scene,
            willConnectTo: session,
            options: connectionOptions
        )

        print("FOCUS TEST: Scene connected")

        DispatchQueue.main.asyncAfter(
            deadline: .now() + 1
        ) {
            if #available(iOS 16.2, *) {
                print("FOCUS TEST: Starting Live Activity")
                FocusLiveActivityTest.start()
            }
        }
    }

    func sceneDidBecomeActive(
        _ scene: UIScene
    ) {
        print("FOCUS TEST: Scene became active")
    }

    func scene(
        _ scene: UIScene,
        openURLContexts URLContexts: Set<UIOpenURLContext>
    ) {
        SceneDelegateProxy.shared.scene(
            scene,
            openURLContexts: URLContexts
        )
    }

    func scene(
        _ scene: UIScene,
        continue userActivity: NSUserActivity
    ) {
        SceneDelegateProxy.shared.scene(
            scene,
            continue: userActivity
        )
    }
}