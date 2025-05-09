const CESIUM_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzMzEzNjkyZC03NjRlLTRkNjItYTVjYi1lMDg2NGNkZmI1NDEiLCJpZCI6Mjk0MzQ2LCJpYXQiOjE3NDQ3MzExODZ9.3GD52Faq8qq6Z75FWZZcgejaYZgW7DKPAy0wJoooJUg';

const initializeCesium = async () => {
  try {
    // Configure Cesium
    Cesium.Ion.defaultAccessToken = CESIUM_TOKEN;
    
    // Initialize viewer
    const viewer = new Cesium.Viewer('cesiumContainer', {
      globe: false,
      geocoder: Cesium.IonGeocodeProviderType.GOOGLE,
    });

    // Load 3D tileset
    await loadTileset(viewer);
    
    // Setup initial view
    setupInitialView(viewer);
    
    // Add entity
    addBoxEntity(viewer);
    
    // Setup controls and camera info
    const cleanup = setupControls(viewer);
    
    // Return cleanup function for proper resource management
    return cleanup;
  } catch (error) {
    console.error('Cesium initialization failed:', error);
    throw error;
  }
};

const loadTileset = async (viewer) => {
  try {
    const tileset = await Cesium.createGooglePhotorealistic3DTileset();
    viewer.scene.primitives.add(tileset);
  } catch (error) {
    console.error('Failed to load tileset:', error);
  }
};

const setupInitialView = (viewer) => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(13.399614, 52.517168, 130),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-15.0),
    },
  });
};

const addBoxEntity = (viewer) => {
  viewer.entities.add({
    position: Cesium.Cartesian3.fromDegrees(13.400985, 52.520560, 100),
    box: {
      dimensions: new Cesium.Cartesian3(9.0, 9.0, 9.0),
      outline: true,
      outlineColor: Cesium.Color.BLUE,
      outlineWidth: 2,
      material: Cesium.Color.BLUE.withAlpha(1),
    },
  });
};

const setupControls = (viewer) => {
  let isPanningRight = false;
  const MOVE_RATE = 0.1;
  
  const panHandler = () => {
    if (!isPanningRight) return;
    
    const { camera } = viewer;
    const direction = Cesium.Cartesian3.cross(camera.direction, camera.up, new Cesium.Cartesian3());
    Cesium.Cartesian3.normalize(direction, direction);
    Cesium.Cartesian3.multiplyByScalar(direction, MOVE_RATE, direction);
    camera.move(direction, 1);
  };

  const updateCameraInfo = () => {
    const { camera } = viewer;
    const pos = camera.positionWC;
    const carto = Cesium.Cartographic.fromCartesian(pos);
    
    const lon = Cesium.Math.toDegrees(carto.longitude).toFixed(6);
    const lat = Cesium.Math.toDegrees(carto.latitude).toFixed(6);
    const height = carto.height.toFixed(2);
    const heading = Cesium.Math.toDegrees(camera.heading).toFixed(2);
    const pitch = Cesium.Math.toDegrees(camera.pitch).toFixed(2);
    const roll = Cesium.Math.toDegrees(camera.roll).toFixed(2);

    document.getElementById('cameraInfo').innerHTML = `
      <b>Camera:</b><br>
      Lon: ${lon}°<br>
      Lat: ${lat}°<br>
      Height: ${height} m<br>
      Heading: ${heading}°<br>
      Pitch: ${pitch}°<br>
      Roll: ${roll}°
    `;
  };

  // Event handlers
  const startPanning = () => { isPanningRight = true; };
  const stopPanning = () => { isPanningRight = false; };

  // Add event listeners
  const panRightBtn = document.getElementById('panRight');
  const stopPanBtn = document.getElementById('stopPan');
  
  panRightBtn.addEventListener('click', startPanning);
  stopPanBtn.addEventListener('click', stopPanning);
  
  // Add scene event listeners
  const preRenderListener = viewer.scene.preRender.addEventListener(panHandler);
  const postRenderListener = viewer.scene.postRender.addEventListener(updateCameraInfo);

  // Return cleanup function
  return () => {
    panRightBtn.removeEventListener('click', startPanning);
    stopPanBtn.removeEventListener('click', stopPanning);
    preRenderListener();
    postRenderListener();
  };
};

// Initialize application
(async () => {
  try {
    const cleanup = await initializeCesium();
    // Optional: Handle window unload to cleanup resources
    window.addEventListener('unload', cleanup);
  } catch (error) {
    console.error('Application failed to start:', error);
  }
})();