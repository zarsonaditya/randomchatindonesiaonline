import { useState, useEffect, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Socket } from "socket.io-client";
import LoginPage from "@/pages/LoginPage";
import WaitingPage from "@/pages/WaitingPage";
import ChatPage from "@/pages/ChatPage";
import { connectSocket, disconnectSocket } from "@/lib/socket";

type AppState = "login" | "waiting" | "chat";

interface UserProfile {
  username: string;
  age: number;
  gender: string;
}

interface StrangerInfo {
  username: string;
  age: number;
  gender: string;
}

const queryClient = new QueryClient();

function App() {
  const [appState, setAppState] = useState<AppState>("login");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [strangerInfo, setStrangerInfo] = useState<StrangerInfo | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    return () => {
      disconnectSocket();
    };
  }, []);

  const handleJoin = useCallback((profile: UserProfile) => {
    setUserProfile(profile);

    const s = connectSocket();
    setSocket(s);

    s.off("waiting");
    s.off("matched");

    s.on("waiting", () => {
      setAppState("waiting");
    });

    s.on("matched", (data: { roomId: string; stranger: StrangerInfo }) => {
      setStrangerInfo(data.stranger);
      setAppState("chat");
    });

    if (s.connected) {
      s.emit("join", profile);
    } else {
      s.once("connect", () => {
        s.emit("join", profile);
      });
    }

    setAppState("waiting");
  }, []);

  const handleCancelWaiting = useCallback(() => {
    if (socket) {
      socket.emit("leave_room");
    }
    disconnectSocket();
    setSocket(null);
    setAppState("login");
  }, [socket]);

  const handleLeaveChat = useCallback(() => {
    disconnectSocket();
    setSocket(null);
    setStrangerInfo(null);
    setAppState("login");
  }, []);

  const handleFindNew = useCallback(() => {
    setStrangerInfo(null);
    setAppState("waiting");
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleWaiting = () => {
      setStrangerInfo(null);
      setAppState("waiting");
    };

    const handleMatched = (data: { roomId: string; stranger: StrangerInfo }) => {
      setStrangerInfo(data.stranger);
      setAppState("chat");
    };

    socket.on("waiting", handleWaiting);
    socket.on("matched", handleMatched);

    return () => {
      socket.off("waiting", handleWaiting);
      socket.off("matched", handleMatched);
    };
  }, [socket]);

  return (
    <QueryClientProvider client={queryClient}>
      {appState === "login" && <LoginPage onJoin={handleJoin} />}

      {appState === "waiting" && userProfile && (
        <WaitingPage
          username={userProfile.username}
          onCancel={handleCancelWaiting}
        />
      )}

      {appState === "chat" && socket && userProfile && strangerInfo && (
        <ChatPage
          socket={socket}
          userProfile={userProfile}
          stranger={strangerInfo}
          onLeave={handleLeaveChat}
          onFindNew={handleFindNew}
        />
      )}
    </QueryClientProvider>
  );
}

export default App;
