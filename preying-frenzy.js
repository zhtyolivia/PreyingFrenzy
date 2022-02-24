import {defs, tiny} from './examples/common.js';

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

        // -------------------- Shape definitions --------------------- //
        this.shapes = {
            // Shapes for player fish 
            player_fish_body: new defs.Subdivision_Sphere(4),
            
            // Shapes for the smaller fishes 
            fish_body: new defs.Subdivision_Sphere(4), 
            fish_tail: new defs.Triangle(),
            shark_body: new defs.Subdivision_Sphere(4),
            shark_tail: new defs.Triangle(),
            shark_fin: new defs.Closed_Cone(15,15),
            
        }

        // -------------------- Material definisions ------------------- //
        this.materials = {
            // Environment / background 
            
            // Bigger fish / shark / octopus / whatever 
            
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
            shark: new Material(new Gouraud_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#F0FFFF")}),
        }

        // -------------------- Positions --------------------------- //
        this.player_x_pos = 0; 
        this.player_y_pos = 0; 

        // -------------------- Players stats ----------------------- //
        this.alive = true; 

        // -------- Smaller fishes and larger fishes/shraks ----------// 
        // Small fishes: x_pos is in [-28, 18] and y_pos is in [0, 20]. 

        // Initially, 10 fishes are randomly places in the scene and time offsets are maked as zero. 
        this.fishes_x = Array.from({length: 10}, () => Math.floor(Math.random() * 20 - 20));
        this.fishes_y = Array.from({length: 10}, () => Math.floor(Math.random() * 20));
        this.fishes_time_offset = Array(10).fill(0); 
        this.fish_num = 10; // there are always ten small fishes in the scene 
        this.fish_speed = 2; 

        // Initially, 5 sharks are randomly places in the scene
        this.sharks_x = Array.from({length: 5}, () => Math.floor(Math.random() * 46 - 28));
        this.sharks_y = Array.from({length: 5}, () => Math.floor(Math.random() * 10));
        this.sharks_time_offset = Array(5).fill(0); 
        this.shark_num = 5; // there are always ten small fishes in the scene 
        this.shark_speed = 1.5; 
        
    }
    
}

export class Preying_Frenzy_Scene extends Base_Scene {

    display(context, program_state) {
        // const gl = context.context; 
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
    }

    display_scene(context, program_state){
        let model_transform = Mat4.identity(); 
        const t = program_state.animation_time, dt = program_state.animation_delta_time / 1000;

        // Light 
        let light_position = this.light_position; 
        let light_color = this.light_color; 

        // Draw background 

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

        // draw sharks
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

        if (this.alive) {
            // Draw player fish body 
            var player_fish_body_transform = model_transform; 
            player_fish_body_transform = player_fish_body_transform
                .times(Mat4.scale(1.5, 1, 1, 0))
                .times(Mat4.translation(x/2, y/4, 0, 0));
            this.shapes.player_fish_body.draw(context, program_state, player_fish_body_transform, this.materials.player_fish); 

            // Draw player fish tail 
            var player_fish_tail_transform = player_fish_body_transform;
            player_fish_tail_transform = player_fish_tail_transform
                .times(Mat4.scale(2/1.5, 2, 1, 0))
                .times(Mat4.translation(-0.6, 0, 0))
                .times(Mat4.rotation(-Math.PI*1.25, 0, 0, 1)); 
            this.shapes.fish_tail.draw(context, program_state, player_fish_tail_transform, this.materials.player_fish_tail);

            // Draw the player fish fins
            var player_fish_fin_transform_above = player_fish_body_transform; 
            player_fish_fin_transform_above = player_fish_fin_transform_above.times(Mat4.translation(0.4,0.8,0,0))
                .times(Mat4.rotation(-Math.PI*1.25, 0, 0, 1));
            this.shapes.fish_tail.draw(context, program_state, player_fish_fin_transform_above, this.materials.fish_tail.override({color:hex_color("#FFC0CB")}));
            
            var player_fish_fin_transform_below = player_fish_body_transform; 
            player_fish_fin_transform_below = player_fish_fin_transform_below.times(Mat4.translation(0.4,-0.8,0,0))
                .times(Mat4.rotation(-Math.PI*1.25, 0, 0, 1));
            this.shapes.fish_tail.draw(context, program_state, player_fish_fin_transform_below, this.materials.fish_tail.override({color:hex_color("#FFC0CB")}));
        
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
            /* TODO: create a new fish when a fish exits from the left edge */ 
            // this.fishes_x[fish_index] = Math.floor(Math.random() * 46 - 28); 
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
        if (x_coord_new > -20){
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
            this.shapes.shark_body.draw(context, program_state, shark_transform, this.materials.shark);
            this.shapes.shark_fin.draw(context, program_state, shark_fin_transform, this.materials.shark);
            this.shapes.shark_fin.draw(context, program_state, shark_fin2_transform, this.materials.shark);
        } else {
            this.sharks_x[shark_index] = 18;
            this.sharks_y[shark_index] = Math.floor(Math.random() * 20); 
            this.sharks_time_offset[shark_index] = t;
        }
        
        
    }

}


class Gouraud_Shader extends Shader {
    // This is a Shader using Phong_Shader as template
    // TODO: Modify the glsl coder here to create a Gouraud Shader (Planet 2)

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `; 
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );
                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;                            
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;

                // color calculation occurs in the vertex shader 
                // Compute an initial (ambient) color:
                vertex_color = vec4(shape_color.xyz * ambient, shape_color.w);
                // Compute the final color with contributions from lights:
                vertex_color.xyz += phong_model_lights(N, vertex_worldspace);
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){
                gl_FragColor = vertex_color;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}


class Tail_Shader extends Shader {

    constructor(num_lights = 2) {
        super();
        this.num_lights = num_lights;
    }

    shared_glsl_code() {
        // ********* SHARED CODE, INCLUDED IN BOTH SHADERS *********
        return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
        // Specifier "varying" means a variable's final value will be passed from the vertex shader
        // on to the next phase (fragment shader), then interpolated per-fragment, weighted by the
        // pixel fragment's proximity to each of the 3 vertices (barycentric interpolation).
        varying vec3 N, vertex_worldspace;
        varying vec4 vertex_color;
        varying vec4 point_position;
        varying vec4 center;
        // ***** PHONG SHADING HAPPENS HERE: *****                                       
        vec3 phong_model_lights( vec3 N, vec3 vertex_worldspace ){                                        
            // phong_model_lights():  Add up the lights' contributions.
            vec3 E = normalize( camera_center - vertex_worldspace );
            vec3 result = vec3( 0.0 );
            for(int i = 0; i < N_LIGHTS; i++){
                // Lights store homogeneous coords - either a position or vector.  If w is 0, the 
                // light will appear directional (uniform direction from all points), and we 
                // simply obtain a vector towards the light by directly using the stored value.
                // Otherwise if w is 1 it will appear as a point light -- compute the vector to 
                // the point light's location from the current surface point.  In either case, 
                // fade (attenuate) the light as the vector needed to reach it gets longer.  
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz - 
                                               light_positions_or_vectors[i].w * vertex_worldspace;                                             
                float distance_to_light = length( surface_to_light_vector );
                vec3 L = normalize( surface_to_light_vector );
                vec3 H = normalize( L + E );
                // Compute the diffuse and specular components from the Phong
                // Reflection Model, using Blinn's "halfway vector" method:
                float diffuse  =      max( dot( N, L ), 0.0 );
                float specular = pow( max( dot( N, H ), 0.0 ), smoothness );
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light );
                
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse
                                                          + light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
            }
            return result;
        } `;
    }

    vertex_glsl_code() {
        // ********* VERTEX SHADER *********
        return this.shared_glsl_code() + `
            attribute vec3 position, normal;    
                        
            // Position is expressed in object coordinates.
            
            uniform mat4 model_transform;
            uniform mat4 projection_camera_model_transform;
    
            void main(){                                                                   
                // The vertex's final resting place (in NDCS):
                gl_Position = projection_camera_model_transform * vec4( position, 1.0 );
                // The final normal vector in screen space.
                N = normalize( mat3( model_transform ) * normal / squared_scale);
                vertex_worldspace = ( model_transform * vec4( position, 1.0 ) ).xyz;
                
                center = model_transform * vec4(0.0, 0.0, 0.0, 1.0);
                point_position = model_transform * vec4(position, 1.0);

                // color calculation occurs in the vertex shader 
                // Compute an initial (ambient) color:
                vertex_color = vec4(shape_color.xyz * ambient, shape_color.w);
                // Compute the final color with contributions from lights:
                vertex_color.xyz += phong_model_lights(N, vertex_worldspace);
            } `;
    }

    fragment_glsl_code() {
        // ********* FRAGMENT SHADER *********
        // A fragment is a pixel that's overlapped by the current triangle.
        // Fragments affect the final image or get discarded due to depth.
        return this.shared_glsl_code() + `
            void main(){
                 float scalar = cos(0.3 + distance(point_position.xyz, center.xyz));
                 gl_FragColor = scalar * vertex_color;
            } `;
    }

    send_material(gl, gpu, material) {
        // send_material(): Send the desired shape-wide material qualities to the
        // graphics card, where they will tweak the Phong lighting formula.
        gl.uniform4fv(gpu.shape_color, material.color);
        gl.uniform1f(gpu.ambient, material.ambient);
        gl.uniform1f(gpu.diffusivity, material.diffusivity);
        gl.uniform1f(gpu.specularity, material.specularity);
        gl.uniform1f(gpu.smoothness, material.smoothness);
    }

    send_gpu_state(gl, gpu, gpu_state, model_transform) {
        // send_gpu_state():  Send the state of our whole drawing context to the GPU.
        const O = vec4(0, 0, 0, 1), camera_center = gpu_state.camera_transform.times(O).to3();
        gl.uniform3fv(gpu.camera_center, camera_center);
        // Use the squared scale trick from "Eric's blog" instead of inverse transpose matrix:
        const squared_scale = model_transform.reduce(
            (acc, r) => {
                return acc.plus(vec4(...r).times_pairwise(r))
            }, vec4(0, 0, 0, 0)).to3();
        gl.uniform3fv(gpu.squared_scale, squared_scale);
        // Send the current matrices to the shader.  Go ahead and pre-compute
        // the products we'll need of the of the three special matrices and just
        // cache and send those.  They will be the same throughout this draw
        // call, and thus across each instance of the vertex shader.
        // Transpose them since the GPU expects matrices as column-major arrays.
        const PCM = gpu_state.projection_transform.times(gpu_state.camera_inverse).times(model_transform);
        gl.uniformMatrix4fv(gpu.model_transform, false, Matrix.flatten_2D_to_1D(model_transform.transposed()));
        gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false, Matrix.flatten_2D_to_1D(PCM.transposed()));

        // Omitting lights will show only the material color, scaled by the ambient term:
        if (!gpu_state.lights.length)
            return;

        const light_positions_flattened = [], light_colors_flattened = [];
        for (let i = 0; i < 4 * gpu_state.lights.length; i++) {
            light_positions_flattened.push(gpu_state.lights[Math.floor(i / 4)].position[i % 4]);
            light_colors_flattened.push(gpu_state.lights[Math.floor(i / 4)].color[i % 4]);
        }
        gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
        gl.uniform4fv(gpu.light_colors, light_colors_flattened);
        gl.uniform1fv(gpu.light_attenuation_factors, gpu_state.lights.map(l => l.attenuation));
    }

    update_GPU(context, gpu_addresses, gpu_state, model_transform, material) {
        // update_GPU(): Define how to synchronize our JavaScript's variables to the GPU's.  This is where the shader
        // recieves ALL of its inputs.  Every value the GPU wants is divided into two categories:  Values that belong
        // to individual objects being drawn (which we call "Material") and values belonging to the whole scene or
        // program (which we call the "Program_State").  Send both a material and a program state to the shaders
        // within this function, one data field at a time, to fully initialize the shader for a draw.

        // Fill in any missing fields in the Material object with custom defaults for this shader:
        const defaults = {color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40};
        material = Object.assign({}, defaults, material);

        this.send_material(context, gpu_addresses, material);
        this.send_gpu_state(context, gpu_addresses, gpu_state, model_transform);
    }
}
