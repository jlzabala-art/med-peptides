
import fs from 'fs';
import path from 'path';

const sourceDir = '/Users/joseluiszabala/.gemini/antigravity/brain/2112460a-7b2f-4b1a-ac12-05d5a91fcddc/';
const destDir = '/Users/joseluiszabala/Documents/Antigravity/Atlas Health-web/public/assets/vials/';

const mapping = {
    'aod9604_vial_premium_1777365547550.png': 'aod9604.png',
    'ara290_vial_premium_1777365516036.png': 'ara290.png',
    'bpc157_vial_premium_1777364335117.png': 'bpc157.png',
    'cagrilintide_vial_premium_1777365532883.png': 'cagrilintide.png',
    'epithalon_vial_premium_1777364432169.png': 'epithalon.png',
    'gw501516_vial_premium_1777365610244.png': 'gw501516.png',
    'kpv_vial_premium_1777365499219.png': 'kpv.png',
    'motsc_vial_premium_1777365565515.png': 'motsc.png',
    'nadplus_vial_premium_v2_1777365626365.png': 'nadplus.png',
    'retatrutide_vial_premium_1777364403145.png': 'retatrutide.png',
    'semaglutide_vial_premium_1777364418176.png': 'semaglutide.png',
    'slupp332_vial_premium_1777365596588.png': 'slupp332.png',
    'ss31_vial_premium_1777365641341.png': 'ss31.png',
    'tb500_vial_premium_1777364351067.png': 'tb500.png',
    'tirzepatide_vial_premium_1777364365418.png': 'tirzepatide.png'
};

for (const [src, dest] of Object.entries(mapping)) {
    const srcPath = path.join(sourceDir, src);
    const destPath = path.join(destDir, dest);
    if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied ${src} to ${dest}`);
    } else {
        console.warn(`Source file not found: ${srcPath}`);
    }
}
