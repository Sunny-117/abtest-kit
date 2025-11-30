import { useState, useEffect } from 'react';
import HooksDemo from './demos/HooksDemo';
import NonHooksDemo from './demos/NonHooksDemo';
import './App.css';

export default function App() {
  const getInitialTab = (): 'hooks' | 'non-hooks' => {
    const hash = window.location.hash.slice(1);
    return hash === 'non-hooks' ? 'non-hooks' : 'hooks';
  };

  const [activeTab, setActiveTab] = useState<'hooks' | 'non-hooks'>(getInitialTab);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash === 'hooks' || hash === 'non-hooks') {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (tab: 'hooks' | 'non-hooks') => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>ABTest Kit Playground</h1>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'hooks' ? 'active' : ''}`}
          onClick={() => handleTabChange('hooks')}
        >
          Hooks 方式 (React)
        </button>
        <button
          className={`tab ${activeTab === 'non-hooks' ? 'active' : ''}`}
          onClick={() => handleTabChange('non-hooks')}
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
