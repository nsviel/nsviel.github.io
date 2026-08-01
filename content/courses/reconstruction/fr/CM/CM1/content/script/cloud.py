import {Circle, makeScene2D} from '@motion-canvas/2d';
import {Vector2} from '@motion-canvas/core';

function cloud(center: Vector2, count: number, radius: number): Vector2[] {
  return Array.from({length: count}, () => {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.sqrt(Math.random()) * radius;

    return center.add([
      Math.cos(angle) * distance,
      Math.sin(angle) * distance,
    ]);
  });
}

export default makeScene2D(function* (view) {
  const cloudA = cloud(new Vector2(-300, 0), 100, 200);
  const cloudB = cloud(new Vector2(300, 0), 100, 200);

  view.add(
    <>
      {cloudA.map((position, index) => (
        <Circle
          key={`a-${index}`}
          position={position}
          size={10}
          fill={'#4da6ff'}
        />
      ))}

      {cloudB.map((position, index) => (
        <Circle
          key={`b-${index}`}
          position={position}
          size={10}
          fill={'#ff8a3d'}
        />
      ))}
    </>,
  );
});
