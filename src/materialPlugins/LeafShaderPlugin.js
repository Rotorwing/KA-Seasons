class LeafShaderPlugin extends BABYLON.MaterialPluginBase {
    constructor(material, scale){
        super(material, "Foliage", 200, {SCALE: "1.0", SUBSURFACE: 0.1});

        this.scale = scale || "1.0"; // Default scale factor
        this.subsurface = 0.1; // Default subsurface value

        this.wind = BABYLON.Vector2.Zero();
        this.fallFactor = 0.0;
        this.winterFactor = 0.0;

        this._enable(true);
    }

    getClassName() {
        return "LeafShaderPlugin";
    }

    prepareDefines(defines, scene, mesh){
        defines["SCALE"] = this.scale;
        defines["SUBSURFACE"] = this.subsurface;
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
                    float _alphaCutOff = mix(0.18, 0.3, vColor.r)+winterFactor;
                    // _alphaCutOff =  1. - (1. - _alphaCutOff) * mix(0.1, 0.8, baseColor.r);// * mix(0.5, 1.0, vColor.r);
                    float density = baseColor.g;
                `,
                CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
                    float colorFactor = clamp(vColor.r+density*0.5, 0.0, 1.0);
                    vec4 summerColor = mix(vec4(0.25, 0.4, 0.1, 1.0), vec4(0.45, 0.49, 0.08, 1.0), colorFactor);
                    vec4 fallColor = mix(vec4(0.90, 0.60, 0.1, 1.0), vec4(0.98, 0.78, 0.2, 1.0), colorFactor);
                    baseColor = mix(summerColor, fallColor, fallFactor);
                    // baseColor = vec4(_alphaCutOff, _alphaCutOff, _alphaCutOff, 1.0) * baseColor;
                `,
                "!alpha<alphaCutOff": `alpha < _alphaCutOff`,
                "!vOpacityUV\\+uvOffset":`vOpacityUV*SCALE+uvOffset`,
                "!alpha\\*=vColor\\.a": `
                alpha = mix(0., 1., opacityMap.a);
                alpha *= clamp(mix(1.0, mix(0.2, -1.0, vColor.r), density), 0.0, 1.0);
                // alpha *= mix(1.1, 0.8, specularMapColor.g);
                // alpha = vColor.r < 0.6 ? 1.0 : 0.0;
                `,
                // "!specularMapColor\\.rgb": "vec3(specularMapColor.g)*vSpecularColor.rgb;",
                "!uvOffset=.*;": "uvOffset = vec2(vColor.r, vColor.r*1.6);",
                "!vDiffuseUV\\+uvOffset": `vDiffuseUV*3.0*SCALE+uvOffset`,

                //subsurface scattering
                "!result.diffuse=ndl.*;": "result.diffuse = (ndl + pow(max(-dot(vNormal, lightVectorW), 0.), 0.5)*SUBSURFACE )*diffuseColor*attenuation;",
                "!dot\\(vNormal,lightVectorW\\)": "mix(SUBSURFACE*2.0, 1.0, dot(vNormal, lightVectorW))",
            };
        }else if(shaderType === "vertex"){

        }
        return null;
    }
}