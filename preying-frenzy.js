import {defs, tiny} from './examples/common.js';
import {Gouraud_Shader, Tail_Shader, Shark_Body_Shader} from  './examples/shaders.js';
import { Text_Line } from './examples/text-demo.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Shader, Texture, Material, Scene,
} = tiny;


class Base_Scene extends Scene{
    // Base Scene is for shapes, materials, lights, etc. 

    constructor() {
        super(); 
        // -------------------- Set camera position ------------------- //
        this.initial_camera_position = Mat4.translation(5, -10, -30); 

        // -------------------- Sounds and music ---------------------- //
        

        // -------------------- Light color --------------------------- //
        this.light_color = color(1,1,1,1);
        this.light_position = this.light_position = vec4(-5, 20, 5, 1);
        
    }
    
}

export class Preying_Frenzy_Scene extends Base_Scene {
    constructor() {
        super(); 

        // -------------------- Shape definitions --------------------- //
        this.shapes = {
            // Shapes for player fish 
            player_fish_body: new defs.Subdivision_Sphere(4),
            
            // Shapes for the smaller fishes 
            fish_body: new defs.Subdivision_Sphere(4), 
            fish_tail: new defs.Triangle(),

            // Shapes for the sharks 
            shark_body: new defs.Subdivision_Sphere(4),
            shark_tail: new defs.Triangle(),
            shark_fin: new defs.Closed_Cone(15,15),

            // Shapes for the environment
            environment_sphere: new defs.Subdivision_Sphere(4), 
            
            // Shape for text 
            text: new Text_Line(35),
            square: new defs.Square(),
        }

        // Textured Phone Shader 
        const textured = new defs.Textured_Phong(1);

        // -------------------- Material definisions ------------------- //
        this.materials = {
            // Environment / background 
            environment_sphere: new Material(textured,
                {ambient: 1, texture: new Texture("./assets/ocean.png")}),

            // Shark
            shark: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#F0FFFF")}),
            shark_body: new Material(new Shark_Body_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#F0FFFF")}),

            // Player fish 
            player_fish: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#FFC0CB")}),               
            player_fish_tail: new Material(new Tail_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#FFC0CB")}),
            
            // Smaller fishes 
            fish: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#FAD02C")}), 
            fish_tail: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#FAD02C")}),

            // Text for credit display 
            credit_text: new Material(textured, {
                ambient: 1, diffusivity: 0, specularity: 0, texture: new Texture("assets/text.png")}),
            credit_square: new Material(new Gouraud_Shader, 
                {ambient: 0.4, diffusivity: .9, specularity: 1, color: vec4(1.0, 1.0, 1.0, 0.5) }),
            
        }

        // -------------------- Positions --------------------------- //
        this.player_x_pos = -7; 
        this.player_y_pos = 40; 

        // -------------------- Players stats ----------------------- //
        this.alive = true; 
        this.player_colors = [hex_color('#7DAD80'), 
                            hex_color('#8DAD51'), 
                            hex_color('#AD8C8F'),
                            hex_color('#AD6561'),
                            hex_color('#7199AD')];
        this.player_color_index = 0; 
        this.credits = 0; 

        // -------- Smaller fishes and larger fishes/shraks ----------// 

        // Small fishes: x_pos is in [-28, 18] and y_pos is in [0, 20]. 
        // Initially, 10 fishes are randomly places in the scene and time offsets are maked as zero. 
        this.fishes_x = Array.from({length: 10}, () => Math.floor(Math.random() * 20 - 20));
        this.fishes_y = Array.from({length: 10}, () => Math.floor(Math.random() * 20));
        this.fishes_time_offset = Array(10).fill(0); 
        this.fish_num = 10; // there are always ten small fishes in the scene 
        this.fish_speed = 2; 

        // TODO: adjust shark position boundaries!!!!
        // Initially, 5 sharks are randomly places in the scene
        this.sharks_x = Array.from({length: 4}, () => Math.floor(Math.random() * 13 - 8));
        this.sharks_y = [Math.floor(Math.random() * 3), Math.floor(Math.random() * 3 + 4), Math.floor(Math.random() * 3 + 7), Math.floor(Math.random() * 3 + 11)];
        this.sharks_time_offset = Array(4).fill(0); 
        this.shark_num = 4; // there are always five sharks in the scene 
        this.shark_speed = 1; 
    }

    display(context, program_state) {
        let model_tranform = Mat4.identity(); 

        // Lights 
        this.light_position = vec4(-5, 20, 5, 1); 
        program_state.lights = [new Light(this.light_position, this.light_color, 1000)]; 
        
        // Set camera and projection matrices 
        program_state.set_camera(this.initial_camera_position); 
        program_state.projection_transform = Mat4.perspective(Math.PI / 4, context.width / context.height, 1, 100); 

        this.display_scene(context, program_state);
    }

    make_control_panel() {
        // ---------- Player fish interactions ---------- // 

        // Up movement 
        this.key_triggered_button("Up", ["ArrowUp"], () => {
            if (this.player_y_pos < 80) {
                this.player_y_pos += 1; 
            }
        })
        // down movement 
        this.key_triggered_button("Down", ["ArrowDown"], () => {
            if (this.player_y_pos > 0) {
                this.player_y_pos -= 1; 
            }
        })
        // Left movement 
        this.key_triggered_button("Left", ["ArrowLeft"], () => {
            if (this.player_x_pos > -32) {
                this.player_x_pos -= 1; 
            }
        })
        // Right movement 
        this.key_triggered_button("Right", ["ArrowRight"], () => {
            if (this.player_x_pos < 18) {
                this.player_x_pos += 1; 
            }
        })
        // Right movement 
        this.key_triggered_button("Change Color", ["c"], () => {
            if (this.player_color_index <= this.player_colors.length - 2) {
                this.player_color_index += 1; 
            } else {
                this.player_color_index = 0; 
            }
        })
    }

    display_scene(context, program_state){
        let model_transform = Mat4.identity(); 
        const t = program_state.animation_time, dt = program_state.animation_delta_time / 1000;

        // Light 
        let light_position = this.light_position; 
        let light_color = this.light_color; 

        // Draw background 

        this.display_environment(context, program_state, model_transform);

        // Draw accumulated points and buttons 

        // Draw smaller fishes 
        if (this.alive) {
            for (let i = 0; i < this.fish_num; i++) {
                this.display_small_fish(context, program_state, model_transform, i, t/1000);
                /* TODO: detect collision here */
            }
            
        }
        // Draw player fish 
        if (this.alive) {
            this.display_player_fish(context, program_state, model_transform); 
        }

        // Draw sharks
        if (this.alive) {
            for (let j = 0; j < this.shark_num; j++){
                this.display_shark(context, program_state, model_transform, j, t/1000);  
            }
        }
        
    }

    display_player_fish(context, program_state, model_transform ) {
        // Draw player fish 
        var x = this.player_x_pos; 
        var y = this.player_y_pos; 
        var color = this.player_colors[this.player_color_index]; 

        if (this.alive) {
            // Draw player fish body 
            var player_fish_body_transform = model_transform; 
            player_fish_body_transform = player_fish_body_transform
                .times(Mat4.scale(1.5, 1, 1, 0))
                .times(Mat4.translation(x/2, y/4, 0, 0));
            this.shapes.player_fish_body.draw(context, program_state, player_fish_body_transform, this.materials.player_fish.override({color:color})); 

            // Draw player fish tail 
            var player_fish_tail_transform = player_fish_body_transform;
            player_fish_tail_transform = player_fish_tail_transform
                .times(Mat4.scale(2/1.5, 2, 1, 0))
                .times(Mat4.translation(-0.6, 0, 0))
                .times(Mat4.rotation(-Math.PI*1.25, 0, 0, 1)); 
            this.shapes.fish_tail.draw(context, program_state, player_fish_tail_transform, this.materials.player_fish_tail.override({color:color}));

            // Draw the player fish fins
            var player_fish_fin_transform_above = player_fish_body_transform; 
            player_fish_fin_transform_above = player_fish_fin_transform_above.times(Mat4.translation(0.4,0.8,0,0))
                .times(Mat4.rotation(-Math.PI*1.25, 0, 0, 1));
            this.shapes.fish_tail.draw(context, program_state, player_fish_fin_transform_above, this.materials.fish_tail.override({color:color}));
            
            var player_fish_fin_transform_below = player_fish_body_transform; 
            player_fish_fin_transform_below = player_fish_fin_transform_below.times(Mat4.translation(0.4,-0.8,0,0))
                .times(Mat4.rotation(-Math.PI*1.25, 0, 0, 1));
            this.shapes.fish_tail.draw(context, program_state, player_fish_fin_transform_below, this.materials.fish_tail.override({color:color}));

            // Collision detection 
            this.detect_fish();
            this.detect_shark(); 

            // Credits 
            this.display_credits(context, program_state);
        }
    }

    display_small_fish(context, program_state, model_transform, fish_index, t) {
        // var: function scoped 
        // let: block scoped 
        var fish = []; 
        var x_pos = this.fishes_x[fish_index]; 
        var y_pos = this.fishes_y[fish_index]; 
        var delta_x = this.fish_speed * (t - this.fishes_time_offset[fish_index]); 
        var x_pos_new = x_pos - delta_x; 
        if (x_pos_new > -28) {
            // Body
            let fish_transform = model_transform;
            fish_transform = fish_transform.times(Mat4.translation(x_pos_new, y_pos, 0, 0))
                .times(Mat4.scale(0.75, 0.6, 0.5, 0));
            this.shapes.fish_body.draw(context, program_state, fish_transform, this.materials.fish); 
            // Tail 
            let fish_tail_transform = model_transform;
            fish_tail_transform = fish_tail_transform.times(Mat4.translation(x_pos_new + 0.6, y_pos, 0, 0))
                .times(Mat4.rotation(Math.PI*1.75, 0, 0, 1))
                .times(Mat4.scale(0.75, 0.75, 1, 0)); 
            this.shapes.fish_tail.draw(context, program_state, fish_tail_transform, this.materials.fish_tail); 
        } else {
            // Create a new fish when a fish exits from the left edge
            this.fishes_x[fish_index] = 18;
            this.fishes_y[fish_index] = Math.floor(Math.random() * 20); 
            this.fishes_time_offset[fish_index] = t; 
        }
    }

    display_shark(context, program_state, model_tranform, shark_index, t){
        var shark = [];
        var x_coord = this.sharks_x[shark_index];
        var y_coord = this.sharks_y[shark_index];
        var delta_x2 = this.shark_speed * (t - this.sharks_time_offset[shark_index]);
        var x_coord_new = x_coord - delta_x2;
        if (x_coord_new > -10.5){
            // Body
            let shark_transform = model_tranform;
            shark_transform = shark_transform.times(Mat4.scale(3,1.5,1))
                .times(Mat4.translation(x_coord_new, y_coord,0));
            // Tail
            let shark_tail_transform = model_tranform;
            shark_tail_transform = shark_transform.times(Mat4.translation(0.8,0,0))
                .times(Mat4.scale(0.5,1.5,1))
                .times(Mat4.rotation(-Math.PI*0.25, 0, 0, 1));
            // Fin1
            let shark_fin_transform = model_tranform;
            shark_fin_transform = shark_transform.times(Mat4.scale(1/3,1/1.5,1))
                .times(Mat4.translation(-0.3,1.6,0))
                .times(Mat4.rotation(-Math.PI*0.48,3,0,1));
            // Fin2
            let shark_fin2_transform = model_tranform;
            shark_fin2_transform = shark_transform.times(Mat4.scale(1/3,1/1.5,1))
                .times(Mat4.translation(-0.3,-1.5,-0.5))
                .times(Mat4.rotation(Math.PI*0.6,10,0,1));
        
            this.shapes.shark_tail.draw(context, program_state, shark_tail_transform, this.materials.shark);
            this.shapes.shark_body.draw(context, program_state, shark_transform, this.materials.shark_body);
            this.shapes.shark_fin.draw(context, program_state, shark_fin_transform, this.materials.shark);
            this.shapes.shark_fin.draw(context, program_state, shark_fin2_transform, this.materials.shark);
        } else {
            this.sharks_x[shark_index] = 7;
            if (y_coord >= 0 && y_coord <= 3){
                this.sharks_y[shark_index] = Math.floor(Math.random() * 3);
            }
            else if (y_coord > 3 && y_coord <= 6){
                this.sharks_y[shark_index] = Math.floor(Math.random() * 3 + 4);
            }
            else if(y_coord > 6 && y_coord <= 9) {
                this.sharks_y[shark_index] = Math.floor(Math.random() * 3 + 7);
            }
            else{
                this.sharks_y[shark_index] = Math.floor(Math.random() * 3 + 11);
            }
            //this.sharks_y[shark_index] = Math.floor(Math.random() * 13); 
            this.sharks_time_offset[shark_index] = t;
        }
    }

    display_environment(context, program_state, model_tranform){
        let environment_transform = model_tranform;
        environment_transform = environment_transform.times(Mat4.translation(-8,10,2))
            .times(Mat4.scale(28,30,34));
        this.shapes.environment_sphere.draw(context, program_state, environment_transform, this.materials.environment_sphere);
    }

    // Detect collision with a small fish 
    detect_fish(fish_index, t, speed) {
        /* ---------- collision detection ---------- */ 
        let player_x = this.player_x_pos;
        let player_y = this.player_y_pos;

        let fish_coord_x = this.fishes_x[fish_index] + speed * (t - this.fishes_time_offset[fish_index])
        let fish_coord_y = this.fishes_y[fish_index]
        
        //fish_x_cord converted to turtle_x coords using equation: fish_scale_playerx = fish_x_cord(-2.5) - 32
        //fish_x_cord converted to turtle_x coords using equation: fish_scale_playery = fish_y_cord(4)

        // Get player and fishes on the same scale
        
        let fish_scale_playerx = fish_coord_x * (-2.5) - 32;
        let fish_scale_playery = fish_coord_y * 4;
        
        

        if (Math.abs(fish_scale_playerx - player_x) < 2 && Math.abs(fish_scale_playery - player_y < 3)) {
            this.credits += 1; 
            return this.credits; 
        }
        return -1; 
    }

    /* Detect collision with a shark 
     * returns -1 if no collision with shark is detected 
     * otherwise, return credits earned 
     */ 
    detect_shark(shark_index, t, speed){
        let collision_detected = false;
        
        /* ---------- collision detection ---------- */ 
        let player_x = this.player_x_pos;
        let player_y = this.player_y_pos; 

        let shark_coord_x = this.sharks_x[shark_index] + speed * (t - this.sharks_time_offset[shark_index]);
        let shark_coord_y = this.sharks_y[shark_index]; 

        // Get player and sharks on the same scale
        //shark_x_cord converted to turtle_x coords using equation: fish_scale_playerx = shark_x_cord(4)
        //shark_x_cord converted to turtle_x coords using equation: fish_scale_playery = shark_y_cord(6.15)

        let shark_scale_playerx = shark_coord_x * 4;
        let shark_scale_playery = shark_coord_y * 6.15;
        
        if (Math.abs(shark_scale_playerx - player_x) < 4 && Math.abs(shark_scale_playery - player_y < 5)) {
            this.alive = false; 
            return this.credits;
        }
        return -1; 
    }

    display_credits(context, program_state) {
        let lifes_model = Mat4.identity().times(Mat4.translation(-17,19,4,0)).times(Mat4.scale(3,0.5,1,1));
        let text1_trans = Mat4.identity().times(Mat4.translation(-24, 20.25, 0,0)).times(Mat4.scale(0.8, 0.8, 1,1));
        let player_credits = this.credits;
        this.shapes.text.set_string("Credits:"+player_credits, context.context);
        this.shapes.text.draw(context, program_state, text1_trans, this.materials.credit_text);
        this.shapes.square.draw(context, program_state, lifes_model.times(Mat4.scale(2, 2, .50)), this.materials.credit_square);
    }
}
