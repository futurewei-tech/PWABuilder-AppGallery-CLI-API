#
#    Copyright 2021. Futurewei Technologies Inc. All rights reserved.
#
#    Licensed under the Apache License, Version 2.0 (the "License");
#    you may not use this file except in compliance with the License.
#    You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#    Unless required by applicable law or agreed to in writing, software
#    distributed under the License is distributed on an "AS IS" BASIS,
#    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#    See the License for the specific language governing permissions and
#    limitations under the License.
#

import build
import publish
import geticons
import geticonsonly
import time
import os
import base64
import json
from flask_cors import CORS
from flask import Flask, request, send_file, send_from_directory, safe_join, abort
import logging
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/build_apk', methods=['POST'])
def build_apk():
    content = request.json
    print(content)
    # print(content['agcs'])
    mfile = 'manifest.json'
    mfolder = str("/tmp/manifest"+str(int(time.time()*1000))+'/')
    manifest = {}
    manifest['name'] = content['name']
    manifest['short_name'] = content['name']
    manifest['description'] = content['name']
    manifest['start_url'] = content['host']
    manifest['scope'] = '/any/'
    manifest['display'] = content['display']
    manifest['orientation'] = 'portrait'
    manifest['lang'] = 'English'
    os.mkdir(mfolder)
    with open(mfolder + mfile, 'w') as f:
        json.dump(manifest, f, indent=4)
    folder = build.build(content['packageId'],
                         content['host'],
                         content.get('HMSKits', ''),
                         content['ads_id'],
                         content['agcs'].replace('data:application/json;base64,', ''),
                         content['signing']['alias'],
                         content['signing']['fullName'],
                         content['signing']['organization'],
                         content['signing']['organizationalUnit'],
                         content['signing']['countryCode'],
                         content['signing']['keyPassword'],
                         content['signing']['storePassword'],
                         content.get('iconUrl', ''),
                         content['whitelist'],
                         mfolder + mfile)
    return send_from_directory(folder, filename="pwa.zip", as_attachment=True, mimetype='application/zip')

@app.route('/publish_apk', methods=['POST'])
def publish_apk():
    content = request.json
    print(content)
    folder = str("/tmp/pwa_apk"+str(int(time.time()*1000)))
    os.system("mkdir " + folder)
    file = open(folder + '/pwa.apk', 'wb')
    file.write(base64.b64decode(content['apk'].replace('data:application/vnd.android.package-archive;base64,', '')))
    file.close()
    outcome = publish.publish(content['client_id'], content['client_key'], content['app_id'], folder + "/pwa.apk")
    return outcome

@app.route('/webmanifest', methods=['POST'])
def get_web_manifest():
    content = request.json
    print(content)
    data = geticons.geticons(content['url'])
    return data

@app.route('/get_icons', methods=['POST'])
def get_icons_only():
    content = request.json
    print(content)
    data = geticonsonly.geticonsonly(content['name'])
    return data

@app.route('/', methods=['GET'])
def get_success():
    return 'get success'

@app.errorhandler(500)
def internal_server_error(e):
    return flask.jsonify(error=404, text=str(e)), 500

if __name__ == "__main__":
    logging.basicConfig(filename=os.getenv('LOG_PATH')+'api_error.log',level=logging.DEBUG)
    app.run(host="0.0.0.0", port=80)
