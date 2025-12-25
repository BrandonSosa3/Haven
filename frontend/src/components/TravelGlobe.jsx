import { useEffect, useRef } from 'react';

function TravelGlobe() {
  const globeRef = useRef(null);
  const worldRef = useRef(null);

  useEffect(() => {
    // Dynamically load scripts
    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initGlobe = async () => {
      // Check if scripts already loaded
      if (window.Globe) {
        createGlobe();
        return;
      }

      try {
        await loadScript('https://unpkg.com/three@0.128.0/build/three.min.js');
        await loadScript('https://unpkg.com/globe.gl');
        createGlobe();
      } catch (err) {
        console.error('Failed to load globe libraries:', err);
      }
    };

    const createGlobe = () => {
      if (!globeRef.current || worldRef.current) return;

      const world = window.Globe()
        (globeRef.current)
        .backgroundColor('rgba(0,0,0,0)')
        .showAtmosphere(true)
        .atmosphereColor('#2D7A7A')
        .atmosphereAltitude(0.12)
        .width(globeRef.current.offsetWidth)
        .height(globeRef.current.offsetHeight)
        .globeMaterial({ transparent: true, opacity: 1 });

      // Load countries
      fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
        .then(res => res.json())
        .then(countries => {
          world
            .polygonsData(countries.features)
            .polygonCapColor(() => '#FFFFFF')
            .polygonSideColor(() => 'rgba(255, 255, 255, 0.85)')
            .polygonStrokeColor(() => '#2D7A7A')
            .polygonAltitude(0.01)
            .polygonLabel(({ properties: d }) => `
              <div style="
                background: #FFFFFF; 
                padding: 12px 16px; 
                border: 1px solid #E8EAED; 
                border-radius: 8px; 
                color: #1A1A1A;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
              ">
                <b style="color: #2D7A7A; font-size: 15px; font-weight: 500;">${d.ADMIN}</b>
              </div>
            `);
        });

      world.globeMaterial().color = { r: 0.95, g: 0.95, b: 0.95 };
      world.controls().autoRotate = true;
      world.controls().autoRotateSpeed = 0.3;
      world.controls().enableZoom = true;
      world.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);

      worldRef.current = world;

      // Handle resize
      const handleResize = () => {
        if (worldRef.current && globeRef.current) {
          worldRef.current.width(globeRef.current.offsetWidth);
          worldRef.current.height(globeRef.current.offsetHeight);
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    };

    initGlobe();

    return () => {
      // Cleanup
      if (worldRef.current) {
        worldRef.current = null;
      }
    };
  }, []);

  return (
    <div 
      ref={globeRef} 
      style={{ 
        width: '100%', 
        height: '100%',
        minHeight: '600px',
        position: 'relative',
        zIndex: 1
      }} 
    />
  );
}

export default TravelGlobe;