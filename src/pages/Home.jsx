import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden min-h-0 p-4 gap-4">
        <div className="hidden md:flex w-80 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex-col bg-surface flex-shrink-0">
          <Sidebar />
        </div>
        <div className="flex-1 rounded-2xl overflow-hidden shadow-sm border border-gray-100 flex flex-col min-w-0 min-h-0 bg-background">
          <ChatWindow />
        </div>
      </div>
    </div>
  );
};

export default Home;
