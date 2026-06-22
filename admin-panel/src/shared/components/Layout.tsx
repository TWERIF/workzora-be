import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout(){
  return(
      <main className="w-full">
        <Sidebar />
        <Outlet />
      </main>
  )
}