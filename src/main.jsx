import React from 'react';
import ReactDOM from 'react-dom/client';
import{BrowserRouter} from 'react-router-dom';
import App from './App.jsx';
import { NotificationProvider } from './context/NotificationContext'; // <-- 1. IMPORTAR


import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

 

