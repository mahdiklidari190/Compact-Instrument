function fileToBinary(file, callback, progressElement) {
    let reader = new FileReader();
    reader.onload = function(event) {
        let bytes = new Uint8Array(event.target.result);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
            binary += bytes[i].toString(2).padStart(8, '0');
            if (i % 1000 === 0) updateProgress(progressElement, (i / bytes.length) * 100);
        }
        updateProgress(progressElement, 100);
        callback(binary);
    };
    reader.readAsArrayBuffer(file);
}

function binaryToFile(binary, filename) {
    let byteArray = new Uint8Array(binary.match(/.{1,8}/g).map(byte => parseInt(byte, 2)));
    let blob = new Blob([byteArray], { type: "application/octet-stream" });
    let link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "block";
    return link;
}

function compressBinary(binary, progressElement) {
    let compressed = "";
    let i = 0;
    while (i < binary.length) {
        let count = 1;
        while (i + count < binary.length && binary[i] === binary[i + count] && count < 9) {
            count++;
        }
        compressed += count.toString() + binary[i];
        i += count;
        if (i % 1000 === 0) updateProgress(progressElement, (i / binary.length) * 100);
    }
    updateProgress(progressElement, 100);
    return compressed;
}

function decompressBinary(compressed, progressElement) {
    let binary = "";
    let i = 0;
    while (i < compressed.length) {
        let count = parseInt(compressed[i]);
        let char = compressed[i + 1];
        binary += char.repeat(count);
        i += 2;
        if (i % 500 === 0) updateProgress(progressElement, (i / compressed.length) * 100);
    }
    updateProgress(progressElement, 100);
    return binary;
}

function compressFile() {
    let file = document.getElementById("fileInput").files[0];
    if (!file) return alert("📌 لطفاً یک فایل انتخاب کنید!");
    
    fileToBinary(file, function(binary) {
        let compressed = compressBinary(binary, document.getElementById("compressProgress"));
        let blob = new Blob([compressed], { type: "text/plain" });
        let link = document.getElementById("downloadCompressed");
        link.href = URL.createObjectURL(blob);
        link.download = file.name + ".compressed";
        link.innerText = "📥 دانلود فایل فشرده‌شده";
        link.style.display = "block";
    }, document.getElementById("compressProgress"));
}

function decompressFile() {
    let file = document.getElementById("compressedInput").files[0];
    if (!file) return alert("📌 لطفاً یک فایل انتخاب کنید!");
    
    let reader = new FileReader();
    reader.onload = function(event) {
        let compressed = event.target.result;
        let binary = decompressBinary(compressed, document.getElementById("decompressProgress"));
        let link = binaryToFile(binary, "decompressed.bin");
        document.getElementById("downloadDecompressed").replaceWith(link);
        link.id = "downloadDecompressed";
        link.innerText = "📥 دانلود فایل استخراج‌شده";
    };
    reader.readAsText(file);
}

function updateProgress(element, percent) {
    element.style.width = percent + "%";
