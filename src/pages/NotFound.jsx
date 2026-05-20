import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
        <MessageCircle className="w-8 h-8 text-primary" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold text-text-primary mb-2">404</h1>
      <p className="text-text-secondary text-sm sm:text-base mb-6 text-center">
        This page is out of our reach.
      </p>
      <Link
        to="/"
        className="nexo-btn-primary px-5 py-2.5 text-sm"
      >
        Back to chat
      </Link>
    </div>
  );
};

export default NotFound;
