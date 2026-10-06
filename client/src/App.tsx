import { BrowserRouter } from 'react-router-dom';
import { Activity } from 'lucide-react';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 text-blue-600 rounded-full">
            <Activity className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">CareConnect Clinic Management Portal</h1>
          <p className="text-slate-600">Project initialized successfully.</p>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
