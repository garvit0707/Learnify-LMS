import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <View className="flex-1 items-center justify-center bg-dark-900 px-6">
            <Text className="text-4xl mb-4">⚠️</Text>
            <Text className="text-white text-xl font-bold mb-2">Oops!</Text>
            <Text className="text-slate-400 text-sm text-center mb-6">
              {this.state.error?.message || "Something went wrong"}
            </Text>
            <TouchableOpacity
              onPress={this.reset}
              className="bg-primary-500 px-6 py-3 rounded-xl"
            >
              <Text className="text-white font-semibold">Try Again</Text>
            </TouchableOpacity>
          </View>
        )
      );
    }
    return this.props.children;
  }
}
