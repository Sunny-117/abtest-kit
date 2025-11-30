import { useState } from 'react';
import HooksDemo from './demos/HooksDemo';
import NonHooksDemo from './demos/NonHooksDemo';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<'hooks' | 'non-hooks'>('hooks');

  return (
    <div className="app">
      <header className="header">
        <h1>ABTest Kit Playground</h1>
        <p>演示 Hooks 和非 Hooks 两种使用方式</p>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'hooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('hooks')}
        >
          Hooks 方式 (React)
        </button>
        <button
          className={`tab ${activeTab === 'non-hooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('non-hooks')}
        >
          非 Hooks 方式 (全局分流)
        </button>
      </div>

      <div className="content">
        {activeTab === 'hooks' ? <HooksDemo /> : <NonHooksDemo />}
      </div>
    </div>
  );
}
