import React from "react";

const RightArrow: React.FC<{ size?: number; color?: string }> = ({
  size = 24,
  color = "white",
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 12h14M14 6l6 6-6 6"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RightArrow;
