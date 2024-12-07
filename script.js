document.addEventListener('DOMContentLoaded', function() {
    // 获取所有需要的元素
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const download = document.getElementById('download');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const compressButton = document.getElementById('compressButton');
    const status = document.getElementById('status');
    const progressBar = document.getElementById('progressBar');
    const progress = document.getElementById('progress');
    const imageInfo = document.getElementById('imageInfo');
    const dropZone = document.getElementById('dropZone');
    
    let currentImage = null;

    // 拖拽上传处理
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 点击上传处理
    dropZone.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', function(e) {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 处理上传的文件
    function handleFile(file) {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showStatus('请选择图片文件！', 'error');
            return;
        }

        showStatus('正在加载图片...', 'info');
        document.getElementById('originalSize').textContent = formatSize(file.size);

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                currentImage = img;
                preview.src = e.target.result;
                preview.style.display = 'block';
                compressButton.style.display = 'inline-block';
                imageInfo.style.display = 'block';
                showStatus('图片已加载，点击"压缩图片"按钮开始压缩', 'success');
            };
            img.onerror = function() {
                showStatus('图片加载失败，请重试', 'error');
            };
            img.src = e.target.result;
        };
        reader.onerror = function() {
            showStatus('文件读取失败，请重试', 'error');
        };
        reader.readAsDataURL(file);
    }

    // 压缩按钮点击事件
    compressButton.addEventListener('click', function() {
        if (!currentImage) {
            showStatus('请先选择图片', 'error');
            return;
        }

        showStatus('正在压缩...', 'info');
        progressBar.style.display = 'block';
        progress.style.width = '0%';

        // 模拟压缩进度
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) {
                clearInterval(interval);
            }
            width += 10;
            progress.style.width = width + '%';
        }, 100);

        // 执行压缩
        setTimeout(() => {
            compressImage(currentImage);
            clearInterval(interval);
            progress.style.width = '100%';
            
            setTimeout(() => {
                progressBar.style.display = 'none';
                showStatus('压缩完成！点击下方按钮下载压缩后的图片', 'success');
            }, 500);
        }, 1000);
    });

    // 质量调节
    quality.addEventListener('input', function() {
        qualityValue.textContent = this.value + '%';
        if (currentImage) {
            compressImage(currentImage);
        }
    });

    // 压缩图片
    function compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 计算压缩后的尺寸
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

        try {
            const qualityValue = quality.value / 100;
            const compressed = canvas.toDataURL('image/jpeg', qualityValue);
            
            preview.src = compressed;
            download.href = compressed;
            download.style.display = 'inline-block';

            const base64Data = compressed.split(',')[1];
            const compressedSize = Math.round(base64Data.length * 3/4);
            document.getElementById('compressedSize').textContent = formatSize(compressedSize);
        } catch (error) {
            showStatus('压缩失败，请重试', 'error');
        }
    }

    // 显示状态信息
    function showStatus(message, type) {
        status.textContent = message;
        status.className = 'status ' + type;
    }

    // 格式化文件大小
    function formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 KB';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
});
