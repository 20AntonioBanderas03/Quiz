import { Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Main from "../pages/Main";
import Admin from "../pages/Admin";

export const publicRoutes = [
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
  { path: "*", element: <Navigate to="/register" replace /> },
];

export const privateRoutes = [
  { path: "/admin", element: <Admin /> },
  { path: "/main", element: <Main /> },
  { path: "*", element: <Navigate to="/main" replace /> },
];
