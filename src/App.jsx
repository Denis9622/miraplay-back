import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from './services/socketService';
import TopGameNotification from './components/TopGameNotification/TopGameNotification';

function App() {
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      // Подключаемся к WebSocket серверу при авторизации пользователя
      socketService.connect();
    }

    return () => {
      // Отключаемся при размонтировании компонента
      socketService.disconnect();
    };
  }, [user]);

  return (
    <div>
      {/* Остальные компоненты */}
      <TopGameNotification />
    </div>
  );
}

export default App;
