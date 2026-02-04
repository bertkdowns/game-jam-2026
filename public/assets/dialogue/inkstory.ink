// EXTERNAL exitGame()
EXTERNAL closeModal()
EXTERNAL switchToCharacter(characterName)
EXTERNAL nextScene()


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



== function closeModal()==
Close Modal
~ return 
== function nextScene()==
Close Modal
~ return 



== function switchToCharacter(characterName) ==
Switch Character {characterName}
~ return







== CharacterSelection

// comment this out for debugging
{closeModal()}

+ [...]

- 


Choose a character:

 + [VisitingBaron] {switchToCharacter("VisitingBaron")}  -> VisitingBaron
 + [StableMaster] {switchToCharacter("StableMaster")} -> StableMaster
 + [Mayor] {switchToCharacter("Mayor")} -> Mayor
 + [Jester] {switchToCharacter("Jester")} -> Jester
 + [General] {switchToCharacter("General")} -> General
 + [Judge] {switchToCharacter("Judge")} -> Judge
 + [Bishop] {switchToCharacter("Bishop")} -> Bishop
 + [HeadEngineer] {switchToCharacter("HeadEngineer")} -> HeadEngineer
 + [Steward] {switchToCharacter("Steward")} -> Steward
 + [HeadChef] {switchToCharacter("HeadChef")}-> HeadChef
 + [King] {switchToCharacter("King")}-> King



== King

So, do you know who are the assassins right?

+ Yep
  -> NextScene
+ Not yet

-> CharacterSelection

=NextScene

 ~ nextScene()

-> CharacterSelection


-> CharacterSelection
-> END



== VisitingBaron

Hello!

This is such a cool party isn't it?

+ [Yeah, I love it!]
  It's so much better than back home.
+ [Not really my scene, but glad you like it]
  You might fit in better back home, they're all pretty boring there.

-
-> MainQs

= MainQs

+ [Wait, so you're visiting?]
  Yeah I just got here a couple weeks back, but I gotta head home soon. Gonna miss this place.
  
+ [What do you think of everyone's costumes?]
  Super cool, very creative. I wish people did parties like this where I'm from. I think it's funny that the {JESTER_NAME} doesn't look at all like a Jester with that mask on!
   ++ [Oh, so you know {JESTER_NAME}?]
        Yeah, don't know many people here but he's with the kings court so I've had a good chat with him. Super nice guy, sooo funny!
   ++ [I don't know who Jordan is, could you introduce me?]
        Nah, that's the point of a masked party man!
+ [What's the best thing about the party?]
   Oh the food is sooo good! Taylor is such a good cook, I totally wish we had someone like that cooking food at home for us. I would kill for it!
+ [Anyways, see you around!]
   Bye!
     -> FINISH_TALKING
   
- 

-> MainQs



-> FINISH_TALKING

== StableMaster

{Gday! | Fancy seeing you again!}

-> MainQs



= MainQs

+ [How has your day been?]
   Fine, I am a bit worried about my horses though, they've been a bit on edge this week and one is a bit sick. 
    ++ [Oh, that's sad!] 
       Kinda, I just want to get back to them and make sure they're okay. 
    ++ [Fair enough.]
       Yeah, so forgive me for being a bit on edge tonight.
    -- -> MainQs
+ [What do you think of everyones masks?]
    It's interesting how the general and the judge both have such expressionless masks, it suits their personality. I swear those guys basically look like that anyway.
    ++ [Sounds like you get stuck with them a lot?]
       More than I would like. 
    ++ [Maybe they have something to hide.]
       I wouldn't be suprised. I think the general might be getting a bit power hungry these days.
+ [A lot of people here right?]
    Yeah, once that mayor gets wind of something, a few words to the king and next thing you know the whole town is invited. Be careful about who you invite {MAYOR_NAME} too.
    

+ [Bye!]
  -> FINISH_TALKING
  
 -

-> MainQs



== Mayor

-> MQ

= MQ
Good evening to you! This is such a wonderful night, I absolutely looove your fit! Oh, I'm so happy that this is hosted tonight and the king is so amazing to do this, just what I wanted! And the mask theme? Perfect! Being a bit of a celebrity I hate the attention you know? Always people wanting to talk, but ah, what can you do? Part of the job am I right?

+ [How's your day?]
 My day was amazing! What a way to end the night! It's been so cool getting to see everyone dressed up. -> HowDay
+ [Bye]

-> FINISH_TALKING
  

= HowDay



+ [Oh, you know who's who then?]
   Yeah but I'm not gonna tell you, that's part of the suprise!
   ++ [okay, fine]
     -> MQ
   ++ [come on, I think I know anyway!]
     Okay, I'll tell you, but don't tell anyone else! -> WhosWho
+ [Oh really?]
   Yeah, I pretty much know who everyone is now, hehe!
   ++ [No way, you're good at this!]
     -> WhosWho
   ++ [Don't tell me, it will ruin the suprise!]
     Don't worry, I won't! -> MQ
+ [What did you get up to today?]
  Oh I had a meeting with {GENERAL_NAME}. The meeting went on for so long you know? I was probably there for hours and hours and hours? And {GENERAL_NAME} barely even said anything the whole time. I don't know what took so long for us to get across. I wanted to get to the party but it just wouldn't end, we had so much to talk about! I guess being the general they're always worried about stuff.
  ++ [Very cool.]
      -> HowDay
+ [Bye!]
  -> FINISH_TALKING
- 
-> MQ

= WhosWho

+ [Who's that guy in the {VISITING_BARON_MASK}?]
   Actually, you got me there, I don't actually know who that person is! I'll have to go talk to them later on.
+ [Who's in the {BISHOP_MASK}?]
   Oh, that's {BISHOP_NAME}, you can just tell immediately. Of course I saw them making that mask one time when I visited them too, so I guess it's a bit easier for me.
   ++ [uh huh]
      They really shouldn't have left their mask out like that.
   ++ [Oh you went to visit them?]
        Yeah, as I was saying, shouldn't leave their mask out like that.
   --
 + [Who's the guy in the {JESTER_MASK}?]
    Oh, that's definitely the Jester. I didn't see him but you can just tell by the way he walks, it's almost like he's tripping over himself trying so desperately to make people laugh.
  + [Bet you don't know who's in the {STEWARD_MASK}!]
    Oh hmm... no that's {STEWARD_NAME}, you can tell by the straw still on their shoes, and besides, they alway come in late to everything! I always say being early makes a better impression, wouldn't you agree?
+ [Anyways...]
   -> HowDay
- 

-> WhosWho
== Jester

Hey hey hey! Today's a great day! {| |Sing with me, hip hip horray!}

How are you enjoying the party?

+ [Kinda sick of it]
   Hey man, you just gotta get into it! Trust me, it'll be a night to remember! Like your fit, why did you choose it?
   ++ [It's nice and inconspicuious]
      Hey, in this enviornment, everything is inconspicuious! Anyways, I'mma go get some more food or something. See ya! -> SeeYa
+ [It's great, best thing ever!]
   I know right?!? The king is the absolute best for hosting this, I love him so much! Makes it totally worth it that I have to humiliate myself in front of the entire kings court every day! 
    ++ [Really? Do you think the king is mean?]
       No of course not, I'm just the Jester it's my job! Pay could be better, but that's what everyone says right?
    ++ [Yes he's amazing, I love him so much!]
       Hey hey, next time he needs an army I'll tell him you'd like to be on the front lines protecting him aye? Nah just kidding man, I like you! 
- 

So what do you think of the coustumes tonight?

+ [Not great, I've seen better]
   Ohhh we got a challenger! I dare you say that to the king, that'd be a laugh! Lucky he didn't hear you!
+ [Oh impeccable, and yours? Absolutely stunning!]
   Yeah, doesn't really suit my profession much but I'm not on duty here anyways, best thing about the party am I right?!?
- 
-> costumes

= costumes
   
+[I see someone has a similar outfit to you!]
 Yeah that chatty mayor got the same outfit as me! Really wish they didn't choose a {MAYOR_MASK}. Quite rude!
+ [Those domino people look cool]
  Ah, that's {VISITING_BARON_NAME} and {STABLEMASTER_NAME} in those matching ones. Don't think they coordinated it either!
+ Good chat!
  -> SeeYa
-
-> costumes
 


+[Bye]

-> FINISH_TALKING

= SeeYa

+ [See Ya]
 See Ya!
+ [Bye]

+ [You're so cool!]
  Haha, thank you! Not as cool as you though!
    ++ [Bye]

- 



-> FINISH_TALKING

== General

Hello kiddo! 

+ [Enjoying the party?]
 Just observing mostly.
 ++ [Looking for anything in particular?]
   Haven't seen you around these parts. I have got my eye on you.
 ++ [Observing is a good thing to do these days.]
   Yeah, I'm a bit worried in this kind of environment where everyone is masked. The king isn't as protected as normal. I'm on high alert.
+ [Many people you know here?]
 Not really. That's what I'm worried about. Anything could happen.
 ++ Why so worried?
   It feels like that I know there is a plot against the king. People wearing masks is a threat against the king's safety.
 ++ [Surely you know some people.]
   Oh, I know Morgan over there. She's a good girl, gets in a bit of a mood sometimes. But it's tough work being an engineer.
 
 - 


+ [I'll see you around, stay out of trouble.]
 See ya.


-> FINISH_TALKING

== Judge

Good day!
-> continue_chat


= continue_chat 

+ [What have you been up to?]
 Well, before this party I'd been reading The Lord of the Rings, my annual tradition. Sad that it got interrupted, I was up to my favourite part.
 ** [What's that book? Never heard of it]
    -> judge_lotr
 ++ [Ah, must have been lovely. But there must be something of value here for an intellectual such as yourself, right?]
    -> whos_the_bishop
+ [Quite the party, isn't it?]
  Not as good as the old days, but better than recently. Is the girl in the red mask the chef? I saw him go into the kitchen before, looking worried. But the food's real good, strange he was so shifty.
+ [Did someone copy your costume?]
  Yeah, Nico seems to have also gone with a {GENERAL_MASK}. It turns out that my costume isn't as original as I thought it was.
+ [Gotta go, see ya!]
  -> CharacterSelection
- 
 
 -> continue_chat
 
= whos_the_bishop

I've been to so many of these things now, you wouldn't believe it. I remember as a young lad when Riley and I came for the first time, those parties were the days. People had a bit more reason then.

+ [Riley? Not sure if I met him.]
  Oh, you know, everyone just calls him Bishop these days, but he and I go way back.
+ [I would have loved to be there.]
  Yeah, it was quite the time. 
  
- Crazy he's the bishop now, didn't see that one coming. Guess with age does come wisdom.

-> continue_chat



-> CharacterSelection


=== judge_lotr ===

You've never heard of it?

*   [Never heard of what?]
    -> judge_lotr_rant
*   [Lord of the Rings?]
    Yes. *That* Lord of the Rings.
    -> judge_lotr_continue
*   [Oh, wait maybe I have.]
    Hm. We'll see.
    -> judge_lotr_quiz


=== judge_lotr_rant ===

Never heard of it.
Never.
Heard.
Of it.

All right. Sit down. This may take a moment.

Books first. *Books*, mind you, not whatever theatrical nonsense came later.
Three volumes, six parts, appendices longer than most respectable novels.

Do you know how it *starts*?

*   [With a war?]
    No.
    A birthday party.
    -> judge_lotr_party
*   [In a tavern?]
     No.
    Hobbits don't even like taverns yet.
    -> judge_lotr_party
*   "I have no idea."
    Exactly.
    -> judge_lotr_party


=== judge_lotr_party ===

A birthday party.
Bilbo Baggins. Eleventy-one years old.
Vanishes mid-speech. Disgraceful. Magnificent.

And already, already, people miss the point.
They think it's about swords.
Or magic.
Or that blasted ring.

It's about *leaving home*.

Did you catch that?

*   [Yes?]
    Hm. We'll see.
    -> judge_lotr_continue
*   [Not really.]
    Of course you didn't.
    -> judge_lotr_continue
*   [Isn't it about the ring?]
    Everyone asks that.
    -> judge_lotr_ring


=== judge_lotr_ring ===

The ring is a problem, not a solution. Like power.
Or authority.
Or judges, if we're being honest.

It corrupts quietly.
Slowly.
Like paperwork.

Frodo doesn't *want* it.
That's the point.
Anyone who wants it shouldn't have it.

Simple, really.

-> judge_lotr_continue


=== judge_lotr_quiz ===

Fine then.
Who carries the ring?

*   [Frodo.]
    Correct.
    -> judge_lotr_ring
*   [Gandalf?]
    Absolutely not.
    He *knows better*.
    -> judge_lotr_ring
*   [Some king?]
    No, no, no.
    You're thinking like a historian, not a reader.
    -> judge_lotr_ring


=== judge_lotr_continue ===
 And then there are the chapters people complain about.

Tom Bombadil.
Trees that talk back.
Songs that go on too long.

I ask you—what is a world, if not a place that refuses to hurry for you?

Anyway.

I suppose I shouldn't expect everyone to have read it. Attention spans have declined.
As has patience and respect for footnotes.

Still.
If you ever find yourself wondering why duty feels heavier than desire—

That's why.

-> judge_lotr_end


=== judge_lotr_end ===

Now.
Where were we?

-> Judge.continue_chat


== Bishop

Greetings, youngster!

+ [Youngster?]
  Hey, if you can sit down without your bones creaking, you're young in my book. The king should've got more chairs.
+ [Greetings!]
  Hope you're enjoying the party more than this old codger!
  
- -> main_loop

= main_loop


+ [Good to see everyone's enjoying it!]
   Yeah, but more interesting to see what they do.
   ++ [a bit of a fan of people watching, are you?]
     Hey, you learn a lot from observing. -> main_loop
   ++ [Why do you say that?]
     There's always something that you learn if you watch and listen carefully.
   -- I noticed today that Russo hasn't been talking to many people. He seems a bit distant since he lost all that money in that bet. -> bet
+ [Good on you for dragging those old bones out here!]
  Hey, better watch your tounge! But if {JUDGE_NAME} can do it, I can. Me and the Judge go way back.
+ [What do you think of the theme?]
  Masks aren't my thing, but this {BISHOP_MASK} is okay. I think {CHEF_NAME}'s made a strange choice with the {CHEF_MASK}, but all good.
   ++ [Fair enough.]
    We'll see what the next theme is. The last one was bubbles, at least this is better. -> main_loop
   ++ [See what next year is.]
     Hey, this won't be the last Global Game Jam! -> main_loop
+ [See ya!]
- 
  -> CharacterSelection

-> CharacterSelection

= bet

+ [bet?] 
  Yeah, I think he bet against the king at the last horserace. Was close, but he got unlucky that day.
   ++ [Why bet against the king?]
     Russo was hoping that he can win a lot of money from the King.
   ++ [The King and Russo were close]
    Yeah after Russo lost the bet, he started to talk to the King less often.

+ [Ah, risky move.]
  I always tell them, it's not worth it, and they never listen.
 
 - 
-> main_loop

== Steward

Hello
-> chat_loop

=chat_loop

+ [I saw you came in late, must have been a busy day!]
  Yeah, the king has always got me working hard. I'm super busy all the time.
+ [What do you think about the dance setup?]
  What I'm wondering is why there are so many animals in the pen out the back? Strange that Russo put them there. They could easily stampede and that would be very dangerous.
+ [I like your style!] 
  Thank you! I pretty hurriedly put it together. Though if we are talking about style, my favourite's probably {ENGINEER_NAME}'s {ENGINEER_MASK}, they did a really good job with that. Unusual for them to put so much effort in something that doesn't matter that much.
+ [See ya!]
-> CharacterSelection

- -> chat_loop
== HeadChef

Bonjour!






Hello!
-> chat_loop


= chat_loop

+ [what's up?]
  Food's going great! But my big knife is missing from the kitchen. A carving knife, great for tearing through flesh. 
  ++ [Oh, that's not good.]
    Yeah, it could be dangerous in the wrong hands. Ask around to see if anyone's been in the kitchen, will you?
+ [Cool to see such a great turnout!]
  Yeah, even the visiting Baron {VISITING_BARON_NAME} came. He seems to really like my food!
 
+ [See ya!]
 -> CharacterSelection
- 
-> chat_loop



- ~ closeModal()


-> CharacterSelection

== HeadEngineer


Hello!
-> chat_loop


= chat_loop

+ [What's up?]
 Hey man, not really in the mood for talking right now.
 ++ [Okay fine, have you seen the stablemaster?]
    {STABLEMASTER_NAME}? Oh, I'm sure she's around somewhere.
+ [Have you seen the steward around?]
  The steward is here? Suprised that grumpy king let her in. Doesn't really like us lowly folk. Oh, that's her in the {STEWARD_MASK}.
+ [Are you enjoying the dance?]
  Why is the king staying up on the balcony? He should come down and dance with the rest of us. Trying to make himself look undefeatable.
+ [See ya!]
 -> CharacterSelection
- 
-> chat_loop


- -> FINISH_TALKING


== SecretStory

This is a secret story!
-> FINISH_TALKING


=== FINISH_TALKING === 
~ closeModal()
-> END
