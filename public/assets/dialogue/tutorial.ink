EXTERNAL closeModal()
EXTERNAL switchToCharacter(characterName)
EXTERNAL switchToMainGame()

== Start

Hey, good to see you again! You're a detective, aren't you?

+ [Yep!]
+ [What's up?]
- 

Ah, finally someone I can trust! 

I slept in the tavern yesterday evening after being on night watch, I just woke up and I heard these hushed voices in the other room. 

+ [...]
+ [Oh, interesting!]
  Interesting Indeed! Especially for that time of night.
 - 
 
Then I heard someone say, "That's how we will finally get rid of him. He has been on the throne too long anyways."
 
 + [Did you see who they were?]
 + [What did you do?]
 -
 
 I went outside immediately, but as soon as they heard the door creak they went back out and mixed with everyone else. No chance I could have tracked them down. 
 
 + [You think they're trying to kill the king?]
   That's what I'm worried about.
 + [Oh, that's not good!]
  I think they might try to kill the king.
  
-

He's hosting a masked dance tonight, which is a perfect cover but anything could happen.

+ [Could you tell him to cancel it?]
 And make him look like a laughing stock and a scaredy cat? He'd probably rather die!
+ [Better be on the alert!]
  You bet!
  
  - 

Since they don't know you, could you go to the dance and scout out who's who?

+ [Okay, I'll do that.]
 Thank you so much! I'll tell the king you're coming.
  ++ [No problem!]
+ [Nah, I don't want to risk it. I'll do something else.]
 Ignoring the threat to the king is treason.
 
-


- 
Get to know everyone's names and stories, and when you think you know who the assassins are, tell the king. If you're a friend of mine he'll trust you absolutely and kill them on the spot! 

+ [I better make sure I find the right people then!]

Yep, you'll only get one shot! Keep track of everyone's names, occupations, and anything that seems suspicious. Then go talk to the king!

+ [Sounds good!]
-
<Use WASD to move around and chat to people.>
<Press E to chat to people>


* [Start Main Game] 
  ~ closeModal()
  ~ switchToMainGame()
  -> END
