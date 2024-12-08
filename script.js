document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const originalPreview = document.getElementById('originalPreview');
    const compressedPreview = document.getElementById('compressedPreview');
    const download = document.getElementById('download');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const imageInfo = document.getElementById('imageInfo');
    
    let currentImage = null;

    // 添加拖拽上传功能
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#E5E5E5';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#E5E5E5';
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleFile(file);
        }
    });
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (file) {
            handleFile(file);
        }
    };
    
    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
            currentImage = new Image();
            currentImage.onload = function() {
                // 显示原始图片信息
                originalPreview.src = event.target.result;
                document.getElementById('originalSize').textContent = formatSize(file.size);
                document.getElementById('originalResolution').textContent = 
                    `${currentImage.width} x ${currentImage.height}`;
                
                imageInfo.style.display = 'block';
                compressImage(currentImage);
                
                // 初始化图片对比滑块
                initComparisonSlider();
            };
            currentImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    quality.oninput = function() {
        qualityValue.textContent = this.value + '%';
        if (currentImage) {
            compressImage(currentImage);
        }
    };
    
    function compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
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
        
        const qualityValue = quality.value / 100;
        const compressed = canvas.toDataURL('image/jpeg', qualityValue);
        
        // 更新压缩后的预览和信息
        compressedPreview.src = compressed;
        
        // 计算压缩后的大小和压缩比例
        const originalSize = Math.round(img.src.length * 3/4);
        const compressedSize = Math.round(compressed.length * 3/4);
        const compressionRatio = Math.round((1 - compressedSize/originalSize) * 100);
        
        document.getElementById('compressedSize').textContent = formatSize(compressedSize);
        document.getElementById('compressedResolution').textContent = `${width} x ${height}`;
        document.getElementById('compressionRatio').textContent = `${compressionRatio}%`;
        
        download.href = compressed;
    }
    
    function initComparisonSlider() {
        const slider = document.querySelector('.comparison-slider');
        const handle = slider.querySelector('.slider-handle');
        let isResizing = false;
        
        handle.addEventListener('mousedown', function(e) {
            isResizing = true;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        function onMouseMove(e) {
            if (!isResizing) return;
            
            const sliderRect = slider.getBoundingClientRect();
            const position = (e.clientX - sliderRect.left) / sliderRect.width;
            const percentage = Math.max(0, Math.min(1, position)) * 100;
            
            handle.style.left = `${percentage}%`;
            compressedPreview.style.clipPath = `inset(0 ${100-percentage}% 0 0)`;
        }

        function onMouseUp() {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }
    
    function formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 KB';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
});