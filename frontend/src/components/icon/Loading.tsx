import React from "react";

interface LoadingProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  strokeColor?: string;
  strokeWidth?: number;
}

const Loading: React.FC<LoadingProps> = ({
  size = 24,
  strokeColor = "currentColor",
  strokeWidth = 4,
  ...props
}) => {
  return (
    <svg
      {...props}
      className={`animate-spin ${props.className || ""}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      <path
        className="opacity-75"
        fill={strokeColor}
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
};

export default Loading;
