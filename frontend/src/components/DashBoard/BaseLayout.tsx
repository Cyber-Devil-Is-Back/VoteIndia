import { Box } from "@mui/material";
import { ReactNode, useRef, useState } from "react";

interface Props {
    children: ReactNode;
  }

interface Coordinates {
  x: number;
  y: number;
}
export default function BaseLayout(props:Props){
    const [mousePosition, setMousePosition] = useState<Coordinates>({ x: 0, y: 0 });
    const boxRef = useRef<HTMLDivElement | null>(null);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (boxRef.current) {
          const rect = boxRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          setMousePosition({ x, y });
        }
      };
    return(
        <Box sx={{bgcolor: "background.default",position: "relative",overflow: "hidden",maxheight: "100vh",maxwidth: "100vw",}} ref={boxRef} onMouseMove={handleMouseMove}>
            <Box className="track-ball" sx={{position: "absolute", top: mousePosition.y - 50, left: mousePosition.x - 50,}} />
            <Box sx={{minWidth:'100vw',minHeight:'100vh',bgcolor:'transparent',zIndex:100}} position='relative' display='flex' >
                {props.children}
            </Box>
      </Box>
    );

}