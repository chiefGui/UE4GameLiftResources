_This is a Work-In-Progress project. Feel free to [submit an issue](https://github.com/chiefGui/UE4GameLiftResources/pulls)._

# UE4GameLiftResources
The journey to integrate a game with Amazon's GameLift isn't easy. Let's make it less painful.

### Motivation
Before putting my hands dirty into actually integrating my UE4 project with GameLift, I just skimmed its documentation. At first, I thought it'd be a complex process and I was not wrong. When the day to put my hands on this integration came, I was lost. Even following the official documentation by Amazon, I was lost. Not only the material they provide for you to learn is disjointed, but pitfalls along the way are oftentimes not foreseen by their content.

The main purpose of this repository--more specifically this README--is basically to centralise the most notable and helpful contents and solutions regarding the integration with GameLift. Probably its extent goes way beyond UE4's territory and may help outsiders to get their problems solved, but the main goal is specifically Epic Game's latest Engine.

### Index

1. [Assumptions](#1-assumptions)
2. Where to start?
3. [Quick Concepts](#3-quick-concepts)
4. [Useful links](#4-useful-links)

## [1.](#1-assumptions) Assumptions

The following content here assumes that:

1. You have [Visual Studio](https://www.visualstudio.com/) installed.
2. You have an [Engine version built from source](https://docs.unrealengine.com/en-us/Programming/Development/BuildingUnrealEngine).
3. You're building a session-based, multiplayer game that'll actually rely on [Amazon GameLift](https://aws.amazon.com/gamelift/).

## [3.](#3-quick-concepts) Quick concepts

##### General purpose

#### [Amazon GameLift](https://aws.amazon.com/gamelift/faq/)
  
This is a good page to get a quick overview of all of the key features of Amazon GameLift at a high level. This mostly covers the concept of fleets and scaling.

#### [GameLift Spot Pricing](https://aws.amazon.com/gamelift/pricing/)

GameLift Spots are a great way to save big on GameLift. Sometimes people don't pay attention enough and end up wasting some money on not using it. A true gem from Amazon.

##### Architecture

#### [Using queues for global scale](http://docs.aws.amazon.com/gamelift/latest/developerguide/queues-intro.html)

 Queues can be used to specify regions you want to direct players based on pings your client makes to AWS regions when requesting a game, you can also manually target specific queues without the use of ping information if preferred.

#### [GameLift Aliases](http://docs.aws.amazon.com/gamelift/latest/developerguide/aliases-intro.html)

Aliases can help with a couple of things:

1. Supporting multiple environments of a game server build, if you wanted to run a development, test, and production environment in GameLift for your game you can do this by creating aliases for each one.
2. Updating your game server without impacting players. When you want to promote a new version of your game server to production, you can change the build that an alias uses. GameLift will manage moving players over to the new build for you. This is done by keeping session already in progress on the old build and placing new ones on the new build.

#### [GameLift FlexMatch]()

One option to deal with latency-based matchmaking is using FlexMatch, which will allow you to define your own custom matchmaking logic (which can include grouping/teams) in a way that means that you have no need of servers to run the logic and subsequently request that a session be created by GameLift. It comes at no additional cost when using GameLift and supports more than one matchmaker which is great for scenarios where you want to match differently for different scenarios. I also recommend taking a look at the how it works documentation to get a feel for the kinds of rules you can configure for your game using the service.

##### Integration process

#### [GameLift Integration Plan](http://docs.aws.amazon.com/gamelift/latest/developerguide/gamelift-integration.html)

This is a good place to take a look at the overall tasks needed to integrate with GameLift. The info here covers the basic steps to get you up and running.

#### [GameLift interactions](https://aws.amazon.com/gamelift/technical-overview/)

This page shows the calls that are needed between the Client, GameLift and the Server in order for the game to work on GameLift, it’s a nice way of seeing how simple the flows are between the main actors.

## [4.](#4-useful-links) Useful links

All the links below were useful to me to achieve the so-desired GameLift integration. Probably you'll find some use on them too.

- [Best way to start UE4 Dedicated Servers on demand?](https://gamedev.amazon.com/forums/questions/15607/best-way-to-start-ue4-dedicated-servers-on-demand.html?page=1&pageSize=10&sort=oldest), by [eXi](https://gamedev.amazon.com/forums/users/5575/eXi.html)
- [Tips to integrate Amazon GameLift Server SDK into UE4](https://answers.unrealengine.com/questions/752830/tips-to-integrate-amazon-gamelift-server-sdk-into.html), by [Kyeongho Park](https://answers.unrealengine.com/users/493686/kyeongho-park.html)
- [GameLift Local, no available process](https://gamedev.amazon.com/forums/articles/54050/gameliftlocal-no-available-process.html), by [msergeyy](https://gamedev.amazon.com/forums/users/5564/msergeyy.html)
- [GameLiftClientSDK](https://github.com/YetiTech-Studios/UE4GameLiftClientSDK), by [YetiTech Studios](https://github.com/YetiTech-Studios)
- [GameSparks' Cloud Code support for GameLift (not yet implemented)](https://support.gamesparks.net/support/discussions/topics/1000083949) 
