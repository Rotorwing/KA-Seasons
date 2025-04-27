class GroundShaderPlugin extends BABYLON.MaterialPluginBase {
    constructor(material){
        super(material, "Dirt", 200);

        this.winterFactor = 0.0;

        this._enable(true);
    }

    getClassName() {
        return "GroundShaderPlugin";
    }

    getUniforms() {
        return {
            ubo: [{ name: "winterFactor", size: 1, type: "float"}],
            fragment: "uniform float winterFactor;"
        }
    }
    bindForSubMesh(uniformBuffer, scene, engine, subMesh){
        uniformBuffer.updateFloat("winterFactor", this.winterFactor);
    }

    getCustomCode(shaderType){
        if(shaderType === "fragment"){
            return {
                CUSTOM_FRAGMENT_MAIN_BEGIN: `
                    float noise = texture(diffuseSampler, vDiffuseUV).g;
                    // float noiseSmall = texture(diffuseSampler, vDiffuseUV*1.5).g;
                    float path = texture(emissiveSampler, vEmissiveUV).r;
                    float pathFactor = clamp(noise-path, 0.0, 1.0);
                `,

                CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
                    float noiseFactor = mix(0.8, 1.0, texture(bumpSampler, vBumpUV).r);
                    baseColor = mix(vec4(0.32, 0.20, 0.03, 1.0), vec4(0.17, 0.15, 0.05, 1.0), pathFactor);
                    baseColor = mix(baseColor, vec4(0.92, 0.92, 0.95, 1.), noise >= winterFactor ? 0.0 : 1.0);
                `,
                "!emissiveColor+=":"",
                // "!float normalScale=vBumpInfos\\.y;": `float normalScale=vBumpInfos.y;
                // normalScale *= mix(0.1, 1.0, path);
                // `,
                "!baseColor=t.\\;":";",
                "!emissiveColor.=tex.*;":";",
                // "!vBumpUV\\+uvOffset\\)\\.xyz,vBumpInfos\\.y": "vBumpUV*2.0+uvOffset).xyz,normalScale",
                "!,vBumpInfos\\.y": ",normalScale",
                "!specularMapColor\\.rgb": "vec3(specularMapColor.g)*vSpecularColor.rgb;"
            };
        }else if(shaderType === "vertex"){

        }
        return null;
    }
}