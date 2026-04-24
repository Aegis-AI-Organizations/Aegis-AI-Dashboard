import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MobileNav } from "./MobileNav";

import { css } from "styled-system/css";

export const AdminLayout: React.FC = () => {
  return (
    <div
      className={css({
        display: "flex",
        bg: "bg.main",
        h: "full",
        w: "full",
        overflow: "hidden",
        color: "text.main",
        fontFamily: "sans",
        _selection: { bg: "brand.primary/30", color: "cyan.200" },
      })}
    >
      <Sidebar />
      <div
        className={css({
          flex: "1",
          display: "flex",
          flexDir: "column",
          minWidth: "0",
        })}
      >
        <Topbar />
        {/* Main Content Area */}
        <main
          className={css({
            flex: "1",
            overflowX: "hidden",
            overflowY: "auto",
            p: "pagePadding",
            pb: { base: "32", md: "8" },
          })}
        >
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
