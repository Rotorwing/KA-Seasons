class RandomizePlugin extends BABYLON.MaterialPluginBase {
    constructor(material, scale){
        super(material, "RandomizePlugin", 200);

        this._enable(true);
    }

    getClassName() {
        return "RandomizePlugin";
    }


    getCustomCode(shaderType){
        if(shaderType === "fragment"){
            return {
                CUSTOM_FRAGMENT_DEFINITIONS: "in float vRandom;",
                "!uvOffset=.*;": "uvOffset = vec2(vRandom*0.31, vRandom*0.1);",
                "!baseColor\\.rgb\\*=vColor\\.rgb": ";",
                // "!uvOffset=.*;": "uvOffset = vec2(vColor.r + vColor.g, vColor.g + vColor.b);",
                // "!uvOffset=.*;": "uvOffset = vec2(gl_InstanceID*0.31, gl_InstanceID*1.6);",
                "!specularMapColor\\.rgb": "vec3(specularMapColor.g)*vSpecularColor.rgb;",

                CUSTOM_FRAGMENT_UPDATE_ALPHA: `baseColor.rgb = vec3(mix(0.4, 0.7, baseColor.r));
                baseColor.rgb *= mix(0.8, 1.1, sin( mod(vRandom*82.11, 3.2) ));`,
                
            };
        }else if(shaderType === "vertex"){
            return {
                CUSTOM_VERTEX_DEFINITIONS: `out float vRandom;`,
                // CUSTOM_VERTEX_MAIN_END: "vRandom = mod((world0.x + world1.y + world2.z + world3.w) / 4.0, 1.);",
                CUSTOM_VERTEX_MAIN_END: "vRandom = float(gl_InstanceID);",
            };
        }
        return null;
    }
}