import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';

// Моковые данные
const mockQuizzes = [
  { id: 1, title: "Какой ты ПД?", questions: 10, level: "Средний" },
  { id: 2, title: "История Сатурнито", questions: 15, level: "Высокий" },
  { id: 3, title: "Технологии разработки Max", questions: 8, level: "Лёгкий" },
  { id: 4, title: "Загадки ПАО ОДК САТУРН", questions: 12, level: "Средний" },
];

export default function Main() {
  const [quizzes] = useState(mockQuizzes);
  const [selectedQuiz, setSelectedQuiz] = useState(null); // Для модального окна
  const username = localStorage.getItem('user') || 'Пользователь';

  // Моковая статистика
  const stats = {
    totalQuizzes: 5,
    correctAnswers: 87,
    lastQuiz: "История Сатурнито",
    totalQuestions: 68,
    bestScore: "Какой ты ПД? (2/15)"
  };

  const handleStartQuiz = (quiz) => {
    setSelectedQuiz(quiz);
  };

  const confirmQuiz = () => {
    // Здесь будет переход к викторине
    // Пример: navigate(`/quiz/${selectedQuiz.id}`);
    setSelectedQuiz(null);
  };

  const cancelQuiz = () => {
    setSelectedQuiz(null);
  };

  return (
    <>
      <Header />

      {/* Модальное окно подтверждения */}
      {selectedQuiz && (
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
          onClick={cancelQuiz}
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
            <h3 style={{ color: '#2d3748', marginBottom: '15px' }}>Начать викторину?</h3>
            <p style={{ color: '#555', marginBottom: '20px' }}>
              Вы действительно хотите начать:
              <br />
              <strong style={{ color: '#d32f2f' }}>{selectedQuiz.title}</strong>?
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={confirmQuiz}
                className="btn"
                style={{ flex: 1, padding: '10px' }}
              >
                Начать
              </button>
              <button
                onClick={cancelQuiz}
                className="btn"
                style={{ flex: 1, padding: '10px' }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Основная страница */}
      <div className="container">
        <div style={{
          display: 'flex',
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 15px 40px rgba(0,0,0,0.15)',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {/* Левая секция — статистика */}
          <div style={{
            flex: 1,
            padding: '40px',
            background: '#f8f9fa'
          }}>
            <div style={{ marginBottom: '30px' }}>
              <h1 style={{ fontSize: '28px', color: '#2d3748', margin: 0 }}>
                Привет, <span style={{ color: '#d32f2f' }}>{username}</span>!
              </h1>
              <p style={{ color: '#718096', marginTop: '8px' }}>Ваш прогресс и достижения</p>
            </div>

            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              marginBottom: '20px'
            }}>
              <h3 style={{ color: '#2d3748', marginBottom: '15px', fontSize: '18px' }}>📊 Ваша статистика</h3>
              <p><strong>Пройдено викторин:</strong> {stats.totalQuizzes}</p>
              <p><strong>Правильных ответов:</strong> {stats.correctAnswers}%</p>
              <p><strong>Всего вопросов:</strong> {stats.totalQuestions}</p>
              <p><strong>Последняя викторина:</strong> {stats.lastQuiz}</p>
              <p><strong>Лучший результат:</strong> {stats.bestScore}</p>
            </div>

            <div style={{ marginTop: '20px' }}>
              <Link to="/admin" className="btn-primary" style={{ width: '100%', marginBottom: '10px' }}>
                Создать викторину
              </Link>
            </div>
          </div>

          {/* Правая секция — список квизов */}
          <div style={{
            flex: 1.2,
            padding: '40px',
            background: 'white'
          }}>
            <h2 style={{ color: '#2d3748', marginBottom: '20px', fontSize: '24px' }}>Популярные викторины</h2>
            <p style={{ color: '#718096', marginBottom: '30px', fontSize: '16px' }}>Выберите, с чего начнёте сегодня</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {quizzes.map(quiz => (
                <div key={quiz.id} style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '15px',
                  padding: '20px',
                  background: '#f8f9fa',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}>
                  <h3 style={{ color: '#2d3748', margin: 0, fontSize: '18px' }}>{quiz.title}</h3>
                  <p style={{ color: '#718096', margin: '8px 0', fontSize: '14px' }}>
                    {quiz.questions} вопросов • Уровень: {quiz.level}
                  </p>
                  <button
                    onClick={() => handleStartQuiz(quiz)}
                    style={{
                      background: '#d32f2f',
                      color: 'white',
                      border: 'none',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#b71c1c';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#d32f2f';
                    }}
                  >
                    Начать
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}