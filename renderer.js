const webview = document.getElementById('main-webview');
// const urlModal = document.getElementById('url-modal'); // Removed URL modal
// const urlInput = document.getElementById('url-input');
// const btnSaveUrl = document.getElementById('btn-save-url');
const btnRefresh = document.getElementById('btn-refresh');
// const btnSettings = document.getElementById('btn-settings'); // Settings button removed
const btnUpdate = document.getElementById('btn-update');
const btnClose = document.getElementById('btn-close');
const btnMinimize = document.getElementById('btn-minimize');
const loadingOverlay = document.getElementById('loading-overlay');

// Update UI Elements
const updateModal = document.getElementById('update-modal');
const updateStatusText = document.getElementById('update-status-text');
const updateProgressBar = document.getElementById('update-progress-bar');
const updateProgressText = document.getElementById('update-progress-text');

const CURRENT_VERSION = '1.0.15';

// Initialize
(async () => {
    try {
        const savedUrl = await window.api.getUrl();
        if (savedUrl) {
            console.log('Config URL found:', savedUrl);
            loadUrl(savedUrl);
        } else {
            console.log('No config URL found');
            // Show alert instead of modal since modal is removed
            alert('Yapılandırma dosyası (config.txt) bulunamadı veya geçersiz. Lütfen uygulamanın kurulu olduğu klasörde config.txt dosyası olduğundan ve içinde geçerli bir URL yazdığından emin olun.');
            loadingOverlay.classList.add('hidden');
        }
    } catch (error) {
        console.error('Failed to get URL:', error);
        loadingOverlay.classList.add('hidden');
    }
})();

function loadUrl(url) {
    if (!url) return;
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    // Reset overlay state properly
    loadingOverlay.classList.remove('hidden');
    
    // Force webview navigation
    if (webview.src === url) {
        webview.reload();
    } else {
        webview.src = url;
    }
}

// Event Listeners
btnRefresh.addEventListener('click', () => {
    webview.reload();
});

btnClose.addEventListener('click', () => {
    window.api.close();
});

btnMinimize.addEventListener('click', () => {
    window.api.minimize();
});

// New Update Logic
btnUpdate.addEventListener('click', () => {
    // Trigger update check via Main Process
    window.api.checkForUpdate();
});

// Update Listeners
window.api.onUpdateAvailable((info) => {
    const choice = confirm(`Yeni güncelleme bulundu! (${info.version})\nŞimdi indirmek ve kurmak istiyor musunuz?`);
    if (choice) {
        // Show update modal and hide everything else to simulate "closing"
        updateModal.style.display = 'flex';
        loadingOverlay.style.display = 'none'; // Ensure loading overlay doesn't conflict
        // Start download
        window.api.startDownload();
    }
});

window.api.onUpdateNotAvailable(() => {
    alert('Uygulama güncel.\nMevcut Sürüm: ' + CURRENT_VERSION);
});

window.api.onDownloadProgress((progressObj) => {
    const percent = Math.round(progressObj.percent);
    updateProgressBar.style.width = percent + '%';
    updateProgressText.innerText = percent + '%';
    updateStatusText.innerText = 'Güncelleme İndiriliyor...';
});

window.api.onUpdateDownloaded(() => {
    updateStatusText.innerText = 'İndirme Tamamlandı. Kuruluyor...';
    updateProgressBar.style.width = '100%';
    updateProgressText.innerText = '100%';
    
    // Slight delay to let user see 100%
    setTimeout(() => {
        window.api.quitAndInstall();
    }, 1000);
});

window.api.onUpdateError((err) => {
    updateModal.style.display = 'none';
    alert('Güncelleme sırasında hata oluştu:\n' + err.message);
});


// Handle Webview loading state
webview.addEventListener('did-start-loading', () => {
    loadingOverlay.classList.remove('hidden');
});

webview.addEventListener('dom-ready', () => {
    loadingOverlay.classList.add('hidden');
});

webview.addEventListener('did-fail-load', (e) => {
    loadingOverlay.classList.add('hidden');
    console.error('Page failed to load:', e);
    if (e.errorCode !== -3) {
        alert('Sayfa yüklenemedi. Lütfen internet bağlantınızı kontrol edip yenileyin.');
    }
});

setTimeout(() => {
    loadingOverlay.classList.add('hidden');
}, 15000);
