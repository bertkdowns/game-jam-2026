EXTERNAL closeModal()
EXTERNAL switchCharacter(characterName)
EXTERNAL switchToMainGame()

== Start

Hello! Welcome to the tutorial.

This is where you'll learn how to play the game.

* [Continue] -> TutorialPart1

== TutorialPart1

In this game, you'll be exploring a masked ball and talking to various characters.

You can move around using WASD or arrow keys, and interact with characters by approaching them.

* [Got it!] -> TutorialPart2
* [Tell me more] -> TutorialDetails

== TutorialDetails

The goal is to uncover secrets and solve mysteries by talking to different characters.

Each character has their own story and information to share.

Pay attention to what they say - clues might be hidden in their conversations!

* [I understand] -> TutorialPart2

== TutorialPart2

When you're ready, you can start the main game.

Good luck!

* [Start Main Game] 
  ~ closeModal()
  ~ switchToMainGame()
  -> END
