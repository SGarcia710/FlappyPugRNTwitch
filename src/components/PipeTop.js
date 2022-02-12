import {View, Text, Image} from 'react-native';
import React from 'react';
import Sprites from '../assets/sprites';

const PipeTop = props => {
  const width = props.body.bounds.max.x - props.body.bounds.min.x;
  const height = props.body.bounds.max.y - props.body.bounds.min.y;
  const x = props.body.position.x - width / 2;
  const y = props.body.position.y - height / 2;

  return (
    <Image
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
      }}
      resizeMode="stretch"
      source={Sprites.pipeTop}
    />
  );
};

export default PipeTop;
