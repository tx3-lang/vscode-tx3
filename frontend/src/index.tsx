import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import ResolvePanel from './webviews/ResolvePanel';
import DiagramPanel from './webviews/DiagramPanel';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {webview === 'RESOLVE-PANEL' && <ResolvePanel />}
    {webview === 'DIAGRAM-PANEL' && <DiagramPanel />}
  </StrictMode>,
)
