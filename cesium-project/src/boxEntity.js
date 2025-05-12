export const addBoxEntity = (viewer) => {
  const longitude = 13.399448;
  const latitude = 52.518766;
  const height = 80;
  const heading = Cesium.Math.toRadians(50); // 45 degrees heading, change as needed
  const pitch = 0;
  const roll = 0;

  const position = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
  const hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
  const orientation = Cesium.Transforms.headingPitchRollQuaternion(position, hpr);

  return viewer.entities.add({
    position,
    orientation,
    box: {
      dimensions: new Cesium.Cartesian3(9.0, 9.0, 9.0),
      outline: true,
      outlineColor: Cesium.Color.BLUE,
      outlineWidth: 2,
      material: Cesium.Color.BLUE.withAlpha(1),
    },
  });
};