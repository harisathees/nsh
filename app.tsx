import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../project/src/screens/Login";
import { Dashboard } from "../project/src/pages/Dashboard";
import { Layout } from '../project/src/components/layout/Layout';
import { PledgeEntry } from '../project/src/pages/PledgeEntry';
import { Reports } from '../project/src/pages/Reports';
import { Customers } from './src/pages/Customers';
import { Settings } from '../project/src/pages/Settings';
import { ViewPledge } from "../project/src/screens/ViewPledge/ViewPledge";
import { CreatePledge } from '../project/src/screens/CreatePledge/CreatePledge';
import { EditPledge } from "../project/src/screens/EditPledge/EditPledge";
import { ClosePledge } from "../project/src/screens/ClosePledge/ClosePledge";
import NoticePrint from "./src/notice/noticeform/NoticePrint";
import { MetalRatesSettings } from './src/pages/MetalRatesSettings';
import { RedirectBasedOnAuth } from "./src/pages/RedirectBasedOnAuth";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔁 Dynamic redirect for root */}
        <Route path="/" element={<RedirectBasedOnAuth />} />
        
        {/* Static routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/create-pledge" element={<CreatePledge />} />
        <Route path="/view-pledge/:loanId" element={<ViewPledge />} />
        <Route path="/edit-pledge/:loanId" element={<EditPledge />} />
        <Route path="/close-pledge/:loanId" element={<ClosePledge />} />
        <Route path="/print-notice/:loanId" element={<NoticePrint />} />

        {/* Layout-based routes */}
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/pledge-entry" element={<PledgeEntry />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/metal-rates" element={<MetalRatesSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
