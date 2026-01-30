

// Character Names
CONST VISITING_BARON_NAME = "Alex"
CONST STABLEMASTER_NAME = "Russo"
CONST MAYOR_NAME = "Vinnie"
CONST JESTER_NAME = "Jordan"
CONST GENERAL_NAME = "Nico"
CONST JUDGE_NAME = "Angelo"
CONST BISHOP_NAME = "Riley"
CONST ENGINEER_NAME = "Morgan"
CONST STEWARD_NAME = "Casey"
CONST CHEF_NAME = "Taylor"

// Character mask descriptions
CONST VISITING_BARON_MASK = "domino mask"
CONST STABLEMASTER_MASK = "domino mask"
CONST MAYOR_MASK = "plague mask"
CONST JESTER_MASK = "plague mask"
CONST GENERAL_MASK = "expressionless mask" 
CONST JUDGE_MASK = "expressionless mask"
CONST BISHOP_MASK = "animal mask"
CONST ENGINEER_MASK = "fancy red mask"
CONST STEWARD_MASK = "fancy green mask"
CONST CHEF_MASK = "split face mask"


=== CharacterSelection ====

Choose a character:

 + [VisitingBaron] -> VisitingBaron
 + [StableMaster] -> StableMaster
 + [Mayor] -> Mayor
 + [Jester] -> Jester
 + [General] -> General
 + [Judge] -> Judge
 + [Bishop] -> Bishop
 + [HeadEngineer] -> HeadEngineer
 + [Steward] -> Steward
 + [HeadChef] -> HeadChef


== VisitingBaron

Hello!

This is such a cool party isn't it?

+ [Yeah, I love it!]
  It's so much better than back home
+ [Not really my scene, but glad you like it]
  You might fit in better back home, they're all pretty boring there.

- Anyway...

+ Bye!

-> CharacterSelection

== StableMaster

Gday!

-> CharacterSelection

== Mayor

Good Evening to you!

-> CharacterSelection

== Jester

Hey hey hey!

-> CharacterSelection

== General

Hello kiddo!

-> CharacterSelection

== Judge

Good day!

-> CharacterSelection

== Bishop

Greetings!

-> CharacterSelection

== Steward

Yo wassup?

-> CharacterSelection

== HeadChef

Bonjour!
- ~ closeModal()

-> CharacterSelection

=== HeadEngineer ===

Once upon a time...

 * There were two choices.
 * There were four lines of content.

- They lived happily ever after.



-> CharacterSelection

EXTERNAL closeModal()

Do you even know what's going on?

 * Jokes, there's more
 * CHoose MEEE!

- ~ closeModal()
    -> END

== SecretStory

This is a secret story!
    -> END


