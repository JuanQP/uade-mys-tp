import React from 'react';
import ReactDOM from 'react-dom';
import '../node_modules/react-vis/dist/style.css';
import { App } from './App';
import { MathJaxContext } from 'better-react-mathjax';
import '@fontsource/roboto';

ReactDOM.render(
  <React.StrictMode>
    <MathJaxContext>
      <App />
    </MathJaxContext>
  </React.StrictMode>,
  document.getElementById('root')
);
