import React, { useState, useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { MissionHub } from './components/MissionHub';
import { Header } from './components/Header';
import { StatsBar } from './components/StatsBar';
import { MissionMap } from './components/MissionMap';
import { AttributeTable } from './components/AttributeTable';
import { HelpCard } from './components/HelpCard';
import { IntroModal } from './components/Modals/IntroModal';
import { CreatePointModal } from './components/Modals/CreatePointModal';
import { EndChoiceModal } from './components/Modals/EndChoiceModal';
import { ResultModal } from './components/Modals/ResultModal';
import { CatalogModal } from './components/Modals/CatalogModal';
import { LeaderboardModal } from './components/Modals/LeaderboardModal';
import { VectorMissionView } from './components/Vector/VectorMissionView';
import { RasterMissionView } from './components/Raster/RasterMissionView';
import { RSMissionView } from './components/RS/RSMissionView';
import { CoordinateMissionView } from './components/Coordinate/CoordinateMissionView';
import { WelcomeScreen } from './components/WelcomeScreen';
import { useVectorStore } from './store/vectorStore';
import { useRasterStore } from './store/rasterStore';
import { useRSStore } from './store/rsStore';
import { useCoordinateStore } from './store/coordinateStore';
import type { MissionId } from './types/player';
import { pathForRoute, resolveRoute, type AppRoute } from './routes';

type AppView = 'welcome' | 'hub' | 'attribute' | 'vector' | 'raster' | 'rs' | 'coordinate';

const viewFromRoute = (route: AppRoute): AppView => {
  if (route.type === 'mission') return route.missionId;
  return route.type;
};

export const App: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => resolveRoute(window.location.pathname));
  const currentView = viewFromRoute(currentRoute);

  const navigateTo = (view: AppView) => {
    const nextRoute: AppRoute = view === 'welcome'
      ? { type: 'welcome' }
      : view === 'hub'
        ? { type: 'hub' }
        : { type: 'mission', missionId: view };
    const nextPath = pathForRoute(nextRoute);

    if (window.location.pathname !== nextPath) {
      window.history.pushState({}, '', nextPath);
    }
    setCurrentRoute(nextRoute);
  };

  useEffect(() => {
    const route = resolveRoute(window.location.pathname);
    const resolvedPath = pathForRoute(route);

    if (window.location.pathname !== resolvedPath) {
      window.history.replaceState({}, '', resolvedPath);
    }

    const handlePopState = () => {
      setCurrentRoute(resolveRoute(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Attribute Mission State
  const started = useGameStore((s) => s.started);
  const seconds = useGameStore((s) => s.seconds);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const loadScores = useGameStore((s) => s.loadScores);
  const resetAttributeMission = useGameStore((s) => s.resetMission);
  const resetVectorMission = useVectorStore((s) => s.resetMission);
  const setVectorPage = useVectorStore((s) => s.setPage);
  const resetRasterMission = useRasterStore((s) => s.resetMission);
  const resetRSMission = useRSStore((s) => s.resetMission);
  const setCoordinatePage = useCoordinateStore((s) => s.setPage);

  const handleSelectMission = (missionId: MissionId) => {
    if (missionId === 'attribute') {
      resetAttributeMission();
    } else if (missionId === 'vector') {
      resetVectorMission();
      setVectorPage('start');
    } else if (missionId === 'raster') {
      resetRasterMission();
    } else if (missionId === 'rs') {
      resetRSMission();
    } else if (missionId === 'coordinate') {
      setCoordinatePage('start');
    }
    navigateTo(missionId);
  };

  // Countdown timer hook for Attribute Mission
  useEffect(() => {
    if (currentView !== 'attribute' || !started || seconds <= 0) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [currentView, started, seconds, tickTimer]);

  // Initial load of scores
  useEffect(() => {
    loadScores();
  }, [loadScores]);

  // 1. Welcome Screen
  if (currentView === 'welcome') {
    return <WelcomeScreen onContinue={() => navigateTo('hub')} />;
  }

  // 2. Mission Hub Screen
  if (currentView === 'hub') {
    return <MissionHub onSelectMission={handleSelectMission} />;
  }

  // 3. Vector Mission (Mission 2)
  if (currentView === 'vector') {
    return <VectorMissionView onBackToHub={() => navigateTo('hub')} onSelectMission={handleSelectMission} />;
  }

  // 4. Raster Mission (Mission 3)
  if (currentView === 'raster') {
    return <RasterMissionView onBackToHub={() => navigateTo('hub')} onSelectMission={handleSelectMission} />;
  }

  // 5. Remote Sensing Mission (Mission 4)
  if (currentView === 'rs') {
    return (
      <RSMissionView
        onBackToHub={() => navigateTo('hub')}
        onSelectMission={handleSelectMission}
      />
    );
  }

  // 6. Coordinate System Mission (Mission 5)
  if (currentView === 'coordinate') {
    return <CoordinateMissionView onBackToHub={() => navigateTo('hub')} onSelectMission={handleSelectMission} />;
  }

  // 7. Attribute Table Mission (Mission 1)
  return (
    <div className="app-container">
      {/* Top App Header */}
      <Header onBackToHub={() => navigateTo('hub')} />

      {/* Main Map View Area */}
      <main className="main-view">
        {/* Floating Stats */}
        <StatsBar />

        {/* Leaflet GIS Map */}
        <MissionMap />

        {/* Bottom Left Help Card */}
        <HelpCard />

        {/* Bottom Right Interactive Attribute Table */}
        <AttributeTable />
      </main>

      {/* Modals for Attribute Mission */}
      <IntroModal />
      <CreatePointModal />
      <EndChoiceModal />
      <ResultModal onBackToHub={() => navigateTo('hub')} />
      <CatalogModal />
      <LeaderboardModal />
    </div>
  );
};

export default App;
