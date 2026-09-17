import { useEffect, useRef } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { BottomNavigation } from "./components";
import { StoreProvider } from "./store";
import { initTelegram } from "./telegram";
import {
  FeedbackPage,
  FitPage,
  HomePage,
  MissingProductPage,
  MyShadesPage,
  NoMatchPage,
  PreferencesPage,
  ProductPage,
  ProductSearchPage,
  ResultsPage,
  SavedPage,
  ShadeSelectPage,
  StoresPage,
} from "./pages";

const topLevelRoutes = new Set(["/", "/results", "/my-shades", "/saved"]);

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeViewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const webApp = initTelegram();
    const handleBack = () => navigate(-1);
    const shouldShowBack = !topLevelRoutes.has(location.pathname);
    if (shouldShowBack) webApp?.BackButton?.show();
    else webApp?.BackButton?.hide();
    webApp?.BackButton?.onClick(handleBack);
    return () => webApp?.BackButton?.offClick(handleBack);
  }, [location.pathname, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    window.requestAnimationFrame(() => routeViewRef.current?.focus({ preventScroll: true }));
  }, [location.pathname]);

  const showNav = topLevelRoutes.has(location.pathname);

  return (
    <div className="site-shell">
      <div className="ambient ambient--one" />
      <div className="ambient ambient--two" />
      <main className={`app-frame ${showNav ? "has-nav" : ""}`} id="main-content">
        <div className="route-view" key={location.pathname} ref={routeViewRef} tabIndex={-1}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/select" element={<ProductSearchPage />} />
            <Route path="/shade" element={<ShadeSelectPage />} />
            <Route path="/fit" element={<FitPage />} />
            <Route path="/preferences" element={<PreferencesPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/product/:shadeId" element={<ProductPage />} />
            <Route path="/stores/:shadeId" element={<StoresPage />} />
            <Route path="/feedback/:shadeId" element={<FeedbackPage />} />
            <Route path="/my-shades" element={<MyShadesPage />} />
            <Route path="/saved" element={<SavedPage />} />
            <Route path="/no-match" element={<NoMatchPage />} />
            <Route path="/missing" element={<MissingProductPage />} />
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
        {showNav && <BottomNavigation />}
      </main>
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <a className="skip-link" href="#main-content">К основному содержанию</a>
      <AppRoutes />
    </StoreProvider>
  );
}
