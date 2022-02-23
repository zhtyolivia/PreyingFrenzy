# Preying Frenzy
## Project Description 
This is a project create for CS 174A in UCLA with professor Law. This project aims to create a one-player game in which the player can control the fish to move around in the water by using arrow keys. The player fish moves from the left to the right, while other fishes and sharks move from the right to the left. The goal of this game is to eat as many smaller fish as possible to earn more credits which will show on the upper left corner of the screen; meanwhile, the user should avoid the bigger fish, and as long as the player collides with the bigger fish, the game will be over. 

## Rules & How to Play 
To play the game, 

 1. Download the repository. 
 2. Start the server with host.command for Mac and host.bat for Windows. 
 3. Open http://localhost:8000/ on your browser. 

Rules of the game: 

 1. Start the game with the "start" button.  
 2. Press the four arrow keys to move the player fish.  
 3. Eat as many smaller fishes as possible while avoiding colliding with bigger fish.  
 4. Restart the game when game is over.

## Features 
**Lighting**: a point light source is applied to illuminate the scene. 
**Shading**: we use several self defined Shaders, including a Gouraud Shader for common shapes, a Tail Shader for the tail of the player fish to create a gradual color change in the tail, and Shaders for the background of the game. 
**Projection and Camera Position**: we place the camera at (5, -10, -30) and set the projection matrix with `Mat4.perspective`. 
**Model transform**: we used translation, rotation, and scaling to transform the shapes to what we desire. 
**User interaction**: by making a control panel, we enable player to move the fish in the four directions within the screen through the button on the control panel or the key strokes. 
**Shapes**: we used spheres and triangles to construct bodies, tails, and fins of different fishes. 
**Animation**: we use animation time to let small fishes move at a certain speed. 

## Team Members  
**Hongye Li**: laurali233 
**Olivia Zhang**: zhtyolivia 