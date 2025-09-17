import { Redirect } from "wouter";

export default function HomePage() {
  // Redirect to dashboard as the main page
  return <Redirect to="/dashboard" />;
}
