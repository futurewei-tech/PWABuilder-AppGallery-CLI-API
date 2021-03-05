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

import requests
import json
import os

def publish(cid, secret, aid, apk):
    outcome = "success"
    url = os.getenv('AG_TOKEN_API') + "token"
    payload = "{\"grant_type\":\"client_credentials\"," \
              "\"client_id\":\"%s\"," \
              "\"client_secret\":\"%s\"}"\
              % (cid, secret)
    headers = {
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print(response.text.encode('utf8'))
    if not response.ok:
        return response.text.encode('utf8')
    token = json.loads(response.text)['access_token']
    #
    url = os.getenv('AG_PUBLISH_API') + "upload-url"
    headers = {
        'Content-Type': 'application/json',
        'client_id': cid,
        'Authorization': 'Bearer ' + token
    }
    query = {
        'appId': aid,
        'suffix': 'apk'
    }
    response = requests.request("GET", url, headers=headers, params=query)
    print(response.text.encode('utf8'))
    if not response.ok:
        return response.text.encode('utf8')
    uploadUrl = json.loads(response.text)['uploadUrl']
    chunkUploadUrl = json.loads(response.text)['chunkUploadUrl']
    authCode = json.loads(response.text)['authCode']
    #
    headers = {
        'accept': 'application/json'
    }
    multipart_form_data = {
        'file': ('pwa.apk', open(apk, 'rb')),
        'authCode': (None, authCode),
        'fileCount': (None, '1')
    }
    response = requests.request("POST", uploadUrl, files=multipart_form_data, headers=headers,)
    print(response.text.encode('utf8'))
    if not response.ok:
        return response.text.encode('utf8')
    fileurl = json.loads(response.text)['result']['UploadFileRsp']['fileInfoList'][0]['fileDestUlr']
    #
    url = os.getenv('AG_PUBLISH_API') + "app-file-info"
    headers = {
        'Content-Type': 'application/json',
        'client_id': cid,
        'Authorization': 'Bearer ' + token
    }
    query = {
        'appId': aid
    }
    payload = json.dumps({"fileType": 5, "files": [{"fileName": "pwa.apk", "fileDestUrl": fileurl}]})
    response = requests.request("PUT", url, headers=headers, params=query, data=payload)
    print(response.text.encode('utf8'))
    if not response.ok:
        return response.text.encode('utf8')
    #
    url = os.getenv('AG_PUBLISH_API') + "app-submit"
    headers = {
        'Content-Type': 'application/json',
        'client_id': cid,
        'Authorization': 'Bearer ' + token
    }
    query = {
        'appId': aid
    }
    payload = json.dumps({})
    response = requests.request("POST", url, headers=headers, params=query, data=payload)
    print(response.text.encode('utf8'))
    if not response.ok:
        return response.text.encode('utf8')
    #
    return outcome
