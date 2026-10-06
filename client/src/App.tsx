import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Activity } from 'lucide-react';

function TestHomePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full">
          <Activity className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">CareConnect</h1>
        <p className="text-slate-600">Frontend and Backend configured successfully.</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TestHomePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
