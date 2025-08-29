import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { privateRoutes, publicRoutes } from "./router/router";
import { useEffect, useState } from "react";
import { AuthContext } from "./context/context";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const auth = sessionStorage.getItem("isAuth") === "true";
    setIsAuth(auth);
    
  }, [isAuth]);

  return (
    <AuthContext.Provider value={{ isAuth, setIsAuth }}>
      <Router>
        <Routes>
          {isAuth
            ? privateRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))
            : publicRoutes.map((route) => (
                <Route
                  key={route.path}
                  path={route.path}
                  element={route.element}
                />
              ))}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
