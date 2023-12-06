import { createContext, useContext, useState } from "react";

export const SidebarContext = createContext(null);

export const useSidebar = () => useContext(SidebarContext);
