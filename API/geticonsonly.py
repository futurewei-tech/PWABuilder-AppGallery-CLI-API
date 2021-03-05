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
import json

def geticonsonly(name):
    folder = str("/tmp/icons_"+str(int(time.time()*1000)))
    print("fetching icons for "+name+" logo")
    print("creating icons temp dir - " + folder)
    os.system("mkdir " + folder)
    geticonscmd = "node " + os.getenv('UTIL_PATH') + "getIconsOnly.js " + name + " " + folder
    os.system(geticonscmd)
    f = open(folder+"/iconUrls.json", "r")
    data = json.load(f)
    return data
