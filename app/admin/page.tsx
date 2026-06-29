import type { Metadata } from "next";
import { AdminDashboard } from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin | OTY NYC",
  description: "OTY NYC content admin.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
