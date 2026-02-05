import React, { useEffect } from 'react';
import { View } from 'react-native';
import { registerRootComponent } from 'expo';
//@ts-ignore
import { Game } from '@game/Game';

function App() {
  useEffect(() => {
    const initGame = async () => {
      // MIRROR OF APP.ts
      const game = Game.getInstance();
      await game.init();
      game.start();
    };
    initGame();
  }, []);

  return <View style={{ flex: 1 }} />; // Game probably renders on a canvas/GL view inside
}

export default registerRootComponent(App);

