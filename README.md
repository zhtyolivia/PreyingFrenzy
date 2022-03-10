
# Preying Frenzy
## Project Description 
This is a project create for CS 174A in UCLA with professor Law. This project aims to create a one-player game in which the player can control the fish to move around in the water by using arrow keys. The player fish moves from the left to the right, while other fishes and sharks move from the right to the left. The goal of this game is to eat as many smaller fish as possible to earn more credits which will show on the upper left corner of the screen; meanwhile, the user should avoid the sharks, and as long as the player collides with the sharks, the game will be over. 

## Rules & How to Play 
To play the game, 

 1. Download the repository. 
 2. Start the server with host.command for Mac and host.bat for Windows. 
 3. Open http://localhost:8000/ on your browser. 

Rules of the game: 

 1. Press the four arrow keys to move the player fish.  
 3. Eat as many smaller fishes as possible while avoiding colliding with bigger fish. 
 4. Press 'c' to change the color of the player fish. 
 4. Restart the game when game is over.

## Features 

 - **Lighting**: a point light source is applied to illuminate the scene. 
 -  **Shading**: we use several different shaders, including a Gouraud Shader for common shapes. Shark body, player fish tail, bubble each has a self-defined shader. 
 -  **Projection and Camera Position**: we place the camera at (5, -10, -30) and set the projection matrix with `Mat4.perspective`. 
 -  **Model transform**: we used translation, rotation, and scaling to transform the shapes to what we desire. 
 -  **User interaction**: by making a control panel, we enable player to move the fish in the four directions within the screen, to change color by pressing 'c', and restart the game by pressing Enter. 
 -  **Shapes**: we used spheres and triangles to construct bodies, tails, and fins of different fishes. 
 -  **Animation**: we use animation time to let small fishes move at a certain speed and to let the bubbles expand. 
 -  **Collision Detection**: detect collision of plyawr fish with the small fishes and sharks. Increment credits when colliding with small fish and end the game when colliding with a shark. 
 -  **Texture**: Use texture to apply a background iamge. 

 ## Future Improvements 
 
 - Use obj files to implement more complex objects 
 - Keep track of the highest credits obtained 
 - Add multiple difficulties of the game by varying speeds of sharks 

## Team Members  
**Hongye Li**: laurali233 \
**Olivia Zhang**: zhtyolivia 