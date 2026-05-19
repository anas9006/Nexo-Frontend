import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import { useMediaQuery } from "../hooks/useMediaQuery";

const Home = () => {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [mobilePanel, setMobilePanel] = useState("sidebar");

  useEffect(() => {
    if (!isMobile) setMobilePanel("sidebar");
  }, [isMobile]);

  const openChat = () => {
    if (isMobile) setMobilePanel("chat");
  };

  const openSidebar = () => {
    if (isMobile) setMobilePanel("sidebar");
  };

  const showSidebar = !isMobile || mobilePanel === "sidebar";
  const showChat = !isMobile || mobilePanel === "chat";

  return (
    <div className="h-[100dvh] flex flex-col bg-background overflow-hidden">
      <Navbar
        onOpenSidebar={openSidebar}
        showSidebarToggle={isMobile && mobilePanel === "chat"}
      />

      <div className="flex-1 flex min-h-0 p-1.5 sm:p-2 md:p-3 gap-1.5 sm:gap-2 md:gap-3">
        {showSidebar && (
          <aside
            className={`
              nexo-panel flex flex-col min-h-0 shrink-0
              ${isMobile ? "flex-1 w-full" : "hidden md:flex w-[min(100%,17.5rem)] lg:w-80"}
            `}
          >
            <Sidebar onConversationSelect={openChat} />
          </aside>
        )}

        {showChat && (
          <main
            className={`
              nexo-panel flex flex-col flex-1 min-w-0 min-h-0
              ${isMobile ? "w-full" : ""}
            `}
          >
            <ChatWindow onBack={openSidebar} showBack={isMobile} />
          </main>
        )}
      </div>
    </div>
  );
};

export default Home;
