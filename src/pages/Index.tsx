import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page as default
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-primary">NIGHA TECH Certificate Portal</h1>
        <p className="text-xl text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default Index;
