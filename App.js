import React from 'react';
import Matter from 'matter-js';
import {GameEngine} from 'react-native-game-engine';
import {
  Alert,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

const {width, height} = Dimensions.get('screen');

const CONSTS = {
  MAX_WIDTH: width,
  MAX_HEIGHT: height,
  GAP_SIZE: 200,
  PIPE_WIDTH: 100,
};

const randomBetween = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generatePipes = () => {
  let topPipeHeight = randomBetween(100, CONSTS.MAX_HEIGHT / 2 - 100);
  let bottomPipeHeight = CONSTS.MAX_HEIGHT - topPipeHeight - CONSTS.GAP_SIZE;

  let sizes = [topPipeHeight, bottomPipeHeight];

  if (Math.random() < 0.5) {
    sizes = sizes.reverse();
  }

  return sizes;
};

const Physics = (entities, {touches, time}) => {
  let engine = entities.physics.engine;
  let bird = entities.bird.body;
  touches
    .filter(t => t.type === 'press')
    .forEach(t => {
      Matter.Body.applyForce(bird, bird.position, {x: 0.0, y: -0.1});
    });

  for (let i = 1; i <= 4; i++) {
    if (entities['pipe' + i].body.position.x <= -1 * (CONSTS.PIPE_WIDTH / 2)) {
      Matter.Body.setPosition(entities['pipe' + i].body, {
        x: CONSTS.MAX_WIDTH * 2 - CONSTS.PIPE_WIDTH / 2,
        y: entities['pipe' + i].body.position.y,
      });
    } else {
      Matter.Body.translate(entities['pipe' + i].body, {x: -1, y: 0});
    }
  }

  Matter.Engine.update(engine, time.delta);

  return entities;
};

const Wall = props => {
  const width = props.size[0];
  const height = props.size[1];
  const x = props.body.position.x - width / 2;
  const y = props.body.position.y - height / 2;

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        backgroundColor: props.color,
      }}
    />
  );
};

const Bird = props => {
  const width = props.size[0];
  const height = props.size[1];
  const x = props.body.position.x - width / 2;
  const y = props.body.position.y - height / 2;

  return (
    <View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: width,
        height: height,
        // backgroundColor: props.color,
      }}>
      <Image
        style={{
          width,
          height,
        }}
        resizeMode="contain"
        source={require('./src/assets/images/Jupiter.png')}
      />
    </View>
  );
};

const App = () => {
  const [state, setState] = React.useState({
    isRunning: true,
  });

  const gameEngine = React.useRef(null);

  const setupWorld = () => {
    let engine = Matter.Engine.create({enableSleeping: false});
    let world = engine.world;

    let bird = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH / 4,
      CONSTS.MAX_HEIGHT / 2,
      50,
      50,
    );

    let floor = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH / 2,
      CONSTS.MAX_HEIGHT - 25,
      CONSTS.MAX_WIDTH,
      50,
      {isStatic: true},
    );
    let ceiling = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH / 2,
      25,
      CONSTS.MAX_WIDTH,
      50,
      {isStatic: true},
    );

    let [pipe1Height, pipe2Height] = generatePipes();

    let pipe1 = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH - CONSTS.PIPE_WIDTH / 2,
      pipe1Height / 2,
      CONSTS.PIPE_WIDTH,
      pipe1Height,
      {isStatic: true},
    );
    let pipe2 = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH - CONSTS.PIPE_WIDTH / 2,
      CONSTS.MAX_HEIGHT - pipe2Height / 2,
      CONSTS.PIPE_WIDTH,
      pipe2Height,
      {isStatic: true},
    );

    let [pipe3Height, pipe4Height] = generatePipes();

    let pipe3 = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH * 2 - CONSTS.PIPE_WIDTH / 2,
      pipe3Height / 2,
      CONSTS.PIPE_WIDTH,
      pipe3Height,
      {isStatic: true},
    );
    let pipe4 = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH * 2 - CONSTS.PIPE_WIDTH / 2,
      CONSTS.MAX_HEIGHT - pipe4Height / 2,
      CONSTS.PIPE_WIDTH,
      pipe4Height,
      {isStatic: true},
    );

    Matter.Events.on(engine, 'collisionStart', event => {
      gameEngine.current.dispatch({type: 'game-over'});
    });

    Matter.World.add(world, [bird, floor, ceiling, pipe1, pipe2, pipe3, pipe4]);

    return {
      physics: {engine: engine, world: world},
      bird: {body: bird, size: [50, 50], color: 'blue', renderer: Bird},
      floor: {
        body: floor,
        size: [CONSTS.MAX_WIDTH, 50],
        color: 'green',
        renderer: Wall,
      },
      ceiling: {
        body: ceiling,
        size: [CONSTS.MAX_WIDTH, 50],
        color: 'green',
        renderer: Wall,
      },
      pipe1: {
        body: pipe1,
        size: [CONSTS.PIPE_WIDTH, pipe1Height],
        color: 'green',
        renderer: Wall,
      },
      pipe2: {
        body: pipe2,
        size: [CONSTS.PIPE_WIDTH, pipe2Height],
        color: 'green',
        renderer: Wall,
      },
      pipe3: {
        body: pipe3,
        size: [CONSTS.PIPE_WIDTH, pipe3Height],
        color: 'green',
        renderer: Wall,
      },
      pipe4: {
        body: pipe4,
        size: [CONSTS.PIPE_WIDTH, pipe4Height],
        color: 'green',
        renderer: Wall,
      },
    };
  };

  const entities = setupWorld();

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <GameEngine
        onEvent={e => {
          if (e.type === 'game-over') {
            Alert.alert('Perdiste 😥', 'Intentalo de nuevo!', [
              {
                text: 'Volver a jugar 😀',
                onPress: value => {
                  gameEngine.current.swap(setupWorld());
                  setState({
                    running: true,
                  });
                },
              },
            ]);
            setState({
              running: false,
            });
          }
        }}
        systems={[Physics]}
        ref={gameEngine}
        style={styles.gameContainer}
        running={state.running}
        entities={entities}>
        <StatusBar hidden={true} />
      </GameEngine>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  gameContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default App;
