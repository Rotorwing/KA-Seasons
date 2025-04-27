class SpecularFixPlugin extends BABYLON.MaterialPluginBase {
    constructor(material, scale){
        super(material, "SpecularFix", 300);

        this._enable(true);
    }

    getClassName() {
        return "SpecularFixPlugin";
    }


    getCustomCode(shaderType){
        if(shaderType === "fragment"){
            return {
                "!specularMapColor\\.rgb": "vec3(specularMapColor.g)*vSpecularColor.rgb;",
            };
        }
        return null;
    }
}