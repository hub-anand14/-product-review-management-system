import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          ReviewHub
        </Link>
        
        <div className="navbar-links">
          <Link to="/" className="nav-link">Products</Link>
          
          {user ? (
            <>
              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link">Admin Dashboard</Link>
              )}
              <span className="nav-user">Hello, {user.name}</span>
              <button className="btn-logout" onClick={handleLogoutClick}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="btn-primary">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
