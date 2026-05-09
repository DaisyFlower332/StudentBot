import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchProfile, logIn, sendChat, signUp } from "./api";
import { LOBBY, type GameId } from "./games/types";
import { HangmanGame } from "./games/HangmanGame";
import { QuizGame } from "./games/QuizGame";
import { ImposterGame } from "./games/ImposterGame";
import { TenSecondGame } from "./games/TenSecondGame";
import { EscapeRoomGame } from "./games/EscapeRoomGame";
import { TwoTruthsGame } from "./games/TwoTruthsGame";

type Screen = "login" | "signup" | "chat" | "games";

type Session = {
  userId: string;
  accessToken: string;
  username: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const SESSION_KEY = "studentbot_session";

function loadSession(): Session | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Session;
    if (p?.userId && p?.accessToken) return p;
    return null;
  } catch {
    return null;
  }
}

function saveSession(s: Session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function BookMascot() {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="6" y="8" width="28" height="24" rx="4" fill="#c084fc" />
      <path d="M20 8v24" stroke="#fff5fb" strokeWidth="2" opacity="0.55" />
      <rect x="10" y="14" width="7" height="3" rx="1" fill="#f9a8d4" />
      <rect x="10" y="20" width="10" height="2" rx="1" fill="#fff5fb" opacity="0.95" />
    </svg>
  );
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("login");
  const [session, setSession] = useState<Session | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const s = loadSession();
    if (s) {
      setSession(s);
      setScreen("chat");
    }
    setHydrated(true);
  }, []);

  const handleLoggedIn = useCallback((s: Session) => {
    saveSession(s);
    setSession(s);
    setScreen("chat");
  }, []);

  const handleLogout = useCallback(() => {
    clearSession();
    setSession(null);
    setScreen("login");
  }, []);

  if (!hydrated) {
    return (
      <div className="app-shell auth-layout">
        <p className="auth-sub" style={{ margin: 0 }}>
          Loading…
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {screen === "login" && (
        <LoginView
          onSuccess={handleLoggedIn}
          goSignup={() => setScreen("signup")}
        />
      )}
      {screen === "signup" && (
        <SignupView
          onAccountCreated={() => setScreen("login")}
          goLogin={() => setScreen("login")}
        />
      )}
      {screen === "chat" && session && (
        <ChatView session={session} onLogout={handleLogout} onGoGames={() => setScreen("games")} />
      )}
      {screen === "games" && session && (
        <GamesView onLogout={handleLogout} onGoChat={() => setScreen("chat")} />
      )}
    </div>
  );
}

function LoginView({
  onSuccess,
  goSignup,
}: {
  onSuccess: (s: Session) => void;
  goSignup: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await logIn({ email: email.trim(), password });
      let username = "Friend";
      const profile = await fetchProfile(res.user_id);
      if (profile?.username) username = profile.username;
      onSuccess({
        userId: res.user_id,
        accessToken: res.access_token,
        username,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-mascot">
          <div className="auth-mascot-icon">
            <BookMascot />
          </div>
          <h1 className="auth-title">Welcome <span className="title-accent">back</span></h1>
          <p className="auth-sub">Sign in to chat with your study buddy. We keep things calm and helpful.</p>
        </div>
        {error && <div className="error-banner">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@school.com"
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <p className="auth-footer">
          New here?{" "}
          <button type="button" onClick={goSignup}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}

function SignupView({
  onAccountCreated,
  goLogin,
}: {
  onAccountCreated: () => void;
  goLogin: () => void;
}) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      await signUp({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      setSuccess("You are all set. You can sign in now.");
      setTimeout(() => onAccountCreated(), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-mascot">
          <div className="auth-mascot-icon">
            <BookMascot />
          </div>
          <h1 className="auth-title">Join Study <span className="title-accent">Buddy</span></h1>
          <p className="auth-sub">Pick a username your teacher or parent will recognize. Big buttons, simple steps.</p>
        </div>
        {error && <div className="error-banner">{error}</div>}
        {success && <div className="success-banner">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="su-user">Username</label>
            <input
              id="su-user"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={2}
              placeholder="Alex"
              autoComplete="username"
            />
          </div>
          <div className="field">
            <label htmlFor="su-email">Email</label>
            <input
              id="su-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@school.com"
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label htmlFor="su-pass">Password</label>
            <input
              id="su-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account?{" "}
          <button type="button" onClick={goLogin}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

function ChatView({ session, onLogout, onGoGames }: { session: Session; onLogout: () => void; onGoGames: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending, scrollToBottom]);

  const greeting = useMemo(
    () => (
      <div className="welcome-block">
        <p>
          Hi <strong>{session.username}</strong>. Ask a homework question or say what you are working on. Your buddy
          answers in short, friendly sentences.
        </p>
      </div>
    ),
    [session.username]
  );

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setSending(true);
    try {
      const { response } = await sendChat(session.userId, text);
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", content: response },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not get a reply");
      setMessages((m) => m.filter((x) => x.id !== userMsg.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="chat-page">
      <header className="chat-header">
        <div className="chat-brand">
          <div className="chat-brand-badge" aria-hidden>
            SB
          </div>
          <div className="chat-brand-text">
            <h1>Study <span className="title-accent">Buddy</span></h1>
            <p>Homework helper for ages 8 to 16</p>
          </div>
        </div>
        <div className="chat-header-buttons">
          <button type="button" className="btn btn-ghost" onClick={onGoGames}>
            Games
          </button>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="chat-layout">
        <div className="chat-messages" ref={listRef}>
          {messages.length === 0 ? greeting : null}
          {messages.map((msg) => (
            <div key={msg.id} className={`msg ${msg.role === "user" ? "msg-user" : "msg-assistant"}`}>
              <div className="msg-meta">{msg.role === "user" ? "You" : "Study Buddy"}</div>
              {msg.content}
            </div>
          ))}
          {sending && (
            <div className="msg msg-assistant" aria-live="polite">
              <div className="msg-meta">Study Buddy</div>
              <span className="typing-dots" aria-label="Thinking">
                <span />
                <span />
                <span />
              </span>
            </div>
          )}
          {error && <div className="error-banner" style={{ maxWidth: "85%", alignSelf: "center" }}>{error}</div>}
        </div>

        <div className="chat-composer-wrap">
          <form className="chat-composer" onSubmit={handleSend}>
            <textarea
              rows={1}
              placeholder="Type your question here…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSend(e);
                }
              }}
              disabled={sending}
              aria-label="Message"
            />
            <button className="btn btn-send" type="submit" disabled={sending || !input.trim()} title="Send">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          <p className="hint">Press Enter to send. Shift+Enter for a new line.</p>
        </div>
      </div>
    </div>
  );
}

function GamesView({ onLogout, onGoChat }: { onLogout: () => void; onGoChat: () => void }) {
  const [selected, setSelected] = useState<GameId | null>(null);

  const exit = useCallback(() => setSelected(null), []);

  return (
    <div className="games-page">
      <header className="games-header">
        <div className="games-brand">
          <div className="games-brand-badge" aria-hidden>
            SB
          </div>
          <div className="games-brand-text">
            <h1>Study <span className="title-accent">Games</span></h1>
            <p>Fun ways to learn and practice</p>
          </div>
        </div>
        <div className="games-header-buttons">
          <button type="button" className="btn btn-ghost" onClick={onGoChat}>
            Chat
          </button>
          <button type="button" className="btn btn-ghost" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </header>

      <div className="games-layout">
        {selected === null && (
          <div className="games-grid">
            {LOBBY.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`game-card${entry.comingSoon ? " is-coming-soon" : ""}`}
                onClick={() => !entry.comingSoon && setSelected(entry.id)}
                disabled={entry.comingSoon}
                aria-disabled={entry.comingSoon}
              >
                {entry.comingSoon && <span className="game-card-badge">Coming soon</span>}
                <h3>{entry.title}</h3>
                <p>{entry.blurb}</p>
              </button>
            ))}
          </div>
        )}

        {selected === "hangman" && <HangmanGame onExit={exit} />}
        {selected === "quiz" && <QuizGame onExit={exit} />}
        {selected === "imposter" && <ImposterGame onExit={exit} />}
        {selected === "ten-second" && <TenSecondGame onExit={exit} />}
        {selected === "escape-room" && <EscapeRoomGame onExit={exit} />}
        {selected === "two-truths" && <TwoTruthsGame onExit={exit} />}
      </div>
    </div>
  );
}
