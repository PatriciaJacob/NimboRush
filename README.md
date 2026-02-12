# NimboRush

![Title Screen](https://github.com/PatriciaJacob/NimboRush/blob/main/public/title_screen.png "Game title screen")

A pixel art puzzle game starring Nimbus, the LocalStack mascot. Players navigate grid-based levels, deploying S3 buckets. Each AWS service introduces a unique mechanic—Step Functions create literal stepping stones.

### How to run

You can run:

`npm run dev` to run the game locally

`npm run editor` to try out the level editor

Enjoy it!
![Nimbo](https://github.com/PatriciaJacob/NimboRush/blob/main/src/assets/images/Nimbo/NimboWalk/Nimbof%20-%201.png "Nimbo")


<!-- ## Ideas

** Movement & Navigation **
Step Functions (as you mentioned) - Creates bridges/steps across gaps
Lambda - Teleportation pads 
API Gateway - Portals that connect different areas of the level

** Obstacles & Hazards **
CloudWatch - Surveillance cameras that trigger alarms/enemies if you're spotted
WAF (Web Application Firewall) - Literal firewalls blocking paths

** Collectibles & Power-ups **
S3 Buckets - Containers you push to collection points (fits the Sokoban mechanic!)
EC2 Instances - Boxes you can spawn/despawn as platforms
Secrets Manager - Hidden collectibles or keys

** Interactive Elements **
SNS (Simple Notification Service) - Buttons that activate distant objects (send signals)

Level Goals
You could mix both mechanics:
S3 Buckets to targets - Classic Sokoban: push AWS S3 bucket icons to designated storage zones
Reach the green square - Could be an "Availability Zone" marker
Hybrid - Some levels require both (push objects AND reach destination)?

### Primary Mechanic: S3 Buckets
- Push S3 bucket icons to designated "storage zones" (classic Sokoban)
  - Different bucket types: regular, versioned (can be reset), glacier (moves slowly)
  - Or maybe can pick up files and need to fill the bucket before we can deploy it?
- Step Functions - consumable that creates stepping stones in maybe water?
- EC2 Instances - consumable that gives you x platforms to walk over holes, number stays over nimbo head and spawns new instances/platforms as needed. has a limit though.


Interact to spawn/despawn step sequences
Could have limited uses per level
Lambda Functions - Push-button triggers
Execute when activated (create blocks, remove walls, etc.)
"Stateless" = resets when you leave and re-enter trigger zone
EventBridge - The key to complex puzzles
One action triggers multiple reactions across the level
Perfect for "aha!" moments in puzzle design
EC2 Instances - Movable platforms/blocks
Can be pushed like S3 buckets but serve as platforms too
"Start/Stop" mechanic - toggle between solid and passable
VPC (Virtual Private Cloud) - Zones/regions
Color-coded areas, buckets must match their VPC color
Adds layer of complexity to bucket-pushing puzzles
IAM Roles/Policies - Keys and locks
Collect IAM role to unlock certain areas or interact with specific objects
"You need S3:PutObject permission to move buckets in this zone"

### IDEAS
- Create levels editor and then can import/export into json format that use to load
- defining behaviours for entities, so not player entity but player is sort of a thing that has x, y and z behaviours  -->

## Credits

Sound Effects by [freesound_community](https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=41038), [u_o8xh7gwsrj](https://pixabay.com/users/u_o8xh7gwsrj-54433977/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=476370), [Ribhav Agrawal](https://pixabay.com/users/ribhavagrawal-39286533/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=230548) from [Pixabay](https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=41038)