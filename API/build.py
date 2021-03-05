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

import time
import os
import urllib.request
import requests

def build(pkg, url, kits, ads, agcs, signingAlias, signingFullname, signingOrganization, signingOrganizationalUnit, signingCountryCode, signingKeyPassword, signingStorePassword, iconUrl, whitelist, manifest):
    folder = str("/tmp/pwa"+str(int(time.time()*1000)))
    icon = folder + "/ic_launcher.png"
    os.system("mkdir " + folder)
    os.system("echo " + agcs + " | base64 --decode > " + folder + "/agconnect-services.json")
    pwacmd = "/usr/bin/node " + os.getenv('CLI_PATH') + " --package " + pkg + " --url " + url + " --json " + folder + "/agconnect-services.json" + " --output " + folder
    pwacmd += " --signingAlias " + signingAlias
    pwacmd += " --signingFullname " + signingFullname
    pwacmd += " --signingOrganization " + signingOrganization
    pwacmd += " --signingOrganizationalUnit " + signingOrganizationalUnit
    pwacmd += " --signingCountryCode " + signingCountryCode
    pwacmd += " --signingKeyPassword " + signingKeyPassword
    pwacmd += " --signingStorePassword " + signingStorePassword
    if len(whitelist) > 0:
        pwacmd += " --whitelist " + whitelist
    try:
        response = requests.get(iconUrl)
        response.raise_for_status()
        urllib.request.urlretrieve (iconUrl, icon)
        pwacmd += " --icon " + icon
    except requests.exceptions.HTTPError as errh:
        print ("Http Error:",errh)
    except requests.exceptions.ConnectionError as errc:
        print ("Error Connecting:",errc)
    except requests.exceptions.Timeout as errt:
        print ("Timeout Error:",errt)
    except requests.exceptions.RequestException as err:
        print ("Oops: There is some error:",err)
    pwacmd += " --manifest " + manifest
    os.system("echo " + pwacmd)
    os.system(pwacmd)
    os.system("cd " + folder + "; "+os.getenv('ZIP_PATH')+" -r pwa.zip *")
    return folder

