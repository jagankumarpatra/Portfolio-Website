"use client";

import { Component, type ReactNode } from "react";

type State = { failed: boolean };

export default class ErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, State> {
  state: State = { failed: false };
  static getDerivedStateFromError(): State {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
