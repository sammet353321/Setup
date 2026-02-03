const webview = document.getElementById('main-webview');
const urlModal = document.getElementById('url-modal');
const urlInput = document.getElementById('url-input');
const btnSaveUrl = document.getElementById('btn-save-url');
const btnRefresh = document.getElementById('btn-refresh');
const btnSettings = document.getElementById('btn-settings');
const btnUpdate = document.getElementById('btn-update');
const btnClose = document.getElementById('btn-close');
const btnMinimize = document.getElementById('btn-minimize');

const CURRENT_VERSION = '1.0.0';
const GITHUB_REPO = 'sammet353321/Setup';

// Initialize
(async () => {
    const savedUrl = await window.api.getUrl();
    if (savedUrl) {
        loadUrl(savedUrl);
    } else {
        showModal();
    }
})();

function loadUrl(url) {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    webview.src = url;
    urlModal.style.display = 'none';
}

function showModal() {
    urlModal.style.display = 'flex';
    if (webview.src && webview.src !== 'about:blank') {
        urlInput.value = webview.src;
    }
}

// Event Listeners
btnSaveUrl.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (url) {
        await window.api.setUrl(url);
        loadUrl(url);
    }
});

btnRefresh.addEventListener('click', () => {
    webview.reload();
});

btnSettings.addEventListener('click', () => {
    showModal();
});

btnClose.addEventListener('click', () => {
    window.api.close();
});

btnMinimize.addEventListener('click', () => {
    window.api.minimize();
});

btnUpdate.addEventListener('click', async () => {
    try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
        if (!response.ok) throw new Error('GitHub erişim hatası');
        
        const data = await response.json();
        const latestVersion = data.tag_name.replace('v', '');
        
        if (latestVersion !== CURRENT_VERSION) {
            const confirmUpdate = confirm(`Yeni güncelleme bulundu! (${data.tag_name})\nİndirmek istiyor musunuz?`);
            if (confirmUpdate) {
                // Open the release page in default browser
                window.api.openExternal(data.html_url);
            }
        } else {
            alert('Uygulama güncel.\nMevcut Sürüm: ' + CURRENT_VERSION);
        }
    } catch (error) {
        alert('Güncelleme kontrol edilirken hata oluştu: ' + error.message);
    }
});

// Handle Webview loading state if needed
webview.addEventListener('did-start-loading', () => {
    // Optional: Show loading spinner
});

webview.addEventListener('did-stop-loading', () => {
    // Optional: Hide loading spinner
});
