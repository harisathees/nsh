import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../nsh/src/screens/Login";
import { Dashboard } from "../nsh/src/pages/Dashboard";
import { Layout } from '../nsh/src/components/layout/Layout';
import { PledgeEntry } from '../nsh/src/pages/PledgeEntry';
import { Reports } from '../nsh/src/pages/Reports';
import { Customers } from './src/pages/Customers';
import { Settings } from '../nsh/src/pages/Settings';
import { ViewPledge } from "../nsh/src/screens/ViewPledge/ViewPledge";
import { CreatePledge } from '../nsh/src/screens/CreatePledge/CreatePledge';
import { EditPledge } from "../nsh/src/screens/EditPledge/EditPledge";
import { ClosePledge } from "../nsh/src/screens/ClosePledge/ClosePledge";
import NoticePrint from "./src/notice/noticeform/NoticePrint";
import { MetalRatesSettings } from './src/pages/MetalRatesSettings';
import { RedirectBasedOnAuth } from "./src/pages/RedirectBasedOnAuth";
import { RepledgeEntryForm } from "./src/screens/RePledge/RepledgeEntryForm";
import { BanksPage } from "./src/pages/BanksPage";
import { RePledge } from "./src/screens/RePledge/RePledge";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 🔁 Root route decides where to go (dashboard or login) */}
        <Route path="/" element={<RedirectBasedOnAuth />} />

        {/* Public login route */}
        <Route path="/login" element={<Login />} />

        {/* Routes outside Layout */}
        <Route path="/create-pledge" element={<CreatePledge />} />
        <Route path="/view-pledge/:loanId" element={<ViewPledge />} />
        <Route path="/edit-pledge/:loanId" element={<EditPledge />} />
        <Route path="/close-pledge/:loanId" element={<ClosePledge />} />
        <Route path="/print-notice/:loanId" element={<NoticePrint />} />

        {/* Routes inside the main layout */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/re-pledge-entry/add" element={<RePledge />} />
          <Route path="/pledge-entry" element={<PledgeEntry />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/settings/metal-rates" element={<MetalRatesSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
