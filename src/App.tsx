import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import AuthGuard from "@/components/layout/AuthGuard";
import AuthPage from "@/pages/AuthPage";
import EmotionPage from "@/pages/EmotionPage";
import FocusPage from "@/pages/FocusPage";
import LogPage from "@/pages/LogPage";
import PlannerPage from "@/pages/PlannerPage";
import ReviewPage from "@/pages/ReviewPage";
import SettingsPage from "@/pages/SettingsPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route element={<AuthGuard />}>
          <Route path="/" element={<Navigate to="/log" replace />} />
          <Route element={<AppShell />}>
            <Route path="/log" element={<LogPage />} />
            <Route path="/review" element={<ReviewPage />} />
            <Route path="/planner" element={<PlannerPage />} />
            <Route path="/focus" element={<FocusPage />} />
            <Route path="/emotion" element={<EmotionPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/log" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}
