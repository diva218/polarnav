import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import CinematicLanding from './components/landing/CinematicLanding';
import MapPage from './pages/MapPage';
import ModulePage from './pages/ModulePage';

/* ── Shared page transition ── */
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit:    { opacity: 0 },
};
const pageTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] };

/* Adds/removes html.map-view for full-viewport map layout */
function MapViewManager() {
  const location = useLocation();
  useEffect(() => {
    if (location.pathname === '/map') {
      document.documentElement.classList.add('map-view');
    } else {
      document.documentElement.classList.remove('map-view');
    }
  }, [location.pathname]);
  return null;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <>
      <MapViewManager />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>

          {/* 1. Cinematic Homepage */}
          <Route
            path="/"
            element={
              <motion.div
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <CinematicLanding />
              </motion.div>
            }
          />

          {/* 2. Antarctic GIS Map Dashboard (full viewport, no outer scroll) */}
          <Route
            path="/map"
            element={
              <motion.div
                className="w-screen h-screen"
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <MapPage />
              </motion.div>
            }
          />

          {/* 3–6. Operational Module Pages (share Header via ModulePage) */}
          <Route path="/sea-ice"  element={<ModuleWrapper type="sea-ice" />} />
          <Route path="/icebergs" element={<ModuleWrapper type="icebergs" />} />
          <Route path="/routes"   element={<ModuleWrapper type="routes" />} />
          <Route path="/weather"  element={<ModuleWrapper type="weather" />} />
          <Route path="/ocean"    element={<ModuleWrapper type="weather" />} />
          <Route path="/mission"  element={<ModuleWrapper type="mission" />} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function ModuleWrapper({ type }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={pageTransition}
    >
      <ModulePage type={type} />
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
