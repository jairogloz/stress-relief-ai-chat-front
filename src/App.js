import logo from "./logo.svg";
import "./App.css";
import "./normal.css";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lwkymozkipujzjsyddrv.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a3ltb3praXB1anpqc3lkZHJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0Nzg4OTEsImV4cCI6MjA1NzA1NDg5MX0.PZbZFfL6RtXv4o7ZyHIqgu1McrMOdYIDfVk_K6RPH-o";
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [input, setInput] = useState("");
  const [chatLog, setChatLog] = useState([
    { user: "gpt", message: "Hello, I am an AI. How can I help you?" },
  ]);
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  function clearChat() {
    setChatLog([]);
  }

  function resetInputs() {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    let chatLogNew = [...chatLog, { user: "me", message: `${input}` }];
    setInput("");
    setChatLog(chatLogNew);
    // fetch response to the api combining the chatlog array of
    // messages and sending it as a message to localhost:3000 as a post
    // Todo: get token from session
    const token =
      "eyJhbGciOiJIUzI1NiIsImtpZCI6InFaOTZ1em1aYkNBa2xITVciLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2x3a3ltb3praXB1anpqc3lkZHJ2LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI5MjUyZTU3Ni0wMjU0LTQ1NmUtODg1Yy1hY2JlYmNmZTA0YjIiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzQxOTE2MzQxLCJpYXQiOjE3NDE5MTI3NDEsImVtYWlsIjoiamFpcm8ubG96YW5vLnB1YmxpY0BnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsX3ZlcmlmaWVkIjp0cnVlfSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJwYXNzd29yZCIsInRpbWVzdGFtcCI6MTc0MTkxMjc0MX1dLCJzZXNzaW9uX2lkIjoiYjEwNjFlZDQtNTY0Yy00MjAxLTlmMmEtYjFlMjllN2JhZmVlIiwiaXNfYW5vbnltb3VzIjpmYWxzZX0.foj5aiQWsA3Nf5hTGfl2M3Fxus5xdMhouVUhGjIw3A0";
    const messages = chatLogNew.map((message) => message.message).join("\n");
    const response = await fetch("http://localhost:8081/api/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: messages,
      }),
    });

    const data = await response.json();
    setChatLog([...chatLogNew, { user: "gpt", message: `${data.content}` }]);
    //console.log(data.message);
  }

  async function handleLogin(e) {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) console.error("Error logging in:", error.message);
  }

  async function handleSignup(e) {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      console.error("Error signing up:", error.message);
    } else {
      // Automatically log the user in after successful signup
      const { error: loginError, data: loginData } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });
      if (loginError) {
        console.error("Error logging in:", loginError.message);
      } else {
        setSession(loginData.session);
      }
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error logging out:", error.message);
    setSession(null);
  }

  if (!session) {
    return (
      <div className="App">
        <div className="auth-container">
          {isLogin ? (
            <form onSubmit={handleLogin} className="auth-form">
              <h2>Stress Relief AI Chat</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
              <button type="submit" className="auth-button">
                Login
              </button>
              <p className="auth-toggle">
                Don't have an account?{" "}
                <span
                  onClick={() => {
                    setIsLogin(false);
                    resetInputs();
                  }}
                >
                  Sign Up
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="auth-form">
              <h2>Stress Relief AI Chat</h2>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-input"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="auth-input"
              />
              <button type="submit" className="auth-button">
                Sign Up
              </button>
              <p className="auth-toggle">
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setIsLogin(true);
                    resetInputs();
                  }}
                >
                  Login
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {session && (
        <nav className="navbar">
          <div className="navbar-content">
            <div className="navbar-logo">Stress Relief AI Chat</div>
            <div
              className="navbar-avatar"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <div className="avatar-circle"></div>
              {showDropdown && (
                <div className="dropdown-menu">
                  <div className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>
      )}
      <div className="main-content">
        <aside className="sidemenu">
          <div className="side-menu-button" onClick={clearChat}>
            <span>+</span>New Chat
          </div>
        </aside>
        <section className="chatbox">
          <div className="chat-log">
            {chatLog.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
          </div>
          <div className="chat-input-holder">
            <form onSubmit={handleSubmit}>
              <input
                rows="1"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="chat-input-textarea"
              ></input>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

const ChatMessage = ({ message }) => {
  return (
    <div className={`chat-message ${message.user === "gpt" && "chatgpt"}`}>
      <div className="chat-message-center">
        <div className={`avatar ${message.user === "gpt" && "chatgpt"}`}>
          {message.user === "gpt" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              fill="none"
              className="h-2/3 w-2/3"
            >
              <text x={-9999} y={-9999}>
                {"ChatGPT"}
              </text>
              <path
                fill="currentColor"
                d="M9.205 8.765v-2.26c0-.19.071-.333.238-.428l4.543-2.616c.619-.357 1.356-.523 2.117-.523 2.854 0 4.662 2.212 4.662 4.567 0 .166 0 .356-.024.547l-4.71-2.76a.797.797 0 0 0-.856 0l-5.97 3.473Zm10.609 8.8v-5.399c0-.333-.143-.57-.429-.737l-5.97-3.473 1.95-1.118a.432.432 0 0 1 .476 0l4.543 2.617c1.309.761 2.189 2.378 2.189 3.948 0 1.808-1.07 3.473-2.76 4.163ZM7.802 12.81l-1.95-1.142c-.167-.095-.239-.238-.239-.428V6.006c0-2.545 1.95-4.472 4.591-4.472 1 0 1.927.333 2.712.928L8.23 5.174c-.285.166-.428.404-.428.737v6.898ZM12 15.235l-2.795-1.57v-3.33L12 8.765l2.795 1.57v3.33L12 15.235Zm1.796 7.23c-1 0-1.927-.332-2.712-.927l4.686-2.712c.285-.166.428-.404.428-.737v-6.898l1.974 1.142c.167.095.238.238.238.428v5.233c0 2.545-1.974 4.472-4.614 4.472Zm-5.638-5.303-4.543-2.617c-1.308-.761-2.188-2.378-2.188-3.948A4.482 4.482 0 0 1 4.21 6.434v5.423c0 .334.143.571.428.738l5.947 3.449-1.95 1.118a.433.433 0 0 1-.477 0Zm-.261 3.9c-2.688 0-4.662-2.021-4.662-4.519 0-.19.024-.38.047-.57l4.686 2.71c.286.167.571.167.856 0l5.97-3.448v2.26c0 .19-.07.333-.237.428l-4.543 2.616c-.619.357-1.356.523-2.117.523Zm5.899 2.83a5.947 5.947 0 0 0 5.828-4.756c2.663-.69 4.376-3.188 4.376-5.733 0-1.665-.713-3.282-1.998-4.448.119-.5.19-.999.19-1.498 0-3.401-2.759-5.947-5.946-5.947-.642 0-1.26.095-1.88.31A5.962 5.962 0 0 0 10.205.107a5.947 5.947 0 0 0-5.827 4.757C1.713 5.554 0 8.052 0 10.597c0 1.665.714 3.282 1.998 4.448-.119.5-.19.999-.19 1.498 0 3.401 2.759 5.947 5.946 5.947.642 0 1.26-.095 1.88-.31a5.96 5.96 0 0 0 4.162 1.713Z"
              />
            </svg>
          )}
        </div>
        <div className="message">{message.message}</div>
      </div>
    </div>
  );
};

export default App;
