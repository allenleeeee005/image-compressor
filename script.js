document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const preview = document.getElementById('preview');
    const download = document.getElementById('download');
    const quality = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    
    // 简单的文件上传处理
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // 显示文件大小
        document.getElementById('originalSize').textContent = formatSize(file.size);
        
        // 读取并显示图片
        const reader = new FileReader();
        reader.onload = function(event) {
            const img = new Image();
            img.onload = function() {
                compressImage(img);
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    };
    
    // 质量调节
    quality.oninput = function() {
        qualityValue.textContent = this.value + '%';
        const img = document.createElement('img');
        img.onload = function() {
            compressImage(this);
        };
        img.src = preview.src;
    };
    
    // 压缩图片
    function compressImage(img) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 设置画布大小
        canvas.width = img.width;
        canvas.height = img.height;
        
        // 绘制图片
        ctx.drawImage(img, 0, 0);
        
        // 压缩
        const compressed = canvas.toDataURL('image/jpeg', quality.value / 100);
        
        // 显示预览
        preview.src = compressed;
        preview.style.display = 'block';
        
        // 设置下载链接
        download.href = compressed;
        download.style.display = 'block';
        
        // 计算压缩后大小
        const size = Math.round((compressed.length - 'data:image/jpeg;base64,'.length) * 3/4);
        document.getElementById('compressedSize').textContent = formatSize(size);
    }
    
    // 格式化文件大小
    function formatSize(bytes) {
        const sizes = ['B', 'KB', 'MB', 'GB'];
        if (bytes === 0) return '0 KB';
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
    }
});
