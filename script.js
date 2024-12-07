document.addEventListener('DOMContentLoaded', function() {
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
    
    let currentImage = null;
    
    // 文件上传处理
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            status.textContent = '请选择图片文件！';
            status.style.color = 'red';
            return;
        }
        
        // 显示状态
        status.textContent = '正在加载图片...';
        status.style.color = '#666';
        
        // 显示原始文件大小
        document.getElementById('originalSize').textContent = formatSize(file.size);
        
        // 读取并显示图片
        const reader = new FileReader();
        reader.onload = function(event) {
            currentImage = new Image();
            currentImage.onload = function() {
                // 显示预览
                preview.src = event.target.result;
                preview.style.display = 'block';
                
                // 显示压缩按钮和信息
                compressButton.style.display = 'inline-block';
                imageInfo.style.display = 'block';
                status.textContent = '图片已加载，请点击"压缩图片"按钮进行压缩';
            };
            currentImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
    
    // 压缩按钮点击事件
    compressButton.onclick = function() {
        if (!currentImage) return;
        
        status.textContent = '正在压缩...';
        progressBar.style.display = 'block';
        progress.style.width = '0%';
        
        // 模拟进度条
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 90) clearInterval(interval);
            width += 10;
            progress.style.width = width + '%';
        }, 100);
        
        // 压缩图片
        setTimeout(() => {
            compressImage(currentImage);
            clearInterval(interval);
            progress.style.width = '100%';
            
            setTimeout(() => {
                progressBar.style.display = 'none';
                status.textContent = '压缩完成！点击下方按钮下载压缩后的图片';
            }, 500);
        }, 1000);
    };
    
    // 质量调节
    quality.oninput = function() {
        qualityValue.textContent = this.value + '%';
    };
    
    // 压缩图片
    function compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布大小
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
        const compressed = canvas.toDataURL('image/jpeg', qualityValue);
        
        // 更新预览
        preview.src = compressed;
        
        // 显示下载按钮
        download.href = compressed;
        download.style.display = 'inline-block';
        
        // 计算压缩后大小
        const base64Data = compressed.split(',')[1];
        const compressedSize = Math.round(base64Data.length * 3/4);
        document.getElementById('compressedSize').textContent = formatSize(compressedSize);
    }
    
    // 格式化文件大小
    function formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 KB';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, i)).toFixed(2) + ' ' + sizes[i];
    }
});
