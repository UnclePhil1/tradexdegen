import React from "react";
import Navbar from "../../components/dashboard/navbar";
import { SwapInterface } from "../../components/swaps/swapInterface";

const ComingSoon: React.FC = () => {
  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-secondary p-4 flex items-center justify-center">
        <SwapInterface />
      </main>
    </div>
  );
};

export default ComingSoon;
