/**
 * @import {BABYLON} from 'babylonjs';
 */

const canvas = document.getElementById("renderCanvas");

const gl = document.createElement("canvas").getContext("webgl2");
document.body.appendChild(gl.canvas);
gl.canvas.style.width = "100%";


const engine = new BABYLON.Engine(canvas,true);
const scene = new BABYLON.Scene(engine);



const insideRenderTarget = new BABYLON.RenderTargetTexture("insideRenderTarget", { width: engine.getRenderWidth(), height:engine.getRenderHeight() }, scene);
// scene.customRenderTargets.push(insideRenderTarget);

const camera = new BABYLON.ArcRotateCamera("Camera", 26.6, 1.18, 5, new BABYLON.Vector3(0, 0, 0), scene);
camera.attachControl(canvas, true);
camera.minZ = 0.1;
camera.maxZ = 20;
camera.wheelPrecision = 100;
camera.layerMask = 0x10000000;
camera.lowerRadiusLimit = 1.7
camera.upperRadiusLimit = 10.0;

const sun = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-0.7, -0.5, -0.1), scene);
sun.position = sun.direction.scale(-10);
const skyfill = new BABYLON.HemisphericLight("skyfill", sun.direction.scale(-1).add(BABYLON.Vector3.Up()), scene);
sun.intensity = 1.8;
skyfill.intensity = 0.5;


const useShadowCaster = true;
let shadowCaster;
if(useShadowCaster){
    shadowCaster = new BABYLON.ShadowGenerator(1024, sun);
    shadowCaster.usePoissonSampling = true;
    shadowCaster.bias = 0.005;
    shadowCaster.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
}

let seasonalShaders = [];
let seasonalVegetation = [];
let fallFactor = 0.0;
let winterFactor = 0.0;

let timeOfYear = 0;

function setFallFactor(value) {
    fallFactor = Math.max(value, 0);
    for (let shader of seasonalShaders) {
        shader.fallFactor = fallFactor;
    }
}
function setWinterFactor(value) {
    winterFactor = Math.max(value, 0);
    for (let shader of seasonalShaders) {
        shader.winterFactor = winterFactor;
    }
    shadowCaster.setDarkness(winterFactor * 0.5);

    for (let mesh of seasonalVegetation) {
        let inRenderList = shadowCaster.getShadowMap().renderList.includes(mesh);
        if(winterFactor > 0.2){
            if(inRenderList) {
                shadowCaster.getShadowMap().renderList.splice(shadowCaster.getShadowMap().renderList.indexOf(mesh), 1);
                shadowCaster.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;
            }
        }else{
            if(!inRenderList) {
                shadowCaster.getShadowMap().renderList.push(mesh);
                shadowCaster.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE;

            }
        }
    }
}

function updateSeason(deltaTime) {
    timeOfYear += deltaTime * 0.00002; // Adjust speed as needed
    // if (timeOfYear > 1) {
    //     timeOfYear = 0;
    // }

    // Update fall and winter factors based on time of year
    setFallFactor(Math.cos(timeOfYear * Math.PI)); // Fall factor peaks at 1 in the middle of the year
    setWinterFactor(Math.sin(timeOfYear * Math.PI)); // Winter factor peaks at 1 at the end of the year

    // console.log("Time of Year:", timeOfYear.toFixed(2), "Fall Factor:", fallFactor.toFixed(2), "Winter Factor:", winterFactor.toFixed(2));
}

// asset = "../Exports/globev8.glb";
// if(window.isKhan){
//     // asset = "https://raw.githubusercontent.com/khansperger/GlobeV8/main/Exports/globev8.glb";
//     // asset = "data:;base64,"+window.globev8.join("");
//     asset = window.drone2Glb;
// }
let texturesLoaded = 0;
let triggeredLoad = false;
function onLoadTexture(texture) {
    let name = texture.name;
    if(!window.textures) window.textures = {};
    if(!window.textures[name]) {
        window.textures[name] = texture;
        texturesLoaded++;
    }
    if(texturesLoaded >= Object.keys(window.textures).length && !triggeredLoad){
        triggeredLoad = true;
        console.log("All textures loaded successfully.");
        loadScene();
    }else{
        console.log("Textures not yet loaded:", texturesLoaded, "/", Object.keys(window.textures).length);
    }
}

// const loader = new BABYLON.GLTFFileLoader();
// loader.loggingEnabled = true;

// loader.loadAsync(scene, "../Exports/drone2.glb", "", function (data) {
// ArrayBuffer
// BABYLON.SceneLoader.AppendAsync("../Exports/", "globev8.txt", scene, function (progress) {console.log("Loading progress:", progress.loaded, "/", progress.total);}).then(function (result) {
// 
let base64 = globev9;
if(Array.isArray(base64)){
    base64 = base64.join("");
}

// Convert Base64 to bytes:
var binaryImg = atob(base64);
var dataLength = binaryImg.length;
var ab = new ArrayBuffer(dataLength);
var ua = new Uint8Array(ab);
for (var i = 0; i < dataLength; i++) {
    ua[i] = binaryImg.charCodeAt(i);
}

function loadScene() {
    scene.environmentBRDFTexture = window.textures.brdfTexture;
BABYLON.SceneLoader.AppendAsync("../Exports/", ua, scene, function (progress) {console.log("Loading progress:", progress.loaded, "/", progress.total);}, ".glb").then(function (result) {
// BABYLON.SceneLoader.lo({rawData:ua}, scene, ()=>{console.log("Scene loaded successfully.")},
//                                                          (p)=>{console.log(p)},
//                                                          (e)=>{console.error("Error loading scene:", e);},
//                                                         null,
//                                                         ".glb",

//                                                         ).then(function () {
    try {
        for(let material of scene.materials){
            let materialName = material.name.split(".")[0];
            if(materialName === "Logs" || materialName === "Wood Trim" || materialName === "Shingles"){
                let replacementMaterial = new BABYLON.StandardMaterial(materialName+"Material", scene);
                // replacementMaterial.diffuseTexture = scene.getTextureByName("Logs (Base Color)");
                // replacementMaterial.specularTexture = scene.getTextureByName("Logs (Metallic Roughness)");
                replacementMaterial.diffuseTexture = window.textures.streaksTexture;
                replacementMaterial.specularTexture = window.textures.streaksTexture;
                replacementMaterial.specularColor = new BABYLON.Color3(0.05, 0.04, 0.02);
                replacementMaterial.specularPower = 50;
                
                switch(materialName){
                    case "Logs":
                        replacementMaterial.diffuseColor = new BABYLON.Color3(0.3451, 0.2275, 0.1373);
                        replacementMaterial.snowPlugin = new SnowShaderPlugin(replacementMaterial);
                        seasonalShaders.push(replacementMaterial.snowPlugin);
                        break;
                    case "Wood Trim":
                        replacementMaterial.diffuseColor = new BABYLON.Color3(0.4627, 0.3647, 0.2784);
                        replacementMaterial.snowPlugin = new SnowShaderPlugin(replacementMaterial);
                        seasonalShaders.push(replacementMaterial.snowPlugin);
                        break;
                    case "Shingles":
                        replacementMaterial.diffuseColor = new BABYLON.Color3(0.3, 0.1, 0.05);
                        replacementMaterial.randomizePlugin = new RandomizePlugin(replacementMaterial);
                }
                // replacementMaterial.bumpTexture = scene.getTextureByName("Logs (Normal)");

                replacementMaterial.specularFixPlugin = new SpecularFixPlugin(replacementMaterial);

                for (let mesh of material.getBindedMeshes()) {
                    if(mesh.material === material) {
                        mesh.material = replacementMaterial;
                        if(useShadowCaster){
                            shadowCaster.addShadowCaster(mesh, true);
                        }
                        mesh.receiveShadows = true;
                    }
                }
                material.dispose();
            }
            if(materialName === "Blocker"){
                let replacementMaterial = new BABYLON.StandardMaterial(materialName+"Material", scene);
                replacementMaterial.specularColor = new BABYLON.Color3(0.05, 0.04, 0.02);
                replacementMaterial.specularPower = 200;
                replacementMaterial.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.1);

                for (let mesh of material.getBindedMeshes()) {
                    if(mesh.material === material) {
                        mesh.material = replacementMaterial;
                        if(useShadowCaster){
                            shadowCaster.addShadowCaster(mesh, true);
                        }
                    }
                }
                material.dispose();
            }
            if(materialName === "Glass"){
                material.refractionTexture = insideRenderTarget;
                material.roughness = 0.1;
                material.metallic = 0.0;
            }
            if(materialName === "Nice Wood"){
                material.albedoTexture = window.textures.woodDiffuseTexture;
                material.bumpTexture = window.textures.woodNormalTexture;
                material.roughnessTexture = window.textures.woodRoughnessTexture;
            }
            if(materialName === "Brass"){
                material.bumpTexture = window.textures.metalNormalTexture;
                material.roughnessTexture = window.textures.metalRoughnessTexture;
                
            }

        }
        // let loadedMeshes = {};
        for(let mesh of scene.meshes){
            // if (mesh.name in loadedMeshes) {
            //     let instance = loadedMeshes[mesh.name].createInstance(mesh.name+"_instance");
            //     instance.position = mesh.position;
            //     instance.rotation = mesh.rotation;
            //     instance.scaling = mesh.scaling;
            //     instance.freezeWorldMatrix();
            //     mesh.dispose();
            //     continue;
            // }else{
            //     loadedMeshes[mesh.name] = mesh;
            // }
            mesh.freezeWorldMatrix();

            let meshName = mesh.name.split(".")[0];
            console.log("Processing mesh:", meshName);
            console.log("Material:", mesh.material ? mesh.material : "No material");
            if(meshName === "Grass"){
                mesh.receiveShadows = true;
                if(mesh.material) { mesh.material.dispose(); }
                mesh.material = new GrassMaterial('GrassMaterial', scene, "35.0");
                // mesh.material.grassShaderPlugin.wind = new BABYLON.Vector2(0.1, 0.0);
                seasonalShaders.push(mesh.material.grassShaderPlugin);
                
                // mesh.visibility = false;
            }
            if(meshName === "Dirt"){
                mesh.receiveShadows = true;
                if(mesh.material) { mesh.material.dispose(); }
                mesh.material = new GroundMaterial('GroundMaterial', scene);

                seasonalShaders.push(mesh.material.groundShaderPlugin);
            }
            if(meshName === "Instancer Surface"){
                mesh.visibility = false;
            }
            if(meshName === "Tree Instancer"){
                if(!mesh.material || mesh.material.name === "Leaves"){
                    if(mesh.material) { mesh.material.dispose(); }
                    mesh.material = new LeafMaterial('TreeMaterial', scene, "9.0");
                    mesh.material.backFaceCulling = false;

                    seasonalShaders.push(mesh.material.leafShaderPlugin);
                    seasonalVegetation.push(mesh);
                }
                shadowCaster.addShadowCaster(mesh, true);
            }
            if(meshName === "Bush Instancer"){
                if(mesh.material) { mesh.material.dispose(); }
                mesh.material = new LeafMaterial('BushMaterial', scene, "15.0");
                mesh.material.backFaceCulling = false;
                shadowCaster.addShadowCaster(mesh, true);
                mesh.receiveShadows = true;

                seasonalShaders.push(mesh.material.leafShaderPlugin);
                seasonalVegetation.push(mesh);
            }
        }

        for(let mesh of scene.meshes){
            mesh.layerMask = camera.layerMask;
        }

        let insideMeshes = scene.getNodeByName("Inside");
        for (let mesh of insideMeshes.getChildMeshes()) {
            insideRenderTarget.renderList.push(mesh);
            // scene.removeMesh(mesh);
            mesh.layerMask = 1; // Set layer mask for inside meshes
            
        }

        if(useShadowCaster){ shadowCaster.getShadowMap().refreshRate = BABYLON.RenderTargetTexture.REFRESHRATE_RENDER_ONCE; }
    }catch(e){
        console.error("Error processing materials:", e);
    }

});
}

window.textures = {
    noiseTexture: KhanImageLoader.LoadBase64Jpeg("noiseTexture", window.perlin, onLoadTexture),
    noiseNormalTexture: KhanImageLoader.LoadBase64Jpeg("noiseNormalTexture", window.perlinnormal, onLoadTexture),
    streaksTexture: KhanImageLoader.LoadBase64Jpeg("streaksTexture", window.streaks, onLoadTexture),
    voronoiTexture: KhanImageLoader.LoadBase64Jpeg("voronoiTexture", window.tilingvoronoi, onLoadTexture, 1),
    pathTexture: KhanImageLoader.LoadBase64Jpeg("pathTexture", window.Path1, onLoadTexture),
    pathNormalTexture: KhanImageLoader.LoadBase64Jpeg("pathNormalTexture", window.pathnormal3, onLoadTexture),
    brdfTexture: KhanImageLoader.LoadBase64Jpeg("brdfTexture", window.brdf, onLoadTexture),
    woodDiffuseTexture: KhanImageLoader.LoadBase64Jpeg("woodDiffuseTexture", window.woodDiffuse, onLoadTexture),
    woodNormalTexture: KhanImageLoader.LoadBase64Jpeg("woodNormalTexture", window.woodNormal, onLoadTexture),
    woodRoughnessTexture: KhanImageLoader.LoadBase64Jpeg("woodRoughnessTexture", window.woodRoughness, onLoadTexture),
    metalNormalTexture: KhanImageLoader.LoadBase64Jpeg("metalNormalTexture", window.metalNormal, onLoadTexture),
    metalRoughnessTexture: KhanImageLoader.LoadBase64Jpeg("metalRoughnessTexture", window.metalRoughness, onLoadTexture),
}

engine.runRenderLoop(function () {
    scene.render();
    const deltaTime = engine.getDeltaTime();
    updateSeason(deltaTime);
}
);
window.addEventListener("resize", function () {
    engine.resize();
});