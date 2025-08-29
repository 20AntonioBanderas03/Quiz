import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

export default function Admin() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [questions, setQuestions] = useState([
    { 
      text: '', 
      image: null, 
      options: ['', '', ''], 
      correct: [], 
      optionCount: 2,
      multiple: false 
    }
  ]);
  const [current, setCurrent] = useState(0);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false); // Новое: модалка валидации
  const containerRef = useRef(null);

  // Прокрутка к текущему вопросу
  useEffect(() => {
    if (containerRef.current) {
      const scrollContainer = containerRef.current;
      const scrollAmount = scrollContainer.clientWidth * current;
      scrollContainer.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  }, [current]);

  const addQuestion = () => {
    setQuestions(prev => [
      ...prev,
      { 
        text: '', 
        image: null, 
        options: ['', '', ''], 
        correct: [], 
        optionCount: 2,
        multiple: false 
      }
    ]);
  };

  const updateQuestion = (field, value) => {
    setQuestions(prev =>
      prev.map((q, i) => (i === current ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (index, value) => {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== current) return q;
        const options = [...q.options];
        options[index] = value;
        return { ...q, options };
      })
    );
  };

  const toggleMultiple = () => {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== current) return q;
        return {
          ...q,
          multiple: !q.multiple,
          correct: !q.multiple ? [] : 0
        };
      })
    );
  };

  const toggleCorrect = (index) => {
    setQuestions(prev =>
      prev.map((q, i) => {
        if (i !== current || !q.multiple) return q;
        const correct = q.correct.includes(index)
          ? q.correct.filter(i => i !== index)
          : [...q.correct, index].sort();
        return { ...q, correct };
      })
    );
  };

  const updateCorrectSingle = (index) => {
    setQuestions(prev =>
      prev.map((q, i) => (i === current ? { ...q, correct: index } : q))
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => updateQuestion('image', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    updateQuestion('image', null);
  };

  // Проверка: есть ли хотя бы один правильный ответ
  const hasValidCorrectAnswers = (q) => {
    if (q.multiple) {
      return Array.isArray(q.correct) && q.correct.length > 0;
    }
    return typeof q.correct === 'number' && q.correct >= 0 && q.correct < q.optionCount;
  };

  const goToNext = () => {
    const q = questions[current];

    // Проверяем, заполнен ли вопрос
    if (!q.text.trim()) {
      setShowValidationModal('Текст вопроса не может быть пустым.');
      return;
    }

    if (q.optionCount < 2) {
      setShowValidationModal('Минимум 2 варианта ответа.');
      return;
    }

    if (!hasValidCorrectAnswers(q)) {
      setShowValidationModal(
        q.multiple 
          ? 'Выберите хотя бы один правильный ответ.' 
          : 'Выберите один правильный ответ.'
      );
      return;
    }

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      setShowSaveModal(true);
    }
  };

  const goToPrev = () => {
    if (current > 0) {
      setCurrent(current - 1);
    } else {
      setShowExitModal(true);
    }
  };

  const confirmExit = () => {
    setShowExitModal(false);
    navigate('/main');
  };

  const cancelExit = () => {
    setShowExitModal(false);
  };

  const confirmSave = () => {
    const quiz = { title, desc, questions };
    console.log('Сохранённый квиз:', quiz);
    setShowSaveModal(false);
    navigate('/main');
  };

  const cancelSave = () => {
    setShowSaveModal(false);
  };

  const closeValidationModal = () => {
    setShowValidationModal(false);
  };

  const currentQuestion = questions[current];

  return (
    <>
      {/* Модальное окно: валидация */}
      {showValidationModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={closeValidationModal}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>Ошибка</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              {showValidationModal}
            </p>
            <button
              onClick={closeValidationModal}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно: выход без сохранения */}
      {showExitModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={cancelExit}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#d32f2f', marginBottom: '15px' }}>Выйти?</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              Вы действительно хотите выйти?
              <br />
              <strong>Все изменения будут потеряны.</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                onClick={confirmExit}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                Выйти
              </button>
              <button
                onClick={cancelExit}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно: сохранить викторину */}
      {showSaveModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
          }}
          onClick={cancelSave}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '12px',
              padding: '30px',
              width: '90%',
              maxWidth: '400px',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>Сохранить викторину?</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              Вы действительно хотите сохранить викторину?
              <br />
              <strong>{title || 'Без названия'}</strong>
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
              <button
                onClick={confirmSave}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                Сохранить
              </button>
              <button
                onClick={cancelSave}
                className="btn-primary"
                style={{ flex: 1, padding: '10px' }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Основной контейнер */}
      <div className="container" style={{ marginTop: '20px' }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          maxWidth: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Заголовок и базовая информация */}
          <div style={{
            padding: '30px 40px',
            borderBottom: '1px solid #e2e8f0',
            background: '#f8f9fa'
          }}>
            <h2 style={{ color: '#2d3748', marginBottom: '15px' }}>Создание викторины</h2>
            <div style={{ marginBottom: '15px' }}>
              <label>Название викторины</label>
              <input
                type="text"
                className="input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например: История создания ОДК"
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
            <div>
              <label>Описание</label>
              <input
                type="text"
                className="input"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Краткое описание викторины"
                style={{ width: '100%', marginTop: '8px' }}
              />
            </div>
          </div>

          {/* Карусель вопросов */}
          <div
            ref={containerRef}
            style={{
              display: 'flex',
              overflowX: 'hidden',
              scrollBehavior: 'smooth',
              flex: 1,
              position: 'relative'
            }}
          >
            {questions.map((q, idx) => (
              <div
                key={idx}
                style={{
                  minWidth: '100%',
                  padding: '40px',
                  display: idx === current ? 'block' : 'none'
                }}
              >
                <div style={{
                  background: 'white',
                  padding: '40px',
                  borderRadius: '15px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  maxWidth: '100%',
                  margin: '0 auto'
                }}>
                  <h3 style={{ color: '#2d3748', marginBottom: '25px', fontSize: '22px' }}>
                    Вопрос {idx + 1} из {questions.length}
                  </h3>

                  <div style={{ marginBottom: '25px' }}>
                    <label>Текст вопроса</label>
                    <input
                      type="text"
                      className="input"
                      value={q.text}
                      onChange={(e) => updateQuestion('text', e.target.value)}
                      placeholder="Введите вопрос"
                      style={{ width: '100%', marginTop: '8px', fontSize: '16px', padding: '16px' }}
                    />
                  </div>

                  <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id={`multiple-${idx}`}
                      checked={q.multiple}
                      onChange={toggleMultiple}
                    />
                    <label htmlFor={`multiple-${idx}`} style={{ cursor: 'pointer' }}>
                      Несколько вариантов ответов
                    </label>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <label>Количество вариантов ответов</label>
                    <select
                      value={q.optionCount}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        const newOptions = Array(count).fill('');
                        if (q.options) {
                          for (let i = 0; i < Math.min(count, q.options.length); i++) {
                            newOptions[i] = q.options[i];
                          }
                        }
                        setQuestions(prev =>
                          prev.map((item, i) =>
                            i === current
                              ? { 
                                  ...item, 
                                  optionCount: count, 
                                  options: newOptions, 
                                  correct: q.multiple ? [] : 0 
                                }
                              : item
                          )
                        );
                      }}
                      style={{
                        width: '100%',
                        padding: '16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        fontSize: '16px',
                        marginTop: '8px'
                      }}
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <option key={n} value={n}>{n} варианта</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <label>Изображение к вопросу (опционально)</label>
                    <div style={{
                      border: '2px dashed #e2e8f0',
                      borderRadius: '10px',
                      padding: '25px',
                      backgroundColor: '#f7fafc',
                      marginTop: '8px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}>
                      {q.image ? (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '12px'
                        }}>
                          <img
                            src={q.image}
                            alt="Превью"
                            style={{
                              maxWidth: '100%',
                              width: 'auto',
                              height: 'auto',
                              maxHeight: '200px',
                              borderRadius: '10px'
                            }}
                          />
                          <button
                            onClick={removeImage}
                            style={{
                              background: '#e53e3e',
                              color: 'white',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            Удалить изображение
                          </button>
                        </div>
                      ) : (
                        <label style={{ cursor: 'pointer' }}>
                          📎 Нажмите, чтобы добавить изображение
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                          />
                        </label>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '25px' }}>
                    <label>Варианты ответов</label>
                    {Array.from({ length: q.optionCount }, (_, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '12px'
                      }}>
                        <input
                          type={q.multiple ? 'checkbox' : 'radio'}
                          checked={q.multiple 
                            ? q.correct.includes(i) 
                            : q.correct === i
                          }
                          onChange={() => 
                            q.multiple 
                              ? toggleCorrect(i) 
                              : updateCorrectSingle(i)
                          }
                        />
                        <input
                          type="text"
                          className="input"
                          value={q.options[i] || ''}
                          onChange={(e) => updateOption(i, e.target.value)}
                          placeholder={`Вариант ${i + 1}`}
                          style={{ flex: 1, padding: '12px', fontSize: '16px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Навигация */}
          <div style={{
            padding: '20px 40px',
            display: 'flex',
            gap: '12px',
            borderTop: '1px solid #e2e8f0',
            background: 'white'
          }}>
            <button onClick={goToPrev} className="btn-primary" style={{ flex: 1, padding: '14px' }}>
              {current === 0 ? 'Отмена' : 'Назад'}
            </button>
            <button onClick={addQuestion} className="btn-primary" style={{ flex: 1, padding: '14px' }}>
              + Добавить вопрос
            </button>
            <button onClick={goToNext} className="btn-primary" style={{ flex: 1, padding: '14px' }}>
              {current === questions.length - 1 ? 'Сохранить' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}