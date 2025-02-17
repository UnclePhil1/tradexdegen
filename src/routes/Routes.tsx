import Layout from "../components/dashboard/layout";
import SetBalancePage from "../Pages/balance/funds";
import ComingSoon from "../Pages/comingSoon/coming";
import DocsPage from "../Pages/docs/docs";
import HomePage from "../Pages/home/home";
import Landing from "../Pages/landing/Landing";
import NewPair from "../Pages/pairs/NewPairs";
import PnlPage from "../Pages/pnl/page";
import SettingPage from "../Pages/setting/settings";
// import SwapPage from "../Pages/swap/Swap";
import TradingPage from "../Pages/trading/TradingPage";


const appRoutes = [
  {
    path: "/",
    element: (
      <Landing />
    ),
  },
  {
    path: "/home",
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: "/funds",
    element: (
      <Layout>
        <SetBalancePage />
      </Layout>
    ),
  },
  // {
  //   path: "/swap",
  //   element: (
  //     <SwapPage />
  //   ),
  // },
  {
    path: "/trade",
    element: (
      <Layout>
        <NewPair />
      </Layout>
    ),
  },
  {
    path: "/pnl",
    element: (
      <Layout>
        <PnlPage />
      </Layout>
    ),
  },
  {
    path: "/trading/:id",
    element: (
      <Layout>
        <TradingPage />
      </Layout>
    ),
  },
  {
    path: "/swaps",
    element: (
      <Layout>
        <ComingSoon />
      </Layout>
    ),
  },
  {
    path: "/settings",
    element: (
      <Layout>
        <SettingPage />
      </Layout>
    ),
  },
  {
    path: "/docs",
    element: (
      <Layout>
        <DocsPage />
      </Layout>
    ),
  },

];

export default appRoutes;
