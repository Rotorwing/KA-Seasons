class SnowShaderPlugin extends BABYLON.MaterialPluginBase {
    constructor(material, scale){
        super(material, "SnowShaderPlugin", 100);

        this.winterFactor = 0.0;

        this._enable(true);
    }

    getClassName() {
        return "SnowShaderPlugin";
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
                CUSTOM_FRAGMENT_UPDATE_DIFFUSE: `
                float snow = ( 1.-dot(normalW, vec3(0.0, 1.0, 0.0)) )*0.8 < winterFactor ? 1.0 : 0.; //* specularMapColor.g * mix(.0, 1.0, vColor.r+0.1) <= winterFactor ? 1.0 : 0.0; //
                baseColor = mix(baseColor, vec4(0.92, 0.92, 0.95, 1.), snow);
                diffuseColor = mix(diffuseColor, vec3(0.92, 0.92, 0.95), snow);
                `
            };
        }
        return null;
    }
}