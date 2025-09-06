import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "../nsh/src/screens/Login";
import { Dashboard } from "../nsh/src/pages/Dashboard";
import { Layout } from '../nsh/src/components/layout/Layout';
import { PledgeEntry } from '../nsh/src/pages/PledgeEntry';
import { Reports } from '../nsh/src/pages/Reports';
import { Customers } from './src/pages/Customers';
import { Settings } from '../nsh/src/pages/Settings';
import { ViewPledge } from "../nsh/src/screens/Pledges/ViewPledge/ViewPledge";
import { CreatePledge } from '../nsh/src/screens/Pledges/CreatePledge/CreatePledge';
import { EditPledge } from "../nsh/src/screens/Pledges/EditPledge/EditPledge";
import { ClosePledge } from "../nsh/src/screens/Pledges/ClosePledge/ClosePledge";
import NoticePrint from "./src/notice/noticeform/NoticePrint";
import { MetalRatesSettings } from './src/pages/MetalRatesSettings';
import { RedirectBasedOnAuth } from "./src/pages/RedirectBasedOnAuth";
import { RePledge } from "./src/screens/RePledges/CreateRePledge/RePledge";
import { BankManagement } from "./src/screens/RePledges/CreateRePledge/BankManagement";
import { Toaster } from 'react-hot-toast';
import { RepledgeDetails } from "./src/screens/RePledges/RepledgeDetails/RepledgeDetails";
import { ViewRepledge } from "./src/screens/RePledges/ViewRepledge";
import { EditRepledge } from "./src/screens/RePledges/EditRepledge";
import { CloseRepledge } from "./src/screens/RePledges/CloseRepledge/CloseRepledge";

// ProtectedRoute
import { ProtectedRoute } from "./src/screens/Login/auth/ProtectedRoute";
import GoldLoan404 from "./src/screens/404Page/404page";

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-center" />
      <Routes>
        {/* 🔁 Root route decides where to go (dashboard or login) */}
        <Route path="/" element={<RedirectBasedOnAuth />} />

        {/* Public login route */}
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<GoldLoan404 />} />
    
        {/* Routes outside Layout (protected) */}
        <Route
          path="/create-pledge"
          element={
            <ProtectedRoute>
              <CreatePledge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/view-pledge/:loanId"
          element={
            <ProtectedRoute>
              <ViewPledge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-pledge/:loanId"
          element={
            <ProtectedRoute>
              <EditPledge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/close-pledge/:loanId"
          element={
            <ProtectedRoute>
              <ClosePledge />
            </ProtectedRoute>
          }
        />
        <Route
          path="/print-notice/:loanId"
          element={
            <ProtectedRoute>
              <NoticePrint />
            </ProtectedRoute>
          }
        />

        {/* Routes inside the main layout */}
        <Route element={<Layout />}>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/re-pledge-entry/add"
            element={
              <ProtectedRoute>
                <RePledge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/re-pledge-entry/add-bank"
            element={
              <ProtectedRoute>
                <BankManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/re-pledge-entry/details"
            element={
              <ProtectedRoute>
                <RepledgeDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-repledge/:loanId"
            element={
              <ProtectedRoute>
                <ViewRepledge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-repledge/:loanId"
            element={
              <ProtectedRoute>
                <EditRepledge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/close-repledge/:loanId"
            element={
              <ProtectedRoute>
                <CloseRepledge />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pledge-entry"
            element={
              <ProtectedRoute>
                <PledgeEntry />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/metal-rates"
            element={
              <ProtectedRoute>
                <MetalRatesSettings />
              </ProtectedRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
