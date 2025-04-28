class LeafMaterial extends BABYLON.StandardMaterial {
    constructor(name, scene, scale) {
        super(name, scene);
        this.name = name;
        
        // this.roughness = 0.5;
        this.specularPower = 50;
        this.specularColor = new BABYLON.Color3(0.05, 0.04, 0.02);

        this.transparencyMode = BABYLON.Material.MATERIAL_ALPHATEST;
        this.leafShaderPlugin = new LeafShaderPlugin(this, scale || "1.0");

        // this.opacityTexture = scene.getTextureByName("Leaves (Base Color)"); // dots
        // this.diffuseTexture = scene.getTextureByName("Dirt (Base Color)"); // noise

        this.opacityTexture = window.textures.voronoiTexture;
        this.diffuseTexture = window.textures.noiseTexture;
    }
}