class ImageHandler {
    // turn this into a loop over all our api_keys
    static async GetImages(hanzi) {

        return [
            {
                "w": 400,
                "h": 265,
                "src": "https://m.18zhongyao.com/uploads/allimg/200517/1-20051H22910M8.jpg"
            },
            {
                "w": 500,
                "h": 333,
                "src": "https://img03.sogoucdn.com/v2/thumb/retype_exclude_gif/ext/auto/crop/xy/ai/w/500/h/333?appid=200698&url=https://pic.baike.soso.com/ugc/baikepic2/0/20160801093508-1687346331.jpg/0"
            },
            {
                "w": 1009,
                "h": 671,
                "src": "https://pic.baike.soso.com/ugc/baikepic2/0/20170729200910-867812304.jpg/1284"
            },
            {
                "w": 980,
                "h": 514,
                "src": "https://app.ninchanese.com/image/word/traditional/246835/%E8%8A%B8%E8%8B%94%E5%AD%90.jpg"
            },
            {
                "w": 1008,
                "h": 665,
                "src": "https://www.18zhongyao.com/uploads/allimg/200517/1-20051H22929C6.jpg"
            }
        ];

        let query = `https://expressjs-prisma-production-140f.up.railway.app/img/${encodeURIComponent(hanzi)}`;
        let res = await (await fetch(query)).json();//, { method: "GET", mode: "no-cors" })
        let ret = []
        let len = 5;
        // get top 5 results
        for (var i = 0; i < len; ++i) {
            if (res.images_results[i].original.endsWith(".svg")
                || res.images_results[i].original.includes("ninchanese")) {
                ++len; continue; // skip svg, skip results that give away answer
            }
            let sum = res.images_results[i].original_height + res.images_results[i].original_width;
            let percent = 1;
            if (sum > 700)
                percent = 1 - 0.0001 * sum - .4; // e.g. 1000*0.0001=.9 => reduce by 10%..not enough let's continue to decrease by 40%
            let w = Math.floor(res.images_results[i].original_width * percent);
            let h = Math.floor(res.images_results[i].original_height * percent);
            ret.push({ w: w, h: h, src: res.images_results[i].original })
        }
        return ret;
    }

}

/*
let's add up the dimensions
then depending on the sum, we resize by some percent

900 = 1000 *.9  

how can we calculate the percentage that we want to reduce by
wait, doesn't a constant factor dependent on sum size do exactly what we want?
0.0001*sum

  "images_results": [
    {
      "position": 1,
      "thumbnail": "https://serpapi.com/searches/6364287d0f9866fb26417703/images/b025f12b85cec32a3756c1ae65bfa65fdc6b3d9e7f59773decab08663ca77b68.png",
      "source": "en.wikipedia.org",
      "title": "History of Apple Inc. - Wikipedia",
      "link": "https://en.wikipedia.org/wiki/History_of_Apple_Inc.",
      "original": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
      "original_width": 814,
      "original_height": 1000,
      "is_product": false
    },


*/