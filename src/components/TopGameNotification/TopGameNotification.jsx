import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../../services/socketService';
import css from './TopGameNotification.module.css';

const TopGameNotification = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!user) return;

    console.log('TopGameNotification mounted, user:', user);

    const handlePopularGame = (data) => {
      console.log('TopGameNotification received event:', data);
      if (!data || !data.game || !data.game.commonGameName) {
        console.error('Invalid game data:', data);
        return;
      }

      setMessage(data.message);
      setIsVisible(true);

      // Автоматически скрываем уведомление через 5 секунд
      setTimeout(() => {
        console.log('Hiding notification after timeout');
        setIsVisible(false);
      }, 5000);
    };

    socketService.subscribe('popularGame', handlePopularGame);

    return () => {
      console.log('TopGameNotification unmounting');
      socketService.unsubscribe('popularGame');
    };
  }, [user]);

  const handleClose = () => {
    console.log('Manual close triggered');
    setIsVisible(false);
  };

  if (!isVisible) {
    console.log('Notification not visible');
    return null;
  }

  console.log('Rendering notification with message:', message);
  return (
    <div className={css.notification}>
      <div className={css.content}>
        <p>{message}</p>
        <button className={css.closeButton} onClick={handleClose}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default TopGameNotification;
