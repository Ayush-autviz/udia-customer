/**
 * @format
 */

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { createStore } from 'redux';
import allReducers from './src/reducers/index.js';
import { Provider } from 'react-redux';
import { NotificationProvider } from './src/context/NotificationProvider.js';
import PushNotification from 'react-native-push-notification';
import messaging from '@react-native-firebase/messaging';
import { StripeProvider } from '@stripe/stripe-react-native';


messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Background message handled:', remoteMessage);
    PushNotification.localNotification({
        /* Android Only Properties */
        channelId: "taxi_booking", // (required) channelId, if the channel doesn't exist, notification will not trigger.
        /* iOS and Android properties */
        title: remoteMessage.notification.title, // (optional)
        message: remoteMessage.notification.body, // (required)
      });
});




const store = createStore(allReducers);
const ReduxApp = () => (
  <StripeProvider publishableKey='pk_test_51PVB13CCaHm2aORZ299BG48GHgCRXf6lVpXHu9Rkq71Odvm8OXGO018qnMeYnOjfWjXmcEjIiYONL3hscR8o1Z0Q00mwTXBk80'>
	<Provider store={store}>
		<NotificationProvider>
		<App />
		</NotificationProvider>
	</Provider>
  </StripeProvider>
)

AppRegistry.registerComponent(appName, () => ReduxApp);
LogBox.ignoreAllLogs();
