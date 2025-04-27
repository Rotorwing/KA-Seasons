class GrassShaderPlugin extends BABYLON.MaterialPluginBase {
    constructor(material, scale){
        super(material, "Foliage", 200, {SCALE: "5.0"});

        this.scale = scale || "5.0"; // Default scale factor

        this.wind = BABYLON.Vector2.Zero();
        this.fallFactor = 0.0;
        this.winterFactor = 0.0;

        this._enable(true);
    }

    getClassName() {
        return "GrassShaderPlugin";
    }

    prepareDefines(defines, scene, mesh){
        defines["SCALE"] = this.scale;
    }

    getUniforms() {
        return {
            ubo: [{ name: "wind", size: 2, type: "vec2"}, { name: "fallFactor", size: 1, type: "float"}, { name: "winterFactor", size: 1, type: "float"}],
            vertex: "uniform vec2 wind;",
            fragment: "uniform float fallFactor;\nuniform float winterFactor;"
        }
    }
    bindForSubMesh(uniformBuffer, scene, engine, subMesh){
        uniformBuffer.updateFloat2("wind", this.wind.x, this.wind.y);
        uniformBuffer.updateFloat("fallFactor", this.fallFactor);
        uniformBuffer.updateFloat("winterFactor", this.winterFactor);
    }

    getCustomCode(shaderType){
        if(shaderType === "fragment"){
            return {
                CUSTOM_FRAGMENT_UPDATE_ALPHA: `
                    float _alphaCutOff = mix(0.25, 0.5, vColor.r);
                    // _alphaCutOff /= mix(1.0, 1.0, baseColor.r);
                    float density = baseColor.r;
                `,
                CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
                    float colorFactor = clamp(vColor.r+density*0.5, 0.0, 1.0);
                    vec4 summerColor = mix(vec4(0.07, 0.026, 0.001, 1.0),
                        mix(vec4(0.3, 0.5, 0.1, 1.0), vec4(0.53, 0.53, 0.1, 1.0), clamp((colorFactor-0.8)/0.2, 0., 1.)),
                        clamp(colorFactor/0.8, 0., 1.));
                    
                    vec4 fallColor = mix(vec4(0.25, 0.3, 0.08, 1.0), vec4(0.65, 0.7, 0.25, 1.0), clamp((colorFactor-0.6)/0.2, 0., 1.));
                    baseColor = mix(summerColor, fallColor, fallFactor);
                `,
                "!alpha<alphaCutOff": `alpha < _alphaCutOff`,
                "!vOpacityUV\\+uvOffset":`vOpacityUV*SCALE+uvOffset`,
                "!alpha\\*=vColor\\.a": `
                alpha = mix(0., 1., opacityMap.a);

                float snow = (1.1-density)*specularMapColor.g* mix(.0, 1.0, vColor.r+0.1)*1.1  <= winterFactor ? 1.0 : 0.0; //
                baseColor = mix(baseColor, vec4(0.92, 0.92, 0.95, 1.), snow);
                alpha = clamp(alpha+snow, 0.0, 1.0);

                alpha *= mix(1.0, 0.1, density);
                alpha *= mix(1.1, 0.8, specularMapColor.g);
                `,
                "!specularMapColor\\.rgb": "vec3(specularMapColor.g)*vSpecularColor.rgb;",
            };
        }else if(shaderType === "vertex"){

        }
        return null;
    }
}