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
videoElement.src = '/band_seq_2.mp4'; // Path to the video in the public directory  videoElement.loop = true; // Optional: Loop the video
  videoElement.muted = true; // Optional: Mute to avoid autoplay issues
  videoElement.play(); // Start playing the video

  return viewer.entities.add({
    position,
    orientation,
    box: {
      dimensions: new Cesium.Cartesian3(9.0, 9.0, 9.0),
      outline: true,
      outlineColor: Cesium.Color.BLUE,
      outlineWidth: 2,
      material: new Cesium.ImageMaterialProperty({
        image: videoElement, // Use the video element instead of an image
        repeat: new Cesium.Cartesian2(1, 1), // Adjust tiling if needed
        transparent: true, // Set to true if the video has transparency (e.g., WebM with alpha)
      }),
    },
  });
};