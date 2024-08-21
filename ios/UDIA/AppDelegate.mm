#import "AppDelegate.h"
#import <Firebase.h>
#import <GoogleMaps/GoogleMaps.h>
#import <React/RCTBundleURLProvider.h>



@implementation AppDelegate

//@interface AppDelegate : UIResponder <UIApplicationDelegate, RCTBridgeDelegate, UNUserNotificationCenterDelegate>

//@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate>


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  [GMSServices provideAPIKey:@"AIzaSyDRI5Lx8apUI3bX9gyZ01eyaB7A7rZn-p4"]; 
  [FIRApp configure];
  [application registerForRemoteNotifications];
  
  
  
  self.moduleName = @"foodlakh";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  


  self.initialProps = @{};

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)application:(UIApplication *)application
 didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
 [FIRMessaging messaging].APNSToken = deviceToken;
}



- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self getBundleURL];
}

- (NSURL *)getBundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


@end
