import * as querystring from 'querystring';

export default {

    re: [
        /^https:\/\/vimeo\.com(?:\/channels?\/\w+)?\/\d+/i, // Includes private reviews like /video/123/ABC.
        /^https?:\/\/player\.vimeo\.com\/video\/(\d+)/i
    ],

    mixins: [
        "oembed-title",
        //"oembed-thumbnail", // Allowed in getLink. Portrait videos's thumnnail has incorrect size in oEmbed.
        "oembed-author",
        "oembed-duration",
        "oembed-site",
        "oembed-description",
        "domain-icon"
    ],

    getMeta: function(oembed) {
        return {
            canonical: "https://vimeo.com/" + oembed.video_id,
            date: oembed.upload_date
        };
    },

    getLink: function(oembed, options) {
        const iframe = oembed.getIframe();

        const get_params = querystring.parse(options.getProviderOptions('vimeo.get_params', '').replace(/^\?/, ''));
        var providerOptions = options.getProviderOptions('_vimeo') || {};
        delete providerOptions.showinfo;

        const params = {...get_params, ...providerOptions};

        if (!options.getProviderOptions('_vimeo.showinfo', options.getProviderOptions('players.showinfo', true))) {
            params.title = 0;
            params.byline = 0;
            params.portrait = 0;
            params.badge = 0;
        }

        // Captions support:
        // https://vimeo.zendesk.com/hc/en-us/articles/360027818211-Enabling-Captions-and-Subtitles-in-Embeds-by-Default
        var texttrack = options.getRequestOptions('vimeo.texttrack');
        if (texttrack && /\w{2}(?:\-\W{2})?/i.test(texttrack)) {
            params.texttrack = texttrack;
        } else {
            texttrack = '';
            delete params.texttrack;
        }

        // https://developer.vimeo.com/api/oembed/videos
        var controls = options.getRequestOptions('_vimeo.controls', params.controls);
        if (controls == 0) {
            params.controls = false;
        } else if (params.controls) {
            delete params.controls;
        }

        var links = [];

        if (oembed.thumbnail_url || !options.getProviderOptions('vimeo.disable_private', false)) {
            links.push({
                href: iframe.replaceQuerystring(options.digitize(params)),
                type: CONFIG.T.text_html,
                rel: CONFIG.R.player,
                "aspect-ratio": oembed.width / oembed.height, // ex. portrait https://vimeo.com/216098214
                autoplay: "autoplay=1",
                options: {
                    texttrack: {
                        value: texttrack,
                        label: 'Text language (ignored if no captions)',
                        placeholder: 'Two letters: en, fr, es, de...'
                    }
                }
            });
        }

        if (!oembed.thumbnail_url) {
            links.push({message: 'This Vimeo video has site restrictions.'});
        } else {

            var thumbnail = {
                href:oembed.thumbnail_url,
                type: CONFIG.T.image,
                rel: [CONFIG.R.thumbnail, CONFIG.R.oembed],
            };

            // oEmbed comes with the wrong thumbnail sizes for portrait videos,
            // Let validators check image size for those.
            if (oembed.thumbnail_width > oembed.thumbnail_height) {
                thumbnail.width = oembed.thumbnail_width;
                thumbnail.height = oembed.thubnail_height;
            }
            links.push(thumbnail);
        }

        return links;
    },


    tests: [{
        feed: "http://vimeo.com/channels/bestofstaffpicks/videos/rss"
    },
        "https://vimeo.com/65836516",
        "https://vimeo.com/141567420",
        "https://vimeo.com/76979871", // Captions
        "https://vimeo.com/216098214", // Portrait
        {
            skipMixins: ["oembed-description"],
            skipMethods: ["getData"]
        }
    ]
};