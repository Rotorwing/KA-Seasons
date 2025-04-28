class KhanImageLoader{

    static LoadBase64Jpeg(name, base64, callback, channelCount) {
        let _base64 = base64;
        if(Array.isArray(base64)){
            _base64 = base64.join("");
        }

        // Convert Base64 to bytes:
        var binaryImg = atob(_base64);
        var dataLength = binaryImg.length;
        var ab = new ArrayBuffer(dataLength);
        var ua = new Uint8Array(ab);
        for (var i = 0; i < dataLength; i++) {
            ua[i] = binaryImg.charCodeAt(i);
        }
        
        jpegasm.decode(ua, function (err, decoded) {
            if(err){
                throw new Error("JPEG Decoding failed with: "+err)
            }
            const data = new Uint8ClampedArray(decoded.buffer);
            const channels = channelCount || Math.round(decoded.buffer.byteLength/(decoded.width*decoded.height));
            // console.log("KhanImageLoader: Decoded "+name+" with dimensions: "+decoded.width+"x"+decoded.height+" and channels: "+channels, decoded.buffer.byteLength);
            let texture = null;
            if (channels == 1){
                texture = BABYLON.RawTexture.CreateLuminanceTexture(data, decoded.width, decoded.height, scene);
            }else if (channels == 3){
                texture = BABYLON.RawTexture.CreateRGBTexture(data, decoded.width, decoded.height, scene);
            }else if (channels == 4){
                texture = BABYLON.RawTexture.CreateRGBATexture(data, decoded.width, decoded.height, scene);
            }else{
                throw new Error("Dimension of "+channels+" not yet supported")
            }
            texture.name = name;
            texture.wrapU = 1;
            texture.wrapV = 1;
            callback(texture)
        });
             
    }
}