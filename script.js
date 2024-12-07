document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const download = document.getElementById('download');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    
    let currentImage = null; // 保存当前图片对象
    
    // 文件上传处理
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 检查是否是图片
        if (!file.type.startsWith('image/')) {
            alert('请选择图片文件！');
            return;
        }
        
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
                // 进行首次压缩
                compressImage(currentImage);
            };
            currentImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
    
    // 质量调节
    quality.oninput = function() {
        // 更新显示的质量值
        qualityValue.textContent = this.value + '%';
        // 如果有图片，重新压缩
        if (currentImage) {
            compressImage(currentImage);
        }
    };
    
    // 压缩图片
    function compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布大小（最大尺寸限制）
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
        
        // 绘制图片
        ctx.drawImage(img, 0, 0, width, height);
        
        // 压缩
        const qualityValue = quality.value / 100;
        const compressed = canvas.toDataURL('image/jpeg', qualityValue);
        
        // 显示预览
        preview.src = compressed;
        preview.style.display = 'block';
        
        // 设置下载链接
        download.href = compressed;
        download.style.display = 'block';
        
        // 计算并显示压缩后大小
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