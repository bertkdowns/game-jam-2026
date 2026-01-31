Hello!

* [Begin]-> CharacterSelection

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


EXTERNAL closeModal()
== function closeModal()==
Close Modal
~ return 

EXTERNAL switchCharacter(characterName)
== function switchCharacter(characterName)==
Switch Character {characterName}
~ return


== CharacterSelection

Choose a character:

 + [VisitingBaron] {switchCharacter("VisitingBaron")}  -> VisitingBaron
 + [StableMaster] {switchCharacter("StableMaster")} -> StableMaster
 + [Mayor] {switchCharacter("Mayor")} -> Mayor
 + [Jester] {switchCharacter("Jester")} -> Jester
 + [General] {switchCharacter("General")} -> General
 + [Judge] {switchCharacter("Judge")} -> Judge
 + [Bishop] {switchCharacter("Bishop")} -> Bishop
 + [HeadEngineer] {switchCharacter("HeadEngineer")} -> HeadEngineer
 + [Steward] {switchCharacter("Steward")} -> Steward
 + [HeadChef] {switchCharacter("HeadChef")}-> HeadChef


== VisitingBaron

Hello!

This is such a cool party isn't it?

+ [Yeah, I love it!]
  It's so much better than back home
+ [Not really my scene, but glad you like it]
  You might fit in better back home, they're all pretty boring there.

-
-> MainQs

= MainQs

+ [Wait, so you're visiting?]
  Yeah, just got here a couple weeks back, but gotta head home soon. Gonna miss this place.
  
+ [What do you think of everyone's costumes?]
  Super cool, very creative. I wish people did parties like this where i'm from. I think it's funny that the {JESTER_NAME} doesn't look at all like a Jester with that mask on!
   ++ [Oh, so you know {JESTER_NAME}?]
        Yeah, don't know many people here but he's with the kings court so i've had a good chat with him. Super nice guy, sooo funny!
   ++ [I don't know who Jordan is, could you introduce me?]
        Nah, that's the point of a masked party man!
+ [What's the best thing about the party?]
   Oh the foood is sooo good! Taylor is such a good cook, I totally wish we had someone like that cooking food at home for us. I would kill for it!
+ [Anyways, see you around!]
   Bye!
   ++ [Exit]
     -> CharacterSelection
   
- 

-> MainQs



-> CharacterSelection

== StableMaster

{Gday! | Fancy seeing you again!}

-> MainQs



= MainQs

+ [How has your day been?]
   Fine, a bit worried about my horses though, they've been a bit on edge this week and one is a bit sick. 
    ++ [oh, that's sad!] 
       Kinda just want to get back to them and make sure they're okay. 
    ++ [Fair enough.]
       Yeah, so forgive me for being a bit on edge tonight.
    -- -> MainQs
+ [What do you think about everyone's masks?]
    Pretty funny how the general and the judge both have such expressionless masks, suits their personality. I swear those guys basically look like that anyway.
    ++ [Sounds like you get stuck with them a lot?]
       More than I would like. 
    ++ [Maybe they have something to hide.]
       I wouldn't be suprised. I think the general might be getting a bit power hungry these days.
+ [A lot of people here right?]
    yeah, once that mayor gets wind of something, a few words to the king and next thing you know the whole town is invited. Be careful what you invite {MAYOR_NAME} too.
    

+ [Bye!]
  -> CharacterSelection
  
 -

-> MainQs



== Mayor

-> MQ

= MQ
Good Evening to you! This is such a wonderful night, I absolutely looove your fit! Oh, I'm so happy that this is hosted tonight, the king is so amazing to do this, just what I wanted! And the mask theme? Perfect! Being a bit of a celebrity I hate the attention you know? Always people wanting to talk, but ah, what can you do? Part of the job am I right?

+ [How's your day?]
 My day was amazing! And what a way to end the night! It's been so cool getting to see everyone dressed up. -> HowDay
+ [Bye]

-> CharacterSelection
  

= HowDay



+ [Oh, you know who's who then?]
   Yeah, but i'm not gonna tell you, that's part of the suprise!
   ++ [okay, fine]
     -> MQ
   ++ [come on, I think I know anyway!]
     Okay, I'll tell you, but don't tell anyone else! -> WhosWho
+ [Oh really?]
   Yeah, I pretty much know who everyone is now, hehe!
   ++ [No way, you're good at this!]
     -> WhosWho
   ++ [Don't tell me, it'll ruin the suprise!]
     Don't worry, I won't! -> MQ
+ [What did you get up to today?]
  Oh had a meeting with {GENERAL_NAME}. The meeting went on for so long you know? I was probably there for hours and hours and hours? And {GENERAL_NAME} barely even said anything the whole time. I don't know what took so long for us to get across. I wanted to get to the party but it just wouldn't end, we had so much to talk about! I guess being the general they're always worried about stuff.
  ++ [Very cool.]
      -> HowDay
+ [Bye!]
  -> CharacterSelection
- 
-> MQ

= WhosWho

+ [Who's that guy in the {VISITING_BARON_MASK}?]
   Actually, you got me there, I don't actually know who that person is! I'll have to go talk to them later on.
+ [Who's in the {BISHOP_MASK}?]
   Oh, that's {BISHOP_NAME}, you can just tell immediately. Of course, I saw them making that mask one time when I visited them too, so I guess it's a bit easier for me.
   ++ [uh huh]
      They really shouldn't have left their mask out like that.
   ++ [Oh you went to visit them?]
        yeah, as I was saying, shouldn't leave their mask out like that.
   --
 + [Who's the guy in the {JESTER_MASK}?]
    Oh, that's definitely the Jester. I didn't see him but you can just tell by the way he walks, it's almost like he's tripping over himself trying so desperately to make people laugh.
  + [Bet you don't know who's in the {STEWARD_MASK}!]
    Oh hmm... no that's {STEWARD_NAME}, you can tell by the straw still on their shoes, and besides, they alway come in late to everything! I always say being early makes a better impression, wouldn't you agree?
+ [Anyways...]
   -> MQ
- 

-> WhosWho
== Jester

Hey hey hey!

-> CharacterSelection

== General

Hello kiddo! 

+ [Enjoying the party?]
 Just observing mostly.
 ++ [Looking for anything in particular?]
   Haven't seen you around these parts. Got my eye on you.
 ++ [Observing is a good thing to do these days.]
   Yeah, I'm a bit worried in this kind of environment where everyone is masked. The king isn't as protected as normal. I'm on high alert.
+ [Many people you know here?]
 Not really. That's what I'm worried about. Anything could happen.
 ++ Why so worried?
   Part of the job more than anything else.
 ++ [Surely you know some people.]
   Oh, I know morgan over there. He's a good guy, gets in a bit of a mood sometimes. But it's tough work being an engineer.
 
 - 


+ [Bye!]
 See ya.


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

== HeadEngineer

Once upon a time...

 * There were two choices.
 * There were four lines of content.

- They lived happily ever after.



-> CharacterSelection


Do you even know what's going on?

 * Jokes, there's more
 * CHoose MEEE!

- ~ closeModal()
    -> END

== SecretStory

This is a secret story!
    -> END


