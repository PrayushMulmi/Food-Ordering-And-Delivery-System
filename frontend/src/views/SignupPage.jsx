import { useNavigate } from "react-router-dom";
import { LoginPage } from "./LoginPage";

export function SignupPage() {
  // Redirect to login page with signup tab active
  return <LoginPage />;
}
