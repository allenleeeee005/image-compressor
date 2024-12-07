document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要的元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const download = document.getElementById('download');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');

    // 存储当前图片
    let currentImage = null;

    // 点击上传区域触发文件选择
    dropZone.addEventListener('click', function(e) {
        e.preventDefault();
        fileInput.click();
    });

    // 处理文件选择
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            processImage(file);
        }
    });

    // 阻止默认拖放行为
    document.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    document.addEventListener('drop', function(e) {
        e.preventDefault();
    });

    // 处理拖放
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) {
            processImage(file);
        }
    });

    // 处理质量滑块变化
    quality.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
        if (currentImage) {
            compressImage(currentImage);
        }
    });

    // 处理图片
    function processImage(file) {
        console.log('Processing image:', file);
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }

        currentImage = file;
        originalSize.textContent = formatFileSize(file.size);

        const reader = new FileReader();
        reader.onload = function(e) {
            console.log('File loaded');
            const img = new Image();
            img.onload = function() {
                console.log('Image loaded');
                preview.src = e.target.result;
                preview.style.display = 'block';
                compressImage(file);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(file) {
        console.log('Compressing image');
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 计算新尺寸
                let width = img.width;
                let height = img.height;
                const maxSize = 1920;

                if (width > height && width > maxSize) {
                    height = (height * maxSize) / width;
                    width = maxSize;
                } else if (height > maxSize) {
                    width = (width * maxSize) / height;
                    height = maxSize;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // 压缩
                const qualityValue = quality.value / 100;
                const compressedDataUrl = canvas.toDataURL('image/jpeg', qualityValue);

                // 更新预览
                preview.src = compressedDataUrl;
                preview.style.display = 'block';

                // 更新下载链接
                download.href = compressedDataUrl;
                download.style.display = 'block';

                // 计算压缩后大小
                const base64String = compressedDataUrl.split(',')[1];
                const compressedSize = Math.round((base64String.length * 3) / 4);
                document.getElementById('compressedSize').textContent = formatFileSize(compressedSize);
                
                console.log('Compression complete');
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
