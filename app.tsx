import { Login } from "../project/src/screens/Login";
import ProtectedRoute from "./src/auth/ProtectedRoute"; 
import { Layout } from '../project/src/components/layout/Layout'
import { Dashboard } from '../project/src/pages/Dashboard'
import { PledgeEntry } from '../project/src/pages/PledgeEntry'
import { Reports } from '../project/src/pages/Reports'
import { Customers } from './src/pages/Customers'
import { Settings } from '../project/src/pages/Settings'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ViewPledge } from "../project/src/screens/ViewPledge/ViewPledge";
import { CreatePledge } from '../project/src/screens/CreatePledge/CreatePledge';
import { EditPledge } from "../project/src/screens/EditPledge/EditPledge";
import { ClosePledge } from "../project/src/screens/ClosePledge/ClosePledge";
import NoticePrint from "./src/notice/noticeform/NoticePrint";
import { MetalRatesSettings } from './src/pages/MetalRatesSettings'



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/create-pledge" element={<ProtectedRoute><CreatePledge /></ProtectedRoute>} />
        <Route path="/view-pledge/:loanId" element={<ProtectedRoute><ViewPledge /></ProtectedRoute>} />
        <Route path="/edit-pledge/:loanId" element={<ProtectedRoute><EditPledge /></ProtectedRoute>} />
        <Route path="/close-pledge/:loanId" element={<ProtectedRoute><ClosePledge /></ProtectedRoute>} />
        <Route path="/print-notice/:loanId" element={<ProtectedRoute><NoticePrint /></ProtectedRoute>} />

        {/* Layout-wrapped routes */}
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
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