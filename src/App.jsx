import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './hooks/useAppState';
import { Layout } from './components/layout/Layout';

// Pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Communications from './pages/Communications';
import AddCommunication from './pages/AddCommunication';
import AnalysisResult from './pages/AnalysisResult';
import Actions from './pages/Actions';
import Decisions from './pages/Decisions';
import Risks from './pages/Risks';
import InsightDetail from './pages/InsightDetail';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Projects */}
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/projects/:id/communications" element={<Communications />} />
            <Route path="/projects/:id/add-communication" element={<AddCommunication />} />

            {/* Communications */}
            <Route path="/communications" element={<Communications />} />
            <Route path="/add-communication" element={<AddCommunication />} />

            {/* AI Analysis Result */}
            <Route path="/analysis-result/:id" element={<AnalysisResult />} />

            {/* Intelligence Extractions */}
            <Route path="/actions" element={<Actions />} />
            <Route path="/decisions" element={<Decisions />} />
            <Route path="/risks" element={<Risks />} />

            {/* Traceability: Deep Dive into Source Communication */}
            <Route path="/insight/:type/:id" element={<InsightDetail />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
