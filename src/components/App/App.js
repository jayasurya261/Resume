/* eslint-disable jsx-a11y/media-has-caption */
import React, { useRef, useEffect, useContext, Suspense, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PanZoom } from 'react-easy-panzoom';

import AppContext from '../../context/AppContext';
import PageContext from '../../context/PageContext';

import LeftSidebar from '../LeftSidebar/LeftSidebar';
import RightSidebar from '../RightSidebar/RightSidebar';

import templates from '../../templates';
import PageController from '../../shared/PageController';
import PrintDialog from '../../shared/PrintDialog';
import PanZoomAnimation from '../../shared/PanZoomAnimation';

const App = () => {
  const pageRef = useRef(null);
  const panZoomRef = useRef(null);
  const { i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  const context = useContext(AppContext);
  const { state, dispatch } = context;
  const { theme, settings } = state || {};

  const pageContext = useContext(PageContext);
  const { setPageRef, setPanZoomRef } = pageContext;

  // Detect mobile or resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Initialize page data (desktop only)
  useEffect(() => {
    if (theme) {
      setPageRef(pageRef);
      setPanZoomRef(panZoomRef);
      i18n.changeLanguage(settings?.language || 'en');
      const storedState = JSON.parse(localStorage.getItem('state'));
      if (storedState) dispatch({ type: 'import_data', payload: storedState });
    }
  }, [dispatch, setPageRef, setPanZoomRef, i18n, settings?.language, theme]);

  const handleReturn = () => window.history.back();

  return (
    <Suspense fallback="Loading...">
      <div className="relative h-screen grid grid-cols-5 items-center">
        {/* Normal layout always mounted */}
        <LeftSidebar />

        <div className="relative z-10 h-screen overflow-hidden col-span-3 flex justify-center items-center">
          <PanZoom
            ref={panZoomRef}
            minZoom="0.4"
            autoCenter
            autoCenterZoomLevel={0.7}
            enableBoundingBox
            boundaryRatioVertical={0.8}
            boundaryRatioHorizontal={0.8}
            style={{ outline: 'none' }}
          >
            {theme && (
              <div id="page" ref={pageRef} className="shadow-2xl break-words">
                {templates.find(
                  (x) => theme.layout.toLowerCase() === x.key
                )?.component()}
              </div>
            )}
          </PanZoom>
          <PageController />
        </div>

        <div id="printPage" className="break-words hidden">
          {theme &&
            templates.find((x) => theme.layout.toLowerCase() === x.key)?.component()}
        </div>

        <RightSidebar />

        <PanZoomAnimation />
        <PrintDialog />

        {/* ✅ Mobile overlay (non-destructive) */}
        {isMobile && (
          <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-100 bg-opacity-95 text-center p-6 z-50">
            <h1 className="text-2xl font-semibold mb-4 text-red-600">
              This page cannot be viewed on mobile.
            </h1>
            <p className="text-gray-700 mb-6">
              Please open it on a laptop or desktop computer for the best experience.
            </p>
            <button
              onClick={handleReturn}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
            >
              Return to Last Tab
            </button>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default App;
