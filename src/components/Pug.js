import {Image} from 'react-native';
import React from 'react';
import Sprites from '../assets/sprites';

const Pug = props => {
  const width = props.body.bounds.max.x - props.body.bounds.min.x;
  const height = props.body.bounds.max.y - props.body.bounds.min.y;
  const x = props.body.position.x - width / 2;
  const y = props.body.position.y - height / 2;

  let image = Sprites['pug' + props.pose];

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
      source={image}
    />
  );
};

export default Pug;
