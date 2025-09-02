import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const savedAuth = localStorage.getItem("auth");
  const auth = savedAuth ? JSON.parse(savedAuth) : null;

  if (!auth) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && auth.role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
