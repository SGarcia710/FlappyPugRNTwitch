import {View, Text, Image} from 'react-native';
import React from 'react';
import Sprites from '../assets/sprites';

const Pipe = props => {
  const width = props.body.bounds.max.x - props.body.bounds.min.x;
  const height = props.body.bounds.max.y - props.body.bounds.min.y;
  const x = props.body.position.x - width / 2;
  const y = props.body.position.y - height / 2;

  const pipeRatio = 160 / width; // 160 is the original image size
  const pipeHeight = 33 * pipeRatio;
  const pipeIterations = Math.ceil(height / pipeHeight);

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        overflow: 'hidden',
        flexDirection: 'column',
      }}>
      {Array.apply(null, Array(pipeIterations)).map((el, idx) => {
        return (
          <Image
            style={{width: width, height: pipeHeight}}
            key={idx}
            source={Sprites.pipeCore}
            resizeMode="stretch"
          />
        );
      })}
    </View>
  );
};

export default Pipe;
