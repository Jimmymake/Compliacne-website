import React from "react";

function Buttoncomb({ 
  children, 
  onClick, 
  type = "button", 
  className = "", 
  disabled = false 
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded-md font-semibold transition-all duration-300 
                  ${disabled 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-blue-600 hover:bg-blue-700 text-white"} 
                  ${className}`}
    >
      {children}
    </button>
  );
}

export default Buttoncomb;
