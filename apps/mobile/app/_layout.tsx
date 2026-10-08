import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { withUniwind } from "uniwind";
import { SafeAreaProvider } from "@acme/app";
import { setThemePreference } from "@acme/theme/switch";
import "../global.css";

// className-capable gesture root (third-party component → withUniwind).
// Module scope, not render scope — withUniwind builds the wrapper eagerly.
const GestureRoot = withUniwind(GestureHandlerRootView);

// The starter is dark-first: apply it before the first frame instead of inheriting the OS appearance.
setThemePreference("dark");

export default function RootLayout() {
  return (
    <GestureRoot className="flex-1">
      <StatusBar style="light" />
      <KeyboardProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#000" } }} />
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureRoot>
  );
}
