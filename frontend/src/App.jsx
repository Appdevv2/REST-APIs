import React, {
  Fragment,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
import Backdrop from "./components/Backdrop/Backdrop.jsx";
import Toolbar from "./components/Toolbar/Toolbar";
import MainNavigation from "./components/Navigation/MainNavigation/MainNavigation";
import MobileNavigation from "./components/Navigation/MobileNavigation/MobileNavigation";
import ErrorHandler from "./components/ErrorHandler/ErrorHandler";
import FeedPage from "./pages/Feed/Feed";
import SinglePostPage from "./pages/Feed/SinglePost/SinglePost";
import LoginPage from "./pages/Auth/Login";
import SignupPage from "./pages/Auth/Signup";
import "./App.css";

const App = () => {
  const navigate = useNavigate();

  const [showBackdrop, setShowBackdrop] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAuth, setIsAuth] = useState(true);
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState(null);

  const logoutTimerRef = useRef(null);

  const clearLogoutTimer = useCallback(() => {
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  const logoutHandler = useCallback(() => {
    setIsAuth(false);
    setToken(null);
    setUserId(null);
    clearLogoutTimer();

    localStorage.removeItem("token");
    localStorage.removeItem("expiryDate");
    localStorage.removeItem("userId");
  }, [clearLogoutTimer]);

  const setAutoLogout = useCallback(
    (milliseconds) => {
      clearLogoutTimer();
      logoutTimerRef.current = setTimeout(() => {
        logoutHandler();
      }, milliseconds);
    },
    [clearLogoutTimer, logoutHandler]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const expiryDate = localStorage.getItem("expiryDate");

    if (!storedToken || !expiryDate) return;

    if (new Date(expiryDate) <= new Date()) {
      logoutHandler();
      return;
    }

    const storedUserId = localStorage.getItem("userId");
    const remainingMilliseconds =
      new Date(expiryDate).getTime() - new Date().getTime();

    setIsAuth(true);
    setToken(storedToken);
    setUserId(storedUserId);

    setAutoLogout(remainingMilliseconds);
  }, [logoutHandler, setAutoLogout]);

  useEffect(() => {
    return () => clearLogoutTimer();
  }, [clearLogoutTimer]);

  const mobileNavHandler = useCallback((isOpen) => {
    setShowMobileNav(isOpen);
    setShowBackdrop(isOpen);
  }, []);

  const backdropClickHandler = useCallback(() => {
    setShowBackdrop(false);
    setShowMobileNav(false);
    setError(null);
  }, []);

  const errorHandler = useCallback(() => {
    setError(null);
  }, []);

  const loginHandler = useCallback(
    (event, authData) => {
      event.preventDefault();
      setAuthLoading(true);

      fetch("URL")
        .then((res) => {
          if (res.status === 422) throw new Error("Validation failed.");
          if (res.status !== 200 && res.status !== 201) {
            throw new Error("Could not authenticate you!");
          }
          return res.json();
        })
        .then((resData) => {
          setIsAuth(true);
          setToken(resData.token);
          setUserId(resData.userId);
          setAuthLoading(false);

          localStorage.setItem("token", resData.token);
          localStorage.setItem("userId", resData.userId);

          const remainingMilliseconds = 60 * 60 * 1000; // 1 hour
          const expiryDate = new Date(
            new Date().getTime() + remainingMilliseconds
          );
          localStorage.setItem("expiryDate", expiryDate.toISOString());

          setAutoLogout(remainingMilliseconds);
        })
        .catch((err) => {
          setIsAuth(false);
          setAuthLoading(false);
          setError(err);
        });
    },
    [setAutoLogout]
  );

  const signupHandler = useCallback(
    (event, authData) => {
      event.preventDefault();
      setAuthLoading(true);

      fetch("URL")
        .then((res) => {
          if (res.status === 422) {
            throw new Error(
              "Validation failed. Make sure the email address isn't used yet!"
            );
          }
          if (res.status !== 200 && res.status !== 201) {
            throw new Error("Creating a user failed!");
          }
          return res.json();
        })
        .then(() => {
          setIsAuth(false);
          setAuthLoading(false);
          navigate("/", { replace: true }); // v6 replacement for history.replace("/")
        })
        .catch((err) => {
          setIsAuth(false);
          setAuthLoading(false);
          setError(err);
        });
    },
    [navigate]
  );

  return (
    <Fragment>
      {showBackdrop && <Backdrop onClick={backdropClickHandler} />}
      <ErrorHandler error={error} onHandle={errorHandler} />

      <Layout
        header={
          <Toolbar>
            <MainNavigation
              onOpenMobileNav={() => mobileNavHandler(true)}
              onLogout={logoutHandler}
              isAuth={isAuth}
            />
          </Toolbar>
        }
        mobileNav={
          <MobileNavigation
            open={showMobileNav}
            mobile
            onChooseItem={() => mobileNavHandler(false)}
            onLogout={logoutHandler}
            isAuth={isAuth}
          />
        }
      />

      {!isAuth ? (
        <Routes>
          <Route
            path="/"
            element={<LoginPage onLogin={loginHandler} loading={authLoading} />}
          />
          <Route
            path="/signup"
            element={
              <SignupPage onSignup={signupHandler} loading={authLoading} />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route
            path="/"
            element={<FeedPage userId={userId} token={token} />}
          />
          <Route
            path="/:postId"
            element={<SinglePostPage userId={userId} token={token} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      )}
    </Fragment>
  );
};

export default App;
