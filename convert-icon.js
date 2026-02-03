const fs = require('fs');
const pngToIco = require('png-to-ico');

(async () => {
    try {
        const buf = await pngToIco('assets/icon.png');
        fs.writeFileSync('assets/icon.ico', buf);
        console.log('Icon converted successfully!');
    } catch (e) {
        console.error(e);
    }
})();
