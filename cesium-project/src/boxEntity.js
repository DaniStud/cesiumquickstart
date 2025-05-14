export const addBoxEntity = (viewer) => {
  const longitude = 13.399448;
  const latitude = 52.518766;
  const height = 80;
  const heading = Cesium.Math.toRadians(55);
  const pitch = 0;
  const roll = 0;

  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

  // Create a video element
  const videoElement = document.createElement('video');
  videoElement.src = '/band_seq_2_web.webm'; // Path to the video
  videoElement.loop = true;
  videoElement.muted = true;

  // Start playing the video and handle errors
  videoElement.play().catch((error) => {
    console.error("Video playback failed:", error);
  });

  // Use CallbackProperty to dynamically update the material's image
  const dynamicImage = new Cesium.CallbackProperty(() => {
    return videoElement; // Return the video element for each frame
  }, false);

  return viewer.entities.add({
    position,
    orientation,
    box: {
      dimensions: new Cesium.Cartesian3(9.0, 9.0, 9.0),
      material: new Cesium.ImageMaterialProperty({
        image: dynamicImage, // Use dynamicImage for video
        repeat: new Cesium.Cartesian2(1, 1),
        transparent: false, // Set to false to remove transparency
      }),
    },
  });
};