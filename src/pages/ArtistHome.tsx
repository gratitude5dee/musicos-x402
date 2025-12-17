import React from "react";
import DashboardLayout from "@/layouts/dashboard-layout";
import { Content } from "@/components/ui/content";
import DraggableGrid from "@/components/dashboard/DraggableGrid";

const Home = () => {
  return (
    <DashboardLayout>
      <Content>
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-white mb-2">Creator Dashboard</h1>
          <p className="text-white/60">Your creative empire at a glance</p>
        </div>
        <DraggableGrid />
      </Content>
    </DashboardLayout>
  );
};

export default Home;