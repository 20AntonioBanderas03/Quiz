import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AuthContext } from "../context/context";
import { login } from "../service/api";

// Функция для получения пользователей
const getUsers = () => {};

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [airplaneVisible, setAirplaneVisible] = useState(false);
  const navigate = useNavigate();

  const mockUsers = getUsers();

  // Функция для запуска анимации самолёта
  const flyAirplane = () => {
    setAirplaneVisible(true);

    // Скрываем через 5 секунд (должно совпадать с анимацией)
    setTimeout(() => {
      setAirplaneVisible(false);
    }, 5000);

    // Следующий полёт через 15–30 сек
    setTimeout(flyAirplane, 15000 + Math.random() * 15000);
  };

  useEffect(() => {
    // Первый полёт через 2–5 секунд после загрузки
    const timer = setTimeout(flyAirplane, 2000 + Math.random() * 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const user = await login({
        username: username,
        password: password,
      });
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("password", password);
      sessionStorage.setItem("isAuth", true);
      setIsAuth(true);
    } catch (error) {
      console.log(error);
      setError("Неверный никнейм или пароль");
      setShowModal(true);
      setUsername("");
      setPassword("");
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setError(null);
  };

  return (
    <>
      {/* Самолёт — летит сверху */}
      <div
        style={{
          position: "fixed",
          top: "40px",
          left: `${-200 * 1.3}px`, // Начинается за левой границей
          width: "200px",
          height: "80px",
          background: `url('/gif2.gif') no-repeat center / contain`, // Ваша анимация самолёта
          opacity: airplaneVisible ? 1 : 0,
          pointerEvents: "none", // Не мешает кликам
          zIndex: 1,
          transition: "opacity 1s ease-in-out",
          animation: airplaneVisible ? "flyRight 5s linear forwards" : "none",
        }}
      />

      {/* CSS-анимация */}
      <style jsx>{`
        @keyframes flyRight {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(calc(100vw + 260px));
          }
        }
      `}</style>

      {/* Модальное окно ошибки */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "30px",
              width: "90%",
              maxWidth: "400px",
              textAlign: "center",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: "#d32f2f", marginBottom: "15px" }}>
              Ошибка входа
            </h3>
            <p style={{ color: "#555", marginBottom: "20px" }}>
              Неверный никнейм или пароль.
            </p>
            <button
              onClick={closeModal}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}

      {/* Основная форма */}
      <div className="container" style={{ width: "500px" }}>
        <Header currentPage="login" />
        <div
          style={{
            display: "flex",
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
            margin: "0 auto",
          }}
        >
          <div style={{ flex: 1.2, padding: "40px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Войти</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label>Никнейм</label>
                <input
                  type="text"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Введите никнейм"
                  required
                  style={{ marginTop: "8px", width: "100%" }}
                />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label>Пароль</label>
                <input
                  type="password"
                  className="input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Введите пароль"
                  required
                  style={{ marginTop: "8px", width: "100%" }}
                />
              </div>
              <button type="submit" className="btn-primary">
                Войти
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
