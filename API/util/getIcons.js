/*
      Copyright 2021. Futurewei Technologies Inc. All rights reserved.
  
      Licensed under the Apache License, Version 2.0 (the "License");
      you may not use this file except in compliance with the License.
      You may obtain a copy of the License at
  
        http:  www.apache.org/licenses/LICENSE-2.0
  
      Unless required by applicable law or agreed to in writing, software
      distributed under the License is distributed on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
      See the License for the specific language governing permissions and
      limitations under the License.
*/

const scrapFavicon = require('scrap-favicon'),
      scrape = require('html-metadata'),
      axios = require('axios'),
      fs = require('fs').promises,
      url = process.argv[2],
      filepath = process.argv[3]+'/iconUrl.json';
var d = {};

scrapFavicon(url)
.then(icons => {
  d.icon = icons;
  scrape(url).then(metadata => {
    d.metadata = metadata;
    iconArr = [];
    let size = "";
    d.icon.images.forEach(el => {
      if(el.scrapped)
        if(el.type === 'png'){
          if(el.width && el.height)
            size = el.width +"x"+ el.height;
          iconArr.push({ src: el.url, sizes: size, type: "image/png" });
        }
    })
    var data = { content: { json: {} } };
    data.content.json.name = d.metadata.general.author || d.metadata.site_name || d.metadata.general.title || d.metadata.openGraph.site_name || d.metadata.openGraph.title;
    data.content.json.short_name = d.metadata.general.author || d.metadata.site_name || d.metadata.general.title || d.metadata.openGraph.site_name || d.metadata.openGraph.title;
    data.content.json.description = d.metadata.general.description;
    data.content.json.lang = "English";
    data.content.json.display = "fullscreen";
    data.content.json.orientation = "portrait";
    data.content.json.start_url = url;
    data.content.json.icons = iconArr;
    data.content.json.theme_color = "#ffffff";
    data.content.json.background_color = "#ffffff";
    data.content.json.related_applications = [];
    data.content.json.prefer_related_applications = false;
    data.content.url = url;
    data.content.json.scope = "";
    data.content.json.generated = false;
    data.content.json.shortcuts = [];
    data.content.json.categories = "";
    data.content.json.screenshots = [];
    data.content.json.iarc_rating_id = "";
    data.content.json.share_target = "";

    data.content.name = d.metadata.general.author || d.metadata.site_name || d.metadata.general.title || d.metadata.openGraph.site_name || d.metadata.openGraph.title;
    data.content.short_name = d.metadata.general.author || d.metadata.site_name || d.metadata.general.title || d.metadata.openGraph.site_name || d.metadata.openGraph.title;
    data.content.description = d.metadata.general.description;
    data.content.lang = "English";
    data.content.display = "fullscreen";
    data.content.orientation = "portrait";
    data.content.start_url = url;
    data.content.icons = iconArr;
    data.content.theme_color = "#ffffff";
    data.content.background_color = "#ffffff";
    data.content.related_applications = [];
    data.content.prefer_related_applications = false;
    data.content.scope = "";
    data.content.generated = false;
    data.content.shortcuts = [];
    data.content.categories = "";
    data.content.screenshots = [];
    data.content.iarc_rating_id = "";
    data.content.share_target = "";
    console.log(JSON.stringify(data));
    (async () => {
      await fs.writeFile(filepath, JSON.stringify(data), 'utf8');
      return JSON.stringify(data);
    })();
  }).catch(err => {
    generateManifest(url, filepath);
    // console.error(err)
  });
}).catch(err => {
  generateManifest(url, filepath);
  // console.error(err)
});

const generateManifest = (url, filepath) => {
  let manifest = { content: { json: {} } },
      name = url.replace("https://", "").replace("http://", "").replace("www.", "").split('.')[0].trim().replace(/^\w/, (c) => c.toUpperCase());
    manifest.content.json.name = name;
    manifest.content.json.short_name = name;
    manifest.content.json.description = "";
    manifest.content.json.lang = "English";
    manifest.content.json.display = "fullscreen";
    manifest.content.json.orientation = "portrait";
    manifest.content.json.start_url = url;
    manifest.content.json.icons = [];
    manifest.content.json.theme_color = "#ffffff";
    manifest.content.json.background_color = "#ffffff";
    manifest.content.json.related_applications = [];
    manifest.content.json.prefer_related_applications = false;
    manifest.content.url = url;
    manifest.content.json.scope = "";
    manifest.content.json.generated = false;
    manifest.content.json.shortcuts = [];
    manifest.content.json.categories = "";
    manifest.content.json.screenshots = [];
    manifest.content.json.iarc_rating_id = "";
    manifest.content.json.share_target = "";
    manifest.content.json.generatedUrl = "";
    manifest.content.json.id = "";
    manifest.content.json.generated = true;
    manifest.generatedUrl = "";
    manifest.id = "";
    manifest.generated = true;
    manifest.icons = [];

    manifest.content.name = name;
    manifest.content.short_name = name;
    manifest.content.description = "";
    manifest.content.lang = "English";
    manifest.content.display = "fullscreen";
    manifest.content.orientation = "portrait";
    manifest.content.start_url = url;
    manifest.content.icons = [];
    manifest.content.theme_color = "#ffffff";
    manifest.content.background_color = "#ffffff";
    manifest.content.related_applications = [];
    manifest.content.prefer_related_applications = false;
    manifest.content.scope = "";
    manifest.content.generated = false;
    manifest.content.shortcuts = [];
    manifest.content.categories = "";
    manifest.content.screenshots = [];
    manifest.content.iarc_rating_id = "";
    manifest.content.share_target = "";
    manifest.content.json.generatedUrl = "";
    manifest.content.json.id = "";
    manifest.content.json.generated = true;

(async () => {
    // Google Custom Search Engine (CSE) - create a custom search engine here - https://cse.google.com/cse/setup/basic. Make sure 'Search the entire web', 'Image Search' are turned ON. Subject to API call charge.
    // cx = Google CSE ID.
    // key = Google API Key
    const googleApi = "https://www.googleapis.com/customsearch/v1?&num=10&searchType=image&fileType=png&cx="+process.env.G_CSE_ID+"&key="+process.env.G_API_KEY+"&q=" + manifest.content.json.name + " logo";
    const resp  = await axios.get(googleApi);
    const d = await resp.data;
    if(d.items.length > 0){
      d.items.forEach(el => {
        let size = el.image.width +"x"+ el.image.height;
        manifest.content.json.icons.push({ src: el.image.thumbnailLink, sizes: size, type: "image/png" });
        manifest.content.icons.push({ src: el.image.thumbnailLink, sizes: size, type: "image/png" });
        manifest.icons.push({ src: el.image.thumbnailLink, sizes: size, type: "image/png" });
      })
    }
    await fs.writeFile(filepath, JSON.stringify(manifest), 'utf8');
    return JSON.stringify(manifest);
  })();
}
