import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='160' height='120' x='20' y='15' fill='none' stroke='%230B5F7C' stroke-width='2'/%3E%3Cpath d='M40 35h80M40 50h80M40 65h80M40 80h40' stroke='%230B5F7C' stroke-width='1'/%3E%3Ccircle cx='160' cy='35' r='8' fill='none' stroke='%230B5F7C' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 225px',
          backgroundPosition: 'center center',
          backgroundRepeat: 'repeat'
        }}
      />
      
      <div className="text-center relative z-10">
        <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-golden mb-6 overflow-hidden">
          <img 
            src="/logo.jpg" 
            alt="NIGHA TECH Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <h2 className="text-2xl font-semibold mb-4 text-primary">Page Not Found</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-md">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <div className="space-x-4">
          <Button 
            onClick={() => navigate('/login')}
            variant="golden"
            size="lg"
          >
            Go to Login
          </Button>
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            size="lg"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
