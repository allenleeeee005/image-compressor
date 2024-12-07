document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const download = document.getElementById('download');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');

    let currentFile = null; // 保存当前处理的图片

    // 点击上传
    dropZone.addEventListener('click', () => fileInput.click());

    // 拖拽上传
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length) {
            handleImage(files[0]);
        }
    });

    // 文件选择
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleImage(e.target.files[0]);
        }
    });

    // 质量调节
    quality.addEventListener('input', () => {
        const value = quality.value;
        qualityValue.textContent = value + '%';
        if (currentFile) {
            compressImage(currentFile);
        }
    });

    function handleImage(file) {
        if (!file.type.match('image.*')) {
            alert('请选择图片文件！');
            return;
        }

        currentFile = file; // 保存当前文件
        originalSize.textContent = formatSize(file.size);

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                preview.src = e.target.result;
                preview.style.display = 'block';
                compressImage(file);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function compressImage(file) {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 保持宽高比
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

                const currentQuality = quality.value / 100;
                const compressedDataUrl = canvas.toDataURL('image/jpeg', currentQuality);
                
                preview.src = compressedDataUrl;
                preview.style.display = 'block';
                
                download.href = compressedDataUrl;
                download.style.display = 'block';

                // 计算压缩后大小
                const compressedSizeInBytes = Math.round((compressedDataUrl.length - 'data:image/jpeg;base64,'.length) * 3/4);
                compressedSize.textContent = formatSize(compressedSizeInBytes);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function formatSize(bytes) {
        if (bytes === 0) return '0 KB';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
});
