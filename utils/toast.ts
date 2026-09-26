import Toast from "react-native-toast-message";

export function showError(title: string, message?: string, time = 4000) {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    visibilityTime: time,
  });
}

export function showSuccess(title: string, message?: string) {
  Toast.show({ type: "success", text1: title, text2: message });
}

export function showInfo(title: string, message?: string) {
  Toast.show({ type: "info", text1: title, text2: message });
}
