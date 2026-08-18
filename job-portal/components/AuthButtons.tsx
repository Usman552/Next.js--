import { FaSignInAlt, FaUserPlus } from "react-icons/fa";

const AuthButtons = () => {
  return (
    <div className="flex items-center gap-3">
      <button className="flex items-center gap-2 rounded-md border px-4 py-2 text-sm">
        <FaSignInAlt />
        <span>Login</span>
     
      </button>

      <button className="flex items-center gap-2 rounded-md px-4 py-2 text-sm bg-primary text-primary-foreground">
        <FaUserPlus />
        <span>Sign Up</span>
       
      </button>
    </div>
  );
};

export default AuthButtons;