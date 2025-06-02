import React from "react";

interface FaceIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

const FaceIcon: React.FC<FaceIconProps> = ({
  size = 150,
  strokeColor = "black",
  strokeWidth = 2,
  ...props
}) => {
  return (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
        >
        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <path d="M9 9h.01" />
        <path d="M15 9h.01" />
        </svg>

  );
};

export default FaceIcon;
