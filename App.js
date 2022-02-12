import React from 'react';
import Matter from 'matter-js';
import {GameEngine} from 'react-native-game-engine';
import {
  Alert,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Sprites from './src/assets/sprites';
import Pug from './src/components/Pug';
import Floor from './src/components/Floor';
import Pipe from './src/components/Pipe';
import PipeTop from './src/components/PipeTop';

import {randomBetween} from './src/utils';

const {width, height} = Dimensions.get('screen');

const CONSTS = {
  MAX_WIDTH: width,
  MAX_HEIGHT: height,
  GAP_SIZE: 200,
  PIPE_WIDTH: 100,
  PUG_WIDTH: 50,
  PUG_HEIGHT: 41,
};

export const generatePipes = () => {
  let topPipeHeight = randomBetween(100, CONSTS.MAX_HEIGHT / 2 - 100);
  let bottomPipeHeight = CONSTS.MAX_HEIGHT - topPipeHeight - CONSTS.GAP_SIZE;

  let sizes = [topPipeHeight, bottomPipeHeight];

  if (Math.random() < 0.5) {
    sizes = sizes.reverse();
  }

  return sizes;
};

let tick = 0;
let pose = 1;
let pipes = 0;

export const resetPipeCount = () => {
  pipes = 0;
};

export const addPipesAtLocation = (x, world, entities) => {
  let [pipe1Height, pipe2Height] = generatePipes();

  let pipeTopWidth = CONSTS.PIPE_WIDTH + 20;
  let pipeTopHeight = (pipeTopWidth / 205) * 95; // original image is 205x95

  pipe1Height = pipe1Height - pipeTopHeight;

  let pipe1Top = Matter.Bodies.rectangle(
    x,
    pipe1Height + pipeTopHeight / 2,
    pipeTopWidth,
    pipeTopHeight,
    {isStatic: true},
  );

  let pipe1 = Matter.Bodies.rectangle(
    x,
    pipe1Height / 2,
    CONSTS.PIPE_WIDTH,
    pipe1Height,
    {isStatic: true},
  );

  pipe2Height = pipe2Height - pipeTopHeight;

  let pipe2Top = Matter.Bodies.rectangle(
    x,
    CONSTS.MAX_HEIGHT - pipe2Height - 50 - pipeTopHeight / 2,
    pipeTopWidth,
    pipeTopHeight,
    {isStatic: true},
  );

  let pipe2 = Matter.Bodies.rectangle(
    x,
    CONSTS.MAX_HEIGHT - pipe2Height / 2 - 50,
    CONSTS.PIPE_WIDTH,
    pipe2Height,
    {isStatic: true},
  );

  Matter.World.add(world, [pipe1, pipe1Top, pipe2, pipe2Top]);

  entities['pipe' + (pipes + 1)] = {
    body: pipe1,
    scored: false,
    renderer: Pipe,
  };

  entities['pipe' + (pipes + 1) + 'Top'] = {
    body: pipe1Top,
    scored: false,
    renderer: PipeTop,
  };

  entities['pipe' + (pipes + 2)] = {
    body: pipe2,
    scored: false,
    renderer: Pipe,
  };

  entities['pipe' + (pipes + 2) + 'Top'] = {
    body: pipe2Top,
    scored: false,
    renderer: PipeTop,
  };

  pipes += 2;
};

const Physics = (entities, {touches, time, dispatch}) => {
  let engine = entities.physics.engine;
  let world = entities.physics.world;
  let pug = entities.pug.body;

  let hadTouches = false;
  touches
    .filter(t => t.type === 'press')
    .forEach(t => {
      if (!hadTouches) {
        if (world.gravity.y === 0.0) {
          // first press really
          world.gravity.y = 1.2;

          addPipesAtLocation(
            CONSTS.MAX_WIDTH * 2 - CONSTS.PIPE_WIDTH / 2,
            world,
            entities,
          );
          addPipesAtLocation(
            CONSTS.MAX_WIDTH * 3 - CONSTS.PIPE_WIDTH / 2,
            world,
            entities,
          );
        }
        hadTouches = true;
        Matter.Body.setVelocity(pug, {
          x: pug.velocity.x,
          y: -7,
        });
      }
    });

  Object.keys(entities).forEach(key => {
    if (key.indexOf('pipe') === 0 && entities.hasOwnProperty(key)) {
      Matter.Body.translate(entities[key].body, {x: -2, y: 0});

      if (
        key.indexOf('Top') === -1 &&
        parseInt(key.replace('pipe', '')) % 2 === 0
      ) {
        let pipeIndex = parseInt(key.replace('pipe', ''));
        if (
          entities[key].body.position.x < entities.pug.body.position.x &&
          !entities[key].scored
        ) {
          entities[key].scored = true;
          dispatch({type: 'score'});
        }

        if (entities[key].body.position.x <= -1 * (CONSTS.PIPE_WIDTH / 2)) {
          addPipesAtLocation(
            CONSTS.MAX_WIDTH * 2 - CONSTS.PIPE_WIDTH / 2,
            world,
            entities,
          );

          delete entities['pipe' + (pipeIndex - 1)];
          delete entities['pipe' + (pipeIndex - 1) + 'Top'];
          delete entities['pipe' + pipeIndex];
          delete entities['pipe' + pipeIndex + 'Top'];
        }
      }
    } else if (key.indexOf('floor') === 0) {
      if (entities[key].body.position.x <= -1 * (CONSTS.MAX_WIDTH / 2)) {
        Matter.Body.setPosition(entities[key].body, {
          x: CONSTS.MAX_WIDTH + CONSTS.MAX_WIDTH / 2,
          y: entities[key].body.position.y,
        });
      } else {
        Matter.Body.translate(entities[key].body, {x: -2, y: 0});
      }
    }
  });

  Matter.Engine.update(engine, time.delta);

  tick += 1;
  if (tick % 5 === 0) {
    pose = pose + 1;
    if (pose > 3) {
      pose = 1;
    }
    entities.pug.pose = pose;
  }

  return entities;
};

const App = () => {
  const [state, setState] = React.useState({
    isRunning: true,
    score: 0,
  });

  const gameEngine = React.useRef(null);

  const setupWorld = () => {
    let engine = Matter.Engine.create({enableSleeping: false});
    let world = engine.world;
    world.gravity.y = 0.0;

    let pug = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH / 2,
      CONSTS.MAX_HEIGHT / 2,
      CONSTS.PUG_WIDTH,
      CONSTS.PUG_HEIGHT,
    );

    let floor1 = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH / 2,
      CONSTS.MAX_HEIGHT - 25,
      CONSTS.MAX_WIDTH + 4,
      50,
      {isStatic: true},
    );
    let floor2 = Matter.Bodies.rectangle(
      CONSTS.MAX_WIDTH + CONSTS.MAX_WIDTH / 2,
      CONSTS.MAX_HEIGHT - 25,
      CONSTS.MAX_WIDTH + 4,
      50,
      {isStatic: true},
    );

    Matter.World.add(world, [pug, floor1, floor2]);

    Matter.Events.on(engine, 'collisionStart', event => {
      gameEngine.current.dispatch({type: 'game-over'});
    });

    return {
      physics: {engine: engine, world: world},
      floor1: {body: floor1, renderer: Floor},
      floor2: {body: floor2, renderer: Floor},
      pug: {body: pug, pose: 1, renderer: Pug},
    };
  };

  const entities = setupWorld();

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <Image
        style={styles.backgroundImage}
        resizeMode="stretch"
        source={Sprites.background}
      />
      <GameEngine
        onEvent={e => {
          if (e.type === 'game-over') {
            Alert.alert('Perdiste 😥', 'Intentalo de nuevo!', [
              {
                text: 'Volver a jugar 😀',
                onPress: value => {
                  gameEngine.current.swap(setupWorld());
                  setState({
                    score: 0,
                    running: true,
                  });
                },
              },
            ]);
            setState({
              running: false,
            });
          } else if (e.type === 'score') {
            setState({...state, score: state.score + 1});
          }
        }}
        systems={[Physics]}
        ref={gameEngine}
        style={styles.gameContainer}
        running={state.running}
        entities={entities}>
        <StatusBar hidden={true} />
      </GameEngine>

      <Text style={styles.score}>{state.score}</Text>
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
  backgroundImage: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: CONSTS.MAX_WIDTH,
    height: CONSTS.MAX_HEIGHT,
  },
  score: {
    color: 'white',
    fontSize: 72,
    position: 'absolute',
    top: 50,
    left: CONSTS.MAX_WIDTH / 2 - 24,
    textShadowColor: '#222222',
    textShadowOffset: {width: 2, height: 2},
    textShadowRadius: 2,
  },
});

export default App;
