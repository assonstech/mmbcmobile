import {createNavigationContainerRef} from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

let actionQueue = [];

export function navigate(name, params) {
  if (navigationRef.isReady()) {
    if (actionQueue.length > 0) {
      actionQueue.forEach(action => action());
      actionQueue = [];
    }
    navigationRef.navigate(name, params);
  } else {
    actionQueue.push(() => navigationRef.navigate(name, params));
  }
}

export function goBack() {
  if (navigationRef.isReady() && navigationRef.canGoBack()) {
    navigationRef.goBack();
  } else {
    actionQueue.push(() => navigationRef.goBack());
  }
}