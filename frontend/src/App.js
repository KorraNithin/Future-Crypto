import React, { useEffect } from "react"
import Navbar from "./components/Navbar"
import Hero from "./components/Hero"
import Featured from "./components/Featured"
import Signup from "./components/Signup"
import Footer from "./components/Footer"
import Form from "./components/form"
import { useAuth } from "./components/AuthContext"

function App() {
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const googleLogin = params.get('googleLogin');
    const email = params.get('email');

    if (googleLogin === 'success' && email) {
      login({ email });
    }

    if (googleLogin) {
      // Clean the query params out of the URL after handling them
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [login]);

  return <>
    <Navbar/>
    <Hero/>
    <Featured/>
    <Signup/>
    <Form/>
    <Footer/>
  </>
}

export default App;
