class GroundMaterial extends BABYLON.StandardMaterial {
    constructor(name, scene) {
        super(name, scene);
        this.name = name;

        // this.roughness = 0.5;
        this.specularPower = 30.5;
        this.specularColor = new BABYLON.Color3(0.10, 0.12, 0.05); // Default ground specular color
        this.level

        // this.diffuseColor = new BABYLON.Color3(0.17, 0.15, 0.05); // Default ground color

        this.diffuseTexture = scene.getTextureByName("Dirt (Base Color)");
        this.bumpTexture = scene.getTextureByName("Dirt (Normal)");
        this.specularTexture = scene.getTextureByName("Dirt (Metallic Roughness)");
        this.emissiveTexture = scene.getTextureByName("Dirt (Emissive)");

        // this.diffuseTexture = window.textures.noiseTexture;
        // this.bumpTexture = window.textures.pathNormalTexture;
        // this.specularTexture = window.textures.noiseTexture;
        // this.emissiveTexture = window.textures.pathTexture;

        this.bumpTexture.level = 0.9;

        this.groundShaderPlugin = new GroundShaderPlugin(this);
    }
}