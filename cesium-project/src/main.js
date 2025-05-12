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
    
    // Add initial box entity
    let currentEntity = addBoxEntity(viewer);
    
    // Setup controls and camera info
    const cleanup = setupControls(viewer);
    
    // Setup HMR for boxEntity.js
    if (import.meta.hot) {
      import.meta.hot.accept('./boxEntity.js', (newModule) => {
        if (newModule) {
          viewer.entities.remove(currentEntity);
          currentEntity = newModule.addBoxEntity(viewer);
          console.log('Box entity updated via HMR');
        }
      });
    }
    
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
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(13.399614, 52.517168, 130),
    orientation: {
      heading: Cesium.Math.toRadians(0.0),
      pitch: Cesium.Math.toRadians(-15.0),
    },
  });
};

// Import addBoxEntity from separate file
import { addBoxEntity } from './boxEntity.js';

const setupControls = (viewer) => {
  let isPanningRight = false;
  let isPanningLeft = false;
  let isPanningUp = false;
  let isPanningDown = false;
  let isPanningForward = false;
  let isPanningBackward = false;
  const MOVE_RATE = 0.1;

  const panHandler = () => {
    const { camera } = viewer;

    if (isPanningRight) {
      const direction = Cesium.Cartesian3.cross(camera.direction, camera.up, new Cesium.Cartesian3());
      Cesium.Cartesian3.normalize(direction, direction);
      Cesium.Cartesian3.multiplyByScalar(direction, MOVE_RATE, direction);
      camera.move(direction, 1);
    }

    if (isPanningLeft) {
      const direction = Cesium.Cartesian3.cross(camera.up, camera.direction, new Cesium.Cartesian3());
      Cesium.Cartesian3.normalize(direction, direction);
      Cesium.Cartesian3.multiplyByScalar(direction, MOVE_RATE, direction);
      camera.move(direction, 1);
    }

    if (isPanningUp) {
      const direction = Cesium.Cartesian3.clone(camera.up);
      Cesium.Cartesian3.multiplyByScalar(direction, MOVE_RATE, direction);
      camera.move(direction, 1);
    }

    if (isPanningDown) {
      const direction = Cesium.Cartesian3.negate(camera.up, new Cesium.Cartesian3());
      Cesium.Cartesian3.multiplyByScalar(direction, MOVE_RATE, direction);
      camera.move(direction, 1);
    }

    if (isPanningForward) {
      const direction = Cesium.Cartesian3.clone(camera.direction);
      Cesium.Cartesian3.multiplyByScalar(direction, MOVE_RATE, direction);
      camera.move(direction, 1);
    }

    if (isPanningBackward) {
      const direction = Cesium.Cartesian3.negate(camera.direction, new Cesium.Cartesian3());
      Cesium.Cartesian3.multiplyByScalar(direction, MOVE_RATE, direction);
      camera.move(direction, 1);
    }
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
  const startPanningRight = () => { stopAllPanning(); isPanningRight = true; };
  const startPanningLeft = () => { stopAllPanning(); isPanningLeft = true; };
  const startPanningUp = () => { stopAllPanning(); isPanningUp = true; };
  const startPanningDown = () => { stopAllPanning(); isPanningDown = true; };
  const startPanningForward = () => { stopAllPanning(); isPanningForward = true; };
  const startPanningBackward = () => { stopAllPanning(); isPanningBackward = true; };

  const stopAllPanning = () => {
    isPanningRight = false;
    isPanningLeft = false;
    isPanningUp = false;
    isPanningDown = false;
    isPanningForward = false;
    isPanningBackward = false;
  };

  // Add event listeners
  document.getElementById('panRight').addEventListener('mousedown', startPanningRight);
  document.getElementById('panLeft').addEventListener('mousedown', startPanningLeft);
  document.getElementById('panUp').addEventListener('mousedown', startPanningUp);
  document.getElementById('panDown').addEventListener('mousedown', startPanningDown);
  document.getElementById('panForward').addEventListener('mousedown', startPanningForward);
  document.getElementById('panBackward').addEventListener('mousedown', startPanningBackward);
  document.getElementById('stopPan').addEventListener('click', stopAllPanning);

  // Add scene event listeners
  const preRenderListener = viewer.scene.preRender.addEventListener(panHandler);
  const postRenderListener = viewer.scene.postRender.addEventListener(updateCameraInfo);

  // Return cleanup function
  return () => {
    document.getElementById('panRight').removeEventListener('mousedown', startPanningRight);
    document.getElementById('panLeft').removeEventListener('mousedown', startPanningLeft);
    document.getElementById('panUp').removeEventListener('mousedown', startPanningUp);
    document.getElementById('panDown').removeEventListener('mousedown', startPanningDown);
    document.getElementById('panForward').removeEventListener('mousedown', startPanningForward);
    document.getElementById('panBackward').removeEventListener('mousedown', startPanningBackward);
    document.getElementById('stopPan').removeEventListener('click', stopAllPanning);

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