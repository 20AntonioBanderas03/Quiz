// api.js
const API_BASE_URL = 'http://localhost:3001/api';

// Универсальная функция для запросов
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Request failed');
        }

        return data;
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Регистрация пользователя
export async function register(userData) {
    const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    });

    const data = await response.json();
    
    if (!response.ok) {
        // Создаем ошибку с полным ответом
        const error = new Error(data.error || 'Registration failed');
        error.response = response;
        error.data = data;
        throw error;
    }

    return data;
}

// Авторизация пользователя
export async function login(credentials) {
    return makeRequest('/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
    });
}

// Получение всех квизов
export async function getQuizzes() {
    return makeRequest('/quizzes');
}

// Получение прогресса пользователя
export async function getProgress(userId) {
    return makeRequest('/progress', {
        headers: {
            'user-id': userId
        }
    });
}

// Сохранение результата квиза
export async function saveQuizAttempt(userId, attemptData) {
    return makeRequest('/quiz/attempt', {
        method: 'POST',
        headers: {
            'user-id': userId
        },
        body: JSON.stringify(attemptData)
    });
}

// Получение истории попыток
export async function getQuizHistory(userId, quizId = null) {
    const params = new URLSearchParams();
    if (quizId) params.append('quizId', quizId);
    
    return makeRequest(`/quiz/history?${params}`, {
        headers: {
            'user-id': userId
        }
    });
}

// Создание демо-квиза (для тестирования)
export async function createDemoQuiz() {
    return makeRequest('/quiz/create-demo', {
        method: 'POST'
    });
}

// Пример использования:
/*
// 1. Регистрация
const newUser = await register({
    username: 'testuser',
    password: 'password123',
    email: 'test@mail.ru'
});

// 2. Логин
const user = await login({
    username: 'testuser',
    password: 'password123'
});

// 3. Получить квизы
const quizzes = await getQuizzes();

// 4. Сохранить результат
const result = await saveQuizAttempt(user.userId, {
    quizId: 1,
    score: 3,
    totalQuestions: 5,
    answers: [
        { questionIndex: 0, selectedAnswer: 1, isCorrect: true },
        { questionIndex: 1, selectedAnswer: 2, isCorrect: false }
    ],
    timeSpent: 120
});

// 5. Получить прогресс
const progress = await getProgress(user.userId);

// 6. Получить историю
const history = await getQuizHistory(user.userId);
*/