import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { GoogleOAuthProvider } from '@react-oauth/google'

const clientId = '800791620013-uj3mtbfo91cb6isaru29mgr6k2rbr3lo.apps.googleusercontent.com';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)