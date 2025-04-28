class GrassMaterial extends BABYLON.StandardMaterial {
    constructor(name, scene) {
        super(name, scene);
        this.name = name;
        
        // this.roughness = 0.5;
        this.specularPower = 50;
        this.specularColor = new BABYLON.Color3(0.05, 0.04, 0.02);

        this.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
        this.grassShaderPlugin = new GrassShaderPlugin(this);

        this.opacityTexture = scene.getTextureByName("Leaves (Base Color)"); // dots
        this.diffuseTexture = scene.getTextureByName("Dirt (Emissive)"); // paths
        this.specularTexture = scene.getTextureByName("Dirt (Metallic Roughness)"); // noise
        // this.opacityTexture = window.textures.voronoiTexture;
        // this.diffuseTexture = window.textures.pathTexture;
        // this.specularTexture = window.textures.noiseTexture;
    }
}