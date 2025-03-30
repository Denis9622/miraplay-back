import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateGame, addGame } from '../../actions/gameActions';
import styles from './GameModal.module.css';

const GameModal = ({ isOpen, onClose, game = null }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    systemGameName: game ? game.systemGameName : '',
    commonGameName: game ? game.commonGameName : '',
    genre: game ? game.genre : '',
    releaseDate: game ? game.releaseDate : '',
    inTop: game ? game.inTop : false,
  });

  useEffect(() => {
    if (game) {
      setFormData(game);
    }
  }, [game]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (game) {
        await dispatch(updateGame({ id: game._id, gameData: formData }));
      } else {
        await dispatch(addGame(formData));
      }
      onClose();
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg className={styles.iconx}>
            <use href="/sprite.svg#icon-x"></use>
          </svg>
        </button>
        <h2>{game ? 'Edit Game' : 'Add a new game'}</h2>
        <form className={styles.form}>
          <div className={styles.leftColumn}>
            <input
              type="text"
              name="systemGameName"
              placeholder="System Game Name"
              value={formData.systemGameName}
              onChange={handleChange}
              required
              className={styles.inputtext}
            />
            <input
              type="text"
              name="commonGameName"
              placeholder="Common Game Name"
              value={formData.commonGameName}
              onChange={handleChange}
              required
              className={styles.inputtext}
            />
            <input
              type="text"
              name="genre"
              placeholder="Genre"
              value={formData.genre}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="releaseDate"
              value={formData.releaseDate}
              onChange={handleChange}
              required
            />
            <label>
              <input
                type="checkbox"
                name="inTop"
                checked={formData.inTop}
                onChange={handleChange}
              />
              Add to Top
            </label>
          </div>
        </form>
        <div className={styles.buttonContainer}>
          <button className={styles.primaryButton} onClick={handleSubmit}>
            {game ? 'Save' : 'Add'}
          </button>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameModal;
