import { Login } from "../project/src/screens/Login";
import { Layout } from '../project/src/components/layout/Layout'
import { Dashboard } from '../project/src/pages/Dashboard'
import { PledgeEntry } from '../project/src/pages/PledgeEntry'
import { Reports } from '../project/src/pages/Reports'
import { Customers } from './src/pages/Customers'
import { Settings } from '../project/src/pages/Settings'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ViewPledge } from "../project/src/screens/ViewPledge/ViewPledge";
import { CreatePledge } from '../project/src/screens/CreatePledge/CreatePledge';
// import {  } from "module";
import { EditPledge } from "../project/src/screens/EditPledge/EditPledge";
import { ClosePledge } from "../project/src/screens/ClosePledge/ClosePledge";
import NoticePrint from "./src/notice/noticeform/NoticePrint";

import { MetalRatesSettings } from './src/pages/MetalRatesSettings'




export default function App() {
  return (
    <BrowserRouter>
      <Routes>
          {/* Login Page outside layout */}
        <Route path="/" element={<Login />} />
        <Route path="/create-pledge" element={<CreatePledge />} />
        <Route path="/view-pledge/:loanId" element={<ViewPledge />} />
        <Route path="/edit-pledge/:loanId" element={<EditPledge />} />
        <Route path="/close-pledge/:loanId" element={<ClosePledge />} />
        <Route path="/print-notice/:loanId" element={<NoticePrint />} />
        {/* All inner pages inside Layout */}
        <Route path="/" element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/pledge-entry" element={<PledgeEntry />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/settings" element={<Settings />} />
          {/* <Route path="loan-details" element={<Box />} /> */}
          <Route path="/settings/metal-rates" element={<MetalRatesSettings />} />
         
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

