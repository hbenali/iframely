export default {

    getData: function(video_src) {

        const v2_re = /^https?:\/\/(?:www\.)?podbean\.com\/player\-v\d\/?\?i=([a-z0-9]+\-[a-z0-9]+)/i;
        
        if (/^https?:\/\/(?:www\.)?podbean\.com\/media\/player\/[^?]+/i.test(video_src)) {
            
            return {
                __promoUri: {url: video_src.replace(/\/media\/player\//i, '/media/share/pb-').replace(/(?:\-pb)?(?:\?.+)?$/, '')} // no 'promo' rel required
            }

        } else if (v2_re.test(video_src)) {
            
            return {
                __promoUri: {url: `https://www.podbean.com/ew/pb-${video_src.match(v2_re)[1]}`} // no 'promo' rel required
            }
        }
    },

    tests: [
        'https://www.bards.fm/e/bardsfm-interview-with-juan-o-savin/'
    ]
};