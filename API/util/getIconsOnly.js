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

const axios = require('axios'),
      fs = require('fs').promises,
      name = process.argv[2],
      filepath = process.argv[3]+'/iconUrls.json';
var data = { icons: [] };

(async () => {
    // Google Custom Search Engine (CSE) - create a custom search engine here - https://cse.google.com/cse/setup/basic. Make sure 'Search the entire web', 'Image Search' are turned ON. Subject to API call charge.
    // cx = Google CSE ID. Please setup this env var in ../start.sh.
    // key = Google API Key. Please setup this env var in ../start.sh.
    const googleApi = "https://www.googleapis.com/customsearch/v1?&num=10&searchType=image&fileType=png&cx="+process.env.G_CSE_ID+"&key="+process.env.G_API_KEY+"&q=" + name + " logo";
    const resp  = await axios.get(googleApi);
    const d = await resp.data;
    if(d.items.length > 0){
      d.items.forEach(el => {
        const size = el.image.width +"x"+ el.image.height;
        data.icons.push({ src: el.image.thumbnailLink, sizes: size, type: "image/png" });
      })
    }
    await fs.writeFile(filepath, JSON.stringify(data), 'utf8');
    return JSON.stringify(data);
})();