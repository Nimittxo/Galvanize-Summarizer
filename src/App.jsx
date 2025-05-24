// App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./login";
import Demo from "./components/Demo";
import Hero from "./components/Hero";

const MainApp = () => (
  <>
    <Hero />
    <Demo />
  </>
);

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/app" element={<MainApp />} />
        {/* Redirect all unknown routes to login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;
