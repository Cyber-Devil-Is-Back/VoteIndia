"use client";

import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState, useEffect } from "react";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// Child item type
type SubMenuItemType = {
  name: string;
  icon: ReactNode;
  link: string;
  type?: 'submenuitem';
};

// Menu item with optional children
type MenuItemType = {
  type: 'menuitem';
  name: string;
  icon: ReactNode;
  link: string;
  children?: SubMenuItemType[];
};

// Divider type
type DividerType = {
  type: 'divider';
};

// Unified menu item type
type MenuItem = MenuItemType | DividerType;

// Menu component props
type MenuProps = {
  menus: MenuItem[];
  defaultColor?: string;
  color: string;
  showText: boolean;
};

export default function MenuList(props: MenuProps) {
  const path = usePathname();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Open submenu based on path
  useEffect(() => {
    const openIndex = props.menus.findIndex((item) =>
      item.type === "menuitem" && item.children?.some(child => path.startsWith(child.link))
    );
    setOpenIndex(openIndex !== -1 ? openIndex : null);
  }, [path, props.menus]);

  const handleToggle = (index: number) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <Box sx={{ width: "100%" }} role="presentation">
      <List>
        {props.menus.map((item, index) => {
          if (item.type === "menuitem") {
            const isActive = path.startsWith(item.link);
            const hasChildren = (item.children ?? []).length > 0;
            const isOpen = openIndex === index;

            if (hasChildren) {
              return (
                <Box key={index}>
                  <ListItem disablePadding sx={{
                     "&:hover": isActive ? "" : {
                      border: "1px solid white",
                      color: "white"
                    },
                    boxSizing: "border-box",
                    bgcolor: isActive ? "action.active" : "",
                    color: isActive ? "white" : ""
                  }}>
                    <ListItemButton onClick={() => handleToggle(index)}>
                      <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
                      <ListItemText
                        primary={item.name}
                        sx={{ color: "inherit", pr: 2, overflow: "hidden", whiteSpace: "nowrap", transition: "opacity 0.3s ease, max-width 0.3s ease", opacity: !props.showText ? 0 : 1, maxWidth: !props.showText ? 0 : 200,
                        }}
                      />
                      {isOpen ? <ExpandLess sx={{ color: "inherit" }} /> : <ExpandMore sx={{ color: "inherit" }} />}
                    </ListItemButton>
                  </ListItem>

                  {/* Submenu */}
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children!.map((child, childIndex) => {
                        const childActive = path.startsWith(child.link);
                        return (
                          <ListItem
                            key={childIndex}
                            disablePadding
                            sx={{
                              pl: 4,
                              "&:hover": isActive ? "" : {
                                pl:4,
                                border: "1px solid white",
                                color: "white"
                              
                              },
                              color: childActive ? "white" : "",
                              bgcolor: childActive ? "action.active" : ""
                            }}
                          >
                            <Link href={child.link} style={{ textDecoration: "none", color: "inherit", width: "100%" }}>
                              <ListItemButton>
                                <ListItemIcon sx={{ color: "inherit" }}>{child.icon}</ListItemIcon>
                                <ListItemText
                                  primary={child.name}
                                  sx={{ color: "inherit", pr: 2, overflow: "hidden", whiteSpace: "nowrap", transition: "opacity 0.3s ease, max-width 0.3s ease", opacity: !props.showText ? 0 : 1, maxWidth: !props.showText ? 0 : 200,}}/>
                              </ListItemButton>
                            </Link>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Collapse>
                </Box>
              );
            }

            // Regular menu item (no children)
            return (
              <ListItem
                disablePadding
                key={index}
                sx={{
                  "&:hover": isActive ? "" : {
                    border: "1px solid white",
                    color: "white"
                  },
                  boxSizing: "border-box",
                  bgcolor: isActive ? "action.active" : "",
                  color: isActive ? "white" : ""
                }}
              >
                <Link href={item.link} style={{ textDecoration: "none", color: "inherit", width: "100%" }}>
                  <ListItemButton>
                    <ListItemIcon sx={{ color: "inherit" }}>{item.icon}</ListItemIcon>
                    <ListItemText
                      primary={item.name}
                      sx={{
                        color: "inherit",
                        pr: 5,
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                        transition: "opacity 0.3s ease, max-width 0.3s ease",
                        opacity: !props.showText ? 0 : 1,
                        maxWidth: !props.showText ? 0 : 200,
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          }

          if (item.type === "divider") {
            return <Divider key={index} />;
          }

          return null;
        })}
      </List>
    </Box>
  );
}

export type { MenuItem };
