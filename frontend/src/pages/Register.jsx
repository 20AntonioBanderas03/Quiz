import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { AuthContext } from "../context/context";
import { register } from "../service/api";

// Функция для работы с пользователями
const getUsers = () => {};

// Добавляем нового пользователя
const addUser = (username, password) => {
  sessionStorage.setItem("username", username);
  sessionStorage.setItem("password", password);
  sessionStorage.setItem("isAuth", true);

  return true;
};

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { isAuth, setIsAuth } = useContext(AuthContext);
  const [confirm, setConfirm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState(false);
  const [airplaneVisible, setAirplaneVisible] = useState(false);
  const navigate = useNavigate();

  // Функция для запуска анимации самолёта
  const flyAirplane = () => {
    setAirplaneVisible(true);

    // Через 3.5 секунды — скрываем (должно совпадать с duration в CSS)
    setTimeout(() => {
      setAirplaneVisible(false);
    }, 5000);

    // Запланируем следующий полёт через 15–30 сек
    setTimeout(flyAirplane, 15000 + Math.random() * 15000);
  };

  useEffect(() => {
    // Первый полёт через 5–10 секунд после загрузки
    const timer = setTimeout(flyAirplane, 1000 + Math.random() * 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (password !== confirm) {
        setErrorMessage("Пароли не совпадают!");
        setShowModal(true);
        return;
      }

      const user = await register({
        username: username,
        password: password,
      });

      console.log("User registered:", user);
      sessionStorage.setItem("username", username);
      sessionStorage.setItem("password", password);
      sessionStorage.setItem("isAuth", true);
      setIsAuth(true);
    } catch (error) {
      console.log("Full error:", error);

      if (error.response?.status === 400) {
        setErrorMessage("Пользователь с таким именем уже существует!");
      } else if (error.response?.status === 500) {
        setErrorMessage("Ошибка сервера. Попробуйте позже");
      } else {
        setErrorMessage("Произошла ошибка при регистрации");
      }

      setShowModal(true);
      setPassword("");
      setUsername("");
      setConfirm("");
    }
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      {/* Самолёт — летит сверху */}
      <div
        style={{
          position: "fixed",
          top: "40px",
          left: `${-200 * 1.3}px`,
          width: "200px",
          height: "80px",
          background: `url('/gif2.gif') no-repeat center / contain`,
          opacity: airplaneVisible ? 1 : 0,
          pointerEvents: "none",
          zIndex: 1,
          transition: "opacity 1s ease-in-out",
          animation: airplaneVisible ? "flyRight 5s linear forwards" : "none",
        }}
      />

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

      {/* Модальное окно с ошибкой */}
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
            <h3 style={{ color: "rgba(211, 47, 47, 1)", marginBottom: "15px" }}>
              Ошибка
            </h3>
            <p style={{ color: "#555", marginBottom: "20px" }}>
              {errorMessage}
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
      <div className="container" style={{ width: "1000px" }}>
        <Header />
        <div
          style={{
            display: "flex",
            background: "white",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 15px 40px rgba(0,0,0,0.15)",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <div style={{ flex: 1, padding: "40px", background: "#f8f9fa" }}>
            <h1 style={{ fontSize: "28px", color: "#2d3748" }}>
              Присоединяйтесь к платформе IQ-Движок!
            </h1>
            <p>
              Создайте аккаунт, чтобы получить доступ к увлекательным
              викторинам.
            </p>
            <div
              style={{
                marginTop: "auto",
                textAlign: "center",
                padding: "20px 0",
              }}
            >
              <img
                src="gif.gif"
                alt="Доп. логотип"
                style={{ height: "175px", marginTop: "40px" }}
              />
            </div>
          </div>

          <div style={{ flex: 1.2, padding: "40px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
              Создать аккаунт
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "20px" }}>
                <label>Никнейм</label>
                <input
                  type="text"
                  className="input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Придумайте никнейм"
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
                  placeholder="Придумайте пароль"
                  required
                  style={{ marginTop: "8px", width: "100%" }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label>Подтверждение пароля</label>
                <input
                  type="password"
                  className="input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Повторите пароль"
                  required
                  style={{ marginTop: "8px", width: "100%" }}
                />
              </div>

              <button type="submit" className="btn-primary">
                Зарегистрироваться
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
