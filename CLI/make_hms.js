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

const fs = require('fs');
const fsExtra = require('fs-extra');
const copydir = require('copy-dir');
const { Console, debug } = require('console');
// var exec = require('child_process').exec, child;
const execSync = require('child_process').execSync;
const program = require('commander');
const { COPYFILE_FICLONE } = require('constants');

const path = require("path");
const { stringify } = require('querystring');
const dotenv = require('dotenv').config( {
  path: path.join(__dirname, '.env')
} );

const debugFlag = false;
const oldPackage = "com.bvutest.core.pwa";
const gitUri = "https://github.com/bryantvu/HMS-PWA-Core-Template.git";

//env vars
var corePath = "";
var readmePath = "";
var manifestTemplatePath = "";
var localPropertiesPath = "";

var pwaTempPath = '';
var pwaTempNamePath = '';
var templatePath = '';
var pwaUrl = '';
var packageName = '';
var iconPath = '';

//keystore
var signAlias = '';
var signFullname = '';
var signOrg = '';
var signOrgUnit = '';
var signCountry = '';
var signKeyPass = '';
var signStorePass = '';

//HMS build options
// var adsIdSplash = 'testd7c5cewoj6';
// var adsIdTop = 'testw6vs28auh3';
// var adsIdBot = 'testw6vs28auh3';

var enableAds = false;
var adsIdSplash = '';
var adsIdTop = '';
var adsIdBot = '';

var apkOutputPath = '';
var agcsJsonPath = '';

var appId = "";
var cpId = "";

var colorStatus = "";
var colorSplash = "";
var colorNav = "";
var colorNavDivider = "";

var logText = [];

initLog();
getArgs();
getEnvVars();
gitOperations();
if(runPwaBuilder()){
    copyTemplate();
    // getPwaTempNamePath();
    copyPwaFiles();
    appIconOperations();
    addWhitelist();
    copyAgcsJson();
    copyLocalProperties();
    editFiles();
    refactorJavaFiles();
    buildApk();
}
outputLog();

// if(dotenv.error){
//     throw dotenv.error;
// }
// console.log(path.join(__dirname, '.env'));
// console.log(dotenv.parsed.PWABUILDER_PATH);



function getArgs(){
    log("Reading build options",1);

    program
        .option('-p, --package <type>', 'Android package name')
        .option('-a, --appName <type>', 'App name')
        // .option('-l, --launcherName <type>', 'App launcher name')
        // .option('-v, --appVersion <type>', 'App version')
        // .option('-c, --versionCode <type>', 'App version code')
        // .option('-d, --display <type>', 'display')
        .option('-u, --url <type>', 'website URL')
        // .option('-s, --startUrl <type>', 'website start URL')
        // .option('-t, --themeColor <type>', 'theme color')
        // .option('-n, --navigationColor <type>', 'navigation color')
        // .option('-b, --backgroundColor <type>', 'background color')
        .option('-i, --icon <type>', 'app icon')
        // .option('--maskableIcon <type>', 'app maskable icon')
        // .option('--monochromeIconUrl <type>', 'app monochrome icon')
        // .option('--signingMode <type>', 'signing mode')
        // .option('--signingFile <type>', 'signing file path')
        .option('--signingAlias <type>', 'signing alias')
        .option('--signingFullname <type>', 'signing full name')
        .option('--signingOrganization <type>', 'signing organization')
        .option('--signingOrganizationalUnit <type>', 'signing organizational unit')
        .option('--signingCountryCode <type>', 'signing country code')
        .option('--signingKeyPassword <type>', 'signing key password')
        .option('--signingStorePassword <type>', 'signing store password')
        // .option('-sc, --shortcuts <type>', 'shortcuts')
        // .option('--fallbackType <type>', 'fallbackType')
        // .option('--splashScreenFadeOutDuration <type>', 'splash screen fade out duration')
        // .option('--notifications', 'enable notifications')
        //HMS ads options
        .option('--adsIdSplash <type>', 'Ads ID splash')
        .option('--adsIdTop <type>', 'Ads ID top banner')
        .option('--adsIdBot <type>', 'Ads ID bottom banner')
        //HMS kit selection
        .option('--analytics', 'enable analytics')
        .option('--push', 'enable push')
        .option('-o, --output <type>', 'output path')
        .option('-j, --json <type>', 'agconnect-services.json path')
        //HMS App & CP ID
        .option('--appId <type>', 'set App ID')
        .option('--cpId <type>', 'set CP ID')
        //color options
        .option('--colorStatus <type>', 'status bar color')
        .option('--colorSplash <type>', 'splash color')
        .option('--colorNav <type>', 'navigation bar color')
        .option('--colorNavDivider <type>', 'navigation bar divider color')
        //log options
        .option('--log', 'enable log output to file')
        //URL whitelist list
        .option('--whitelist <type>', 'URL whitelist list')
        //manifest generated by front-end
        .option('--manifest <type>', 'manifest path')

    program.parse(process.argv);
    // console.log(process.argv);
    log(process.argv, 1);
    if (program.debug) log(program.opts()), 3;

    //package name
    var tag = "package name";
    if (program.package) {
        
        packageName = program.package;
        log(`${tag} :: ${program.package}`, 3);
    }
    //host url
    var tag = "host URL";
    if (program.url) {
        pwaUrl = program.url;
        log(`${tag} :: ${program.url}`, 3);
    }
    //app icon
    var tag = "app icon";
    if (program.icon) {
        iconPath = program.icon;
        log(`${tag} :: ${program.icon}`, 3);
    }else{
        log(`${tag} :: using default/PWA icon`, 3);
    }

    //KEYSTORE
    // log("KEYSTORE options");
    //signing alias
    var tag = "signingAlias";
    if (program.signingAlias) {
        signAlias = program.signingAlias;
        log(`${tag} :: ${program.signingAlias}`, 3);
    }else{
        log(`${tag} :: skipped`, 3);
    }
    //signing full name
    var tag = "signingFullname";
    if (program.signingFullname) {
        signFullname = program.signingFullname;
        log(`${tag} :: ${program.signingFullname}`, 3);
    }else{
        log(`${tag} :: skipped`, 3);
    }
    //signing organization
    var tag = "signingOrganizationn";
    if (program.signingOrganization) {
        signOrg = program.signingOrganization;
        log(`${tag} :: ${program.signingOrganization}`, 3);
    }else{
        log(`${tag} :: skipped`, 3);
    }
    //signing organizational unit
    var tag = "signingOrganizationalUnit";
    if (program.signingOrganizationalUnit) {
        signOrgUnit = program.signingOrganizationalUnit;
        log(`${tag} :: ${program.signingOrganizationalUnit}`, 3);
    }else{
        log(`${tag} :: skipped`, 3);
    }
    //signing country code
    var tag = "signingCountryCode";
    if (program.signingCountryCode) {
        signCountry = program.signingCountryCode;
        log(`${tag} :: ${program.signingCountryCode}`, 3);
    }else{
        log(`${tag} :: skipped`, 3);
    }
    //signing key password
    var tag = "signingKeyPassword";
    if (program.signingKeyPassword) {
        signKeyPass = program.signingKeyPassword;
        log(`${tag} :: ${program.signingKeyPassword}`, 3);
    }else{
        log(`${tag} :: skipped`, 3);
    }
    //signing store password
    var tag = "signingStorePassword";
    if (program.signingStorePassword) {
        signStorePass = program.signingStorePassword;
        log(`${tag} :: ${program.signingStorePassword}`,3);
    }else{
        log(`${tag} :: skipped`,3);
    }

    //HMS BUILD OPTIONS
    // log("HMS build options");
    //Ads ID Splash
    var tag = "adsIdSplash";
    if (program.adsIdSplash) {
        adsIdSplash = program.adsIdSplash;
        log(`${tag} :: ${program.adsIdSplash}`,3);
    }
    //Ads ID Top
    var tag = "adsIdTop";
    if (program.adsIdTop) {
        adsIdTop = program.adsIdTop;
        log(`${tag} :: ${program.adsIdTop}`,3);
    }
    //Ads ID Bot
    var tag = "adsIdBot";
    if (program.adsIdBot) {
        adsIdBot = program.adsIdBot;
        log(`${tag} :: ${program.adsIdBot}`,3);
    }
    //Enable Ads
    var tag = "adsIdSplash";
    if (program.adsIdSplash||program.adsIdTop||program.adsIdBot) {
        enableAds = true;
        log(`${tag} :: true`,3);
    }
    //Enable Analytics
    var tag = "analytics";
    if (program.analytics) {
        enableAnalytics = program.analytics;
        log(`${tag} :: ${program.analytics}`,3);
    }
    //Enable Push
    var tag = "push";
    if (program.push) {
        enablePush = program.push;
        log(`${tag} :: ${program.push}`,3);
    }

    //apk output path
    var tag = "output";
    if (program.output) {
        apkOutputPath = program.output;
        log(`${tag} :: ${program.output}`,3);
    }
    //json
    var tag = "json";
    if (program.json) {
        agcsJsonPath = program.json;
        log(`${tag} :: ${program.json}`,3);
    }
    //HMS App & CP ID
    var tag = "appId";
    if (program.appId) {
        appId = program.appId;
        log(`${tag} :: ${program.appId}`,3);
    }
    var tag = "cpId";
    if (program.cpId) {
        cpId = program.cpId;
        log(`${tag} :: ${program.cpId}`,3);
    }
    //color strings
    var tag = "colorStatus";
    if (program.colorStatus) {
        colorStatus = program.colorStatus;
        log(`${tag} :: ${colorStatus}`,3);
    }
    var tag = "colorSplash";
    if (program.colorSplash) {
        colorSplash = program.colorSplash;
        log(`${tag} :: ${colorSplash}`,3);
    }
    var tag = "colorNav";
    if (program.colorNav) {
        colorNav = program.colorNav;
        log(`${tag} :: ${colorNav}`,3);
    }
    var tag = "colorNavDivider";
    if (program.colorNavDivider) {
        colorNavDivider = program.colorNavDivider;
        log(`${tag} :: ${colorNavDivider}`,3);
    }
    var tag = "whitelist";
    if (program.whitelist) {
        log(`${tag} :: ${program.whitelist}`,3);
    }

    tag = "manifest";
    if (program.manifest) {
        log(`${tag} :: ${program.manifest}`,3);
    }
}

//get directory values from .env file
function getEnvVars(){
    log("getting PWA Builder path from env file",1);
    try{
        if(dotenv.error){
            throw dotenv.error;
        }
        const envPwabuilderPath = dotenv.parsed.PWABUILDER_PATH;
        const envTemplatePath = envPwabuilderPath+"/templates";
        corePath = envTemplatePath+"/hms_core";
        readmePath = envTemplatePath+"/Readme.html";
        manifestTemplatePath = envTemplatePath+"/manifest.json";
        localPropertiesPath = envTemplatePath+"/local.properties";
        pwaTempPath = envPwabuilderPath+pwaTempPath;
        templatePath = envPwabuilderPath+templatePath;
    }catch(e){
        log(`failed to get env vars :: ${e}`, 3);
    }
}

//do git init and git pull
function gitOperations(){
    // log("gitOperations");
    gitInit(corePath);
    gitPull(corePath, gitUri);
}

//init git for firs time run
function gitInit(path){
    log("git init",1);
    var command = `git -C ${path} init`;
    log(`${command}`, 3);
    try{
        if (!fs.existsSync(path)){
            fs.mkdirSync(path);
        }
        const output = execSync(command, { encoding: 'utf-8' });
        log(`success`,3);
    }catch(e){
        log(`error :: ${e}`,3);
    }
}

//update templates from GitHub
function gitPull(path, gitUri){
    //git pull
    log("git pull",1);
    var command = `git -C ${path} pull ${gitUri}`;
    log(`${command}`,3);
    try{
        const output = execSync(command, { encoding: 'utf-8' });
        log(`success`,3);
    }catch(e){
        log(`error :: ${e}`,3);
    }
}

//run PWA Builder CLI
function runPwaBuilder(){
    log("running PWA Builder CLI", 1);
    var command = ``;
    //run CLI with manifest from front-end
    if(program.manifest){
        log(`running PWA Builder CLI w/ preflight manifest`,3);
        command = `pwabuilder ${pwaUrl} -l debug -p android -d ${pwaTempPath} -m ${program.manifest}`;
        log(`${command}`,3);
        try{
            execSync(command, { encoding: 'utf-8' });
        }catch(e){
            log(`error :: ${e}`,3);
        }

        if(getPwaTempNamePath1()){
            log(`success :: PWA Builder CLI generated files on w/ preflight manifest`,3);
            return true;
        }else{
            return false;
        }
    //run CLI standalone, no manifest from front-end
    }else{
        log(`running PWA Builder CLI without preflight manifest`,3);
        command = `pwabuilder ${pwaUrl} -l debug -p android -d ${pwaTempPath}`;
        log(`${command}`,3);
        //actual CLI command
        try{
            execSync(command, { encoding: 'utf-8' });
        }catch(e){
            log(`error :: ${e}`,3);
        }

        //check
        if(getPwaTempNamePath1()){

            if(getPwaTempNamePath2()){
                log(`success :: PWA Builder CLI generated files on 1st try w/ preflight manifest`,3);
                // log(`success :: PWA Builder CLI generated files on 2nd try w/ generated manifest`,3);
                return true;
            }else{
                log(`Error 1 :: PWA Builder CLI failed to generate files`,3);
                log("generating manifest", 3);
                var manifestPath = templatePath+"/manifest.json";

                //copy template manifest file to pwaTempPath
                makeDir(templatePath);
                copyFile(manifestTemplatePath, manifestPath);
                //replace app name and URL strings
                replaceString(manifestPath, "nameReplace", program.appName);
                replaceString(manifestPath, "urlReplace", program.url);
                pwaTempNamePath = `${pwaTempPath}/${program.appName}`;

                log("Running CLI with manifest generated by build script", 3);
                var command = `pwabuilder ${pwaUrl} -l debug -p android -d ${pwaTempPath} -m ${manifestPath}`;
                log(`${command}`,3);
                try{
                    const output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
                    log(`success :: PWA Builder CLI generated files with manifest`,3);
                    return true;
                }catch(e){
                    log(`error :: ${e}`,3);
                }

                if(getPwaTempNamePath2()){
                    log(`success :: PWA Builder CLI generated files with manifest`,3);
                    return true;
                }else{
                    log(`Error 1 :: PWA Builder CLI failed to generate files with auto manifest`,1);
                    return false;
                }
                // log(`Error 1 :: PWA Builder CLI failed to generate files with auto manifest`,1);
                // return false;
            }
            
        }else{
            log(`Error 1 :: PWA Builder CLI failed to generate files`,1);
            return false;
        }

    }
    
    
}

//create new folder
function makeDir(path){
    var command = `mkdir -p ${path}`;
    log(`make directory`,1);
    try{
        execSync(command, { encoding: 'utf-8' });
        // log('copyAppIcon copy file name :: ' + command);
        log(`${command}`,3);
    }catch(e){
        log("error :: "+ e,3);
    }
}

//copy template to build path
function copyTemplate(){
    log("Copying HMS template to build path",1);

    copydir.sync(corePath, templatePath, {
        utimes: true,  // keep add time and modify time
        mode: true,    // keep file mode
        cover: true    // cover file when exists, default is true
    });
}

function getPwaTempNamePath1(){
    log("Getting full path for PWA Builder CLI output 1",1);
    var command = `ls ${pwaTempPath}`;
    try{
        var output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
        output = output.replace(/(\r\n|\n|\r)/gm, "");
        // log(`- output folder :: ${output}`);
        pwaTempNamePath = pwaTempPath+"/"+output;
        log(`${pwaTempNamePath}`,3);
        return true;

        // command = `ls ${pwaTempNamePath}`;
        // output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
        // output = output.replace(/(\r\n|\n|\r)/gm, "");
        // // log(`- output folder :: ${output}`);
        // if(output){
        //     pwaTempNamePath = pwaTempNamePath+"/"+output;
        //     log(`${pwaTempNamePath}`,3);
        //     return true;
        // }else{
        //     return false;
        // }

    }catch(e){
        log(`error :: + ${e}`,3);
        return false;
    }

}

function getPwaTempNamePath2(){
    log("Getting full path for PWA Builder CLI output 2",1);
    var command = `ls ${pwaTempNamePath}`;
    log(command, 3);

    // try{
    //     log(`deleting previous path`,3);
    //     deletePath(pwaTempNamePath);
    // }catch(e){
    //     log(`error :: + ${e}`,3);
    //     return false;
    // }

    try{
        var output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
        // output = output.replace(/(\r\n|\n|\r)/gm, "");
        log(`- output folder :: ${output}`,3);
        // pwaTempNamePath = pwaTempPath+"/"+output;
        // log(`${pwaTempNamePath}`,3);
        if(output){
            return true;
        }else{
            return false;
        }  

    }catch(e){
        log(`error :: + ${e}`,3);
        return false;
    }

}



function copyPwaFiles(){
    log("Copying files from PWA Builder CLI output to build path",1);
    var androidSourcePath = "/android/source";
    var manifestPath = "/app/src/main/assets";
    var stringsPath = "/app/src/main/res/values/strings.xml";
    var colorsPath = "/app/src/main/res/values/colors.xml";
    var iconPath1 = "/app/src/main/res/mipmap-hdpi/";
    var iconPath2 = "/app/src/main/res/mipmap-mdpi/";
    var iconPath3 = "/app/src/main/res/mipmap-xhdpi/";
    var iconPath4 = "/app/src/main/res/mipmap-xxhdpi/";
    var iconPath5 = "/app/src/main/res/mipmap-xxxhdpi/";

    //manifest.json
    log("manifest.json",2);
    try{
        copydir.sync(pwaTempNamePath+androidSourcePath+manifestPath, templatePath+manifestPath, {
            utimes: true,  // keep add time and modify time
            mode: true,    // keep file mode
            cover: true    // cover file when exists, default is true
        });
        log("manifest.json :: success",3);
    }catch(e){
        log(`manifest.json copy error :: ${e}`,3);
    }

    //app name
    log("app name",2);
    var newAppName = '';
    if(program.appName){
        //if appName build option is set, use as App Name
        try{
            newAppName = program.appName;
            log(`app name :: <build option> ${newAppName}`,3);
        }catch(e){
            log(`error getting app name :: ${e}`,3);
        }
    }else{
        //if appName build option is not set, get default from PWA Builder CLI
        var path = pwaTempNamePath+androidSourcePath+stringsPath;
        var command = `xmlstarlet sel -t -c '/resources/string[1]/text()' ${path}`;
        log(`${command}`,3);
        
        try{
            newAppName = execSync(command, { encoding: 'utf-8' });
            log(`app name :: <PWA Builder CLI> ${newAppName}`,3);
        }catch(e){
            log(`error getting app name :: ${e}`,3);
        }
    }
    

    //edit template file with new app name
    path = templatePath+stringsPath;
    command = `xmlstarlet ed --inplace -u "//resources/string[1]" --value '${newAppName}' ${path}`;
    log(`${command}`,3);
    try{
        execSync(command, { encoding: 'utf-8' });
        log(`app name set :: success`,3);
    }catch(e){
        log(`error setting :: ${e}`,3);
    }

    //color
    log("colors.xml",2)
    if(program.colorStatus){
        replaceString(templatePath+colorsPath, "3F51B0", colorStatus);
    }
    if(program.colorSplash){
        replaceString(templatePath+colorsPath, "3F51B1", colorSplash);
    }
    if(program.colorNav){
        replaceString(templatePath+colorsPath, "3F51B2", colorNav);
    }
    if(program.colorNavDivider){
        replaceString(templatePath+colorsPath, "3F51B3", colorNavDivider);
    }

    //app icons
    //xxx-hdpi might be the only path that has real app icon
    log(`app icon - PWA Builder CLI`,2);
    copyAppIcon("mipmap-hdpi", pwaTempNamePath+androidSourcePath+iconPath1, templatePath+iconPath1);
    copyAppIcon("mipmap-mdpi", pwaTempNamePath+androidSourcePath+iconPath2, templatePath+iconPath2);
    copyAppIcon("mipmap-xhdpi", pwaTempNamePath+androidSourcePath+iconPath3, templatePath+iconPath3);
    copyAppIcon("mipmap-xxhdpi", pwaTempNamePath+androidSourcePath+iconPath4, templatePath+iconPath4);
    copyAppIcon("mipmap-xxxhdpi", pwaTempNamePath+androidSourcePath+iconPath5, templatePath+iconPath5);
}

function copyAppIcon(tag, oldPath, newPath){
    log(`${tag}`,1);
    try{
        copydir.sync(oldPath, newPath, {
            utimes: true,  // keep add time and modify time
            mode: true,    // keep file mode
            cover: true    // cover file when exists, default is true
        });
        log(`${oldPath} -> ${newPath}`,3);
    }catch(e){
        log(`error :: ${e}`,3);
    }
}

//replace strings inside of specified file
function replaceString(path,targetString, replacementString){
    log(`${targetString} -> ${replacementString}`,1);
    var command = `sed -i \"s*`+targetString+`*`+replacementString +`*g\" ${path}`;
    log(`${command}`,3);
    try{
        execSync(command, { encoding: 'utf-8' });
        log('success',3);
    }catch(e){
        log(`error :: ${e}`,3);
    }
}

function appIconOperations(){
    log(`app icon - build option`,1);

    const iconPath1 = templatePath+"/app/src/main/res/mipmap-hdpi/ic_launcher.png";
    const iconPath2 = templatePath+"/app/src/main/res/mipmap-mdpi/ic_launcher.png";
    const iconPath3 = templatePath+"/app/src/main/res/mipmap-xhdpi/ic_launcher.png";
    const iconPath4 = templatePath+"/app/src/main/res/mipmap-xxhdpi/ic_launcher.png";
    const iconPath5 = templatePath+"/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png";

    const iconSize1 = "72x72";
    const iconSize2 = "48x48";
    const iconSize3 = "96x96";
    const iconSize4 = "144x144";
    const iconSize5 = "192x192";

    //app icon build option
    if (program.icon) {
        log(`Copy app icon`,3);
        copyFile(iconPath, iconPath5);
        resizeImage(iconPath5, iconSize5);
    }else{
        log("copyAppIcon :: --icon not found",3);
    }

    //delete files with numeric chars
    deleteNumericFilenames();

    //copy app icon from xxxhdpi into all other folders
    copyFile(iconPath5, iconPath1);
    resizeImage(iconPath1, iconSize1);
    copyFile(iconPath5,iconPath2);
    resizeImage(iconPath2, iconSize2);
    copyFile(iconPath5,iconPath3);
    resizeImage(iconPath3, iconSize3);
    copyFile(iconPath5,iconPath4);
    resizeImage(iconPath4, iconSize4);
}

function deleteNumericFilenames(){
    log(`Remove files with numeric filenames`,1);
    var path = templatePath+"/app/src/main/res/mipmap-xxxhdpi/";
    command = `ls ${path}`;
    // console.log(command);
    var output = '';
    try{
        var output = execSync(command, { encoding: 'utf-8' });
        log('files in mipmap-xxxhdpi path :: ' + output,3);
        // output = output.split("\n");
        // output = output[0];
    }catch(e){
        log("error :: "+ e,3);
    }

    if(isFilenameNumeric(output)){
        log(`Numbers detected in mipmap-xxxhdpi path`,3);
        var mipmapFiles = output.split("\n");
        // console.log(mipmapFiles);
        mipmapFiles.forEach(function(e){
            if(isFilenameNumeric(e)){
                path = templatePath+"/app/src/main/res/mipmap-xxxhdpi/"+e;
                try{
                    fsExtra.unlinkSync(path);
                    log("delete :: "+ path,3);
                }catch(e){
                    log("error :: "+ e,3);
                }
            }
            
        });
    }else{
        // log("copyAppIcon :: !isNumeric",2);
        log(`No numbers detected in :: ${output}`,3);
    }
}

function copyFile(sourcePath, targetPath){
    var command = `yes | cp -rf ${sourcePath} ${targetPath}`;
    log(`Copy file`,1);
    try{
        var output = execSync(command, { encoding: 'utf-8' });
        // log('copyAppIcon copy file name :: ' + command);
        log(`${command}`,3);
    }catch(e){
        log("error :: "+ e,3);
    }
}

function resizeImage(path, size){
    var command = `mogrify -resize ${size} ${path}`;
    try{
        var output = execSync(command, { encoding: 'utf-8' });
        // log('copyAppIcon copy file name :: ' + command);
        log(`resize image :: ${size} | ${path}`,3);
    }catch(e){
        log("error :: "+ e,3);
    }
}

function isFilenameNumeric(str){
    for (var i = 0; i < str.length; i++) {
        if(isNumeric(str.charAt(i))){
            // log(`Numbers detected in ${str}`,3);
            return true;
        }
    }
    // log(`No numbers detected in ${str}`,3);
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

function copyAgcsJson(){
    if (program.json) {
        log("Copying agconnect-services.json to project folder",1);
        var path = "/app/agconnect-services.json";

        try{
            fs.copyFileSync(agcsJsonPath, templatePath+path, (err) => {
                if (err) throw err;
                log('success',3);
            });
        }catch(e){
            log("error :: "+ e,3);
        }
    }else{
        log("agconnect-services.json skipped",3);
    }
}

function copyLocalProperties(){
    log("Copy local properties",1);
    // const oldPath = '/home/ubuntu/pwa_builder/templates/local.properties';
    const newPath = templatePath+"/local.properties";
    try{
        fs.copyFileSync(localPropertiesPath, newPath, (err) => {
            if (err) throw err;
            log('success',3);
        });
    }catch(e){
        log("error :: "+ e,3);
    }
}

function editFiles(){
    log("Modify strings in various files",1);

    //build.gradle
    log("build.gradle",2);
    var buildGradlePath = templatePath+"/app/build.gradle";
    replacePackageName(buildGradlePath);

    //AndroidManifest.xml
    log("AndroidManifest.xml",2);
    var androidManifestPath = templatePath+"/app/src/main/AndroidManifest.xml";
    replacePackageName(androidManifestPath);
    const replaceAppId = "replaceAppId";
    replaceIdString(androidManifestPath, replaceAppId, appId);
    const replaceCpId = "replaceCpId";
    replaceIdString(androidManifestPath, replaceCpId, cpId);

    //Java files
    var javaFilePath = templatePath+"/app/src/main/java/com/bvutest/core/pwa";

    log("PwaWebViewClient.java",2);
    const pwaWebPath = javaFilePath+"/PwaWebViewClient.java";
    replacePackageName(pwaWebPath);

    if(!enableAds && !program.analytics){
        log("PUSH :: MyPushService.java",3);
        const myPushPath = javaFilePath+"/MyPushService.java";
        replacePackageName(myPushPath);
    }else if(enableAds){
        log("ADS :: MyPushService.java",3);
        editAdOptions();
    }
    
    log("MainActivity.java",2);
    const mainActivityPath = javaFilePath+"/MainActivity.java";
    replacePackageName(mainActivityPath);
}

//editFiles() :: sub function
function replacePackageName(path){
    log("Refactor package name :: "+path,1);
    var command = `sed -i \"s/`+oldPackage+`/`+packageName +`/g\" ${path}`;
    try{
        var output = execSync(command, { encoding: 'utf-8' });
        log('success',3);
    }catch(e){
        log("error :: "+ e,3);
    }
}

//editFiles() :: sub function
function replaceIdString(path, oldString, newString){
    log("Replace ID String :: "+path,1);
    var command = `sed -i \"s/`+oldString+`/`+newString +`/g\" ${path}`;
    try{
        execSync(command, { encoding: 'utf-8' });
        log('replaceIdString :: success',3);
    }catch(e){
        log("error :: "+ e,3);
    }
}

//editFiles() :: sub function
function editAdOptions(){
    log('Modify HMS Ad Kit options',1);
    var command ='';
    var mainActivityPath = templatePath + "/app/src/main/java/com/bvutest/core/pwa/MainActivity.java";
    var stringsPath = templatePath +"/app/src/main/res/values/strings.xml";
    if(program.adsIdSplash){
        log(`Enable Splash Ad`,2);
        command = `sed -i \"s|//splashEnable|splashEnable=true;|g\" ${mainActivityPath}`;
        try{
            execSync(command, { encoding: 'utf-8' });
            log('success',3);
        }catch(e){
            log("error :: "+ e,3);
        }

        command = `sed -i \"s|splashReplace|${adsIdSplash}|g\" ${stringsPath}`;
        log(`Insert Splash Ad ID :: ${adsIdSplash}`,2);
        try{
            execSync(command, { encoding: 'utf-8' });
            log('success',3);
        }catch(e){
            log("error"+ e,3);
        }
    }

    if(program.adsIdBot || program.adsIdTop){
        log('Enable Banner Ad',2);
        command = `sed -i \"s|//bannerEnable|bannerEnable=true;|g\" ${mainActivityPath}`;
        try{
            execSync(command, { encoding: 'utf-8' });
            log('success',3);
        }catch(e){
            log("error"+ e,3);
        }

        
        var bannerReplace = "";
        if(program.adsIdTop){
            log('Set banner to top screen position',2);
            command = `sed -i \"s|//enableTopBanner|enableTopBanner=true;|g\" ${mainActivityPath}`;
            try{
                execSync(command, { encoding: 'utf-8' });
                log('success',3);
            }catch(e){
                log("error"+ e,3);
            }
            bannerReplace = adsIdTop;

        }else{
            log('Set banner to bottom screen position',2);
            bannerReplace = adsIdBot;
        }
        command = `sed -i \"s|bannerReplace|${bannerReplace}|g\" ${stringsPath}`;
        log(`Insert Banner Ad ID :: ${bannerReplace}`,2);
        try{
            execSync(command, { encoding: 'utf-8' });
            log('success',3);
        }catch(e){
            log("error :: "+ e,3);
        }
    }
}

function refactorJavaFiles(){
    log("Refactoring package name for java file path",1);

    if (program.package) {
        var basePath = "/app/src/main/java";

        var oldPackagePath = "/com/bvutest/core/pwa";
    

        log("package name :: "+ packageName,3);
        var packageString = packageName.replace(/\./g, '/');
        log("package name as path :: "+ packageString,3);
        var newPackagePath = "/"+packageString;

        var completeOldPath = templatePath+basePath+oldPackagePath;
        var completeNewPath = templatePath+basePath+newPackagePath;
        log("new path :: "+completeNewPath,3);

        try{
            fs.mkdirSync(completeNewPath, { recursive: true })
        }catch(e){
            log("create dir error :: "+ e,3);
        }

        try{
            copydir.sync(completeOldPath, completeNewPath, {
                utimes: true,  // keep add time and modify time
                mode: true,    // keep file mode
                cover: true    // cover file when exists, default is true
            });
        }catch(e){
            log("copy error :: "+ e,3);
        }

        deletePath(completeOldPath);

    }else{
        log("java file path package name refactor :: skipped",3);
    }
}

function deletePath(path){
    log("delete path :: "+ path,3);
    try{
        fsExtra.emptyDirSync(path);
    }catch(e){
        log("delete old path error :: "+ e,3);
    }
}

function buildApk(){
    log("Building APK with gradle",1);
    // var command = `gradle -p ${templatePath} app:zipApksForDebug`;
    // var apkPath = "/app/build/outputs/apk/debug/app-debug.apk";
    var apkAlignedPath = templatePath+"/app/build/outputs/apk/release/app-aligned.apk";
    var apkSignedPath = templatePath+"/app/build/outputs/apk/release/app-signed.apk";
    if(debugFlag){
        var command = `gradle -p ${templatePath} app:zipApksForDebug`;
        var apkPath = "/app/build/outputs/apk/debug/app-debug.apk";
    }else{
        var command = `gradle -p ${templatePath} app:zipApksForRelease`;
        var apkPath = "/app/build/outputs/apk/release/app-release.apk";
    }
    
    try{
        var output = execSync(command, { encoding: 'utf-8' });  // the default is 'buffer'
        log('buildApk ::\n'+output,3);
    }catch(e){
        log("error :: "+ e,3);
    }

    var apkToCopy = templatePath+apkPath;
    if(!debugFlag){
        createKeystore();
        alignApk(apkToCopy, apkAlignedPath);
        signApk(apkAlignedPath, apkSignedPath);
        apkToCopy = apkSignedPath;
    }

    if (program.output) {
        log("copy apk to output path",3);
        
        try{
            copyFile(apkToCopy, apkOutputPath+"/pwa.apk");
            copyAddtionalFiles();
        }catch(e){
            log("error :: "+ e,3);
        }

        
    }else{
        log("copy apk skipped",3);
    }
}

function createKeystore(){
    log('Generating keystore',1);
    var command = `keytool -genkey -noprompt -v -keystore ${templatePath}/pwabuilder.jks -keyalg RSA -keysize 2048 `+  
    `-validity 10000 -alias ${signAlias} -dname \"CN=${signFullname}, OU=${signOrgUnit}, O=${signOrg}, `+ 
    `C=${signCountry}\" -storepass ${signStorePass} -keypass ${signKeyPass}`;
    try{
        var output = execSync(command, { encoding: 'utf-8' });
        log('createKeystore :: '+output, 3);
    }catch(e){
        log("error :: "+ e,3);
    }

    if (program.output) {
        log("createKeystore copying keystore to output path",3);

        var sourcePath = templatePath+"/pwabuilder.jks";
        var outputPath = apkOutputPath+"/pwabuilder_keystore.jks";
        
        try{
            fs.copyFileSync(sourcePath, outputPath, (err) => {
                if (err) throw err;
                log('success',3);
            });
        }catch(e){
            log("error :: "+ e,3);
        }

        
    }else{
        log("createKeystore copy keystore skipped",3);
    }
}

function alignApk(debugPath, alignedPath){
    log('zipalign APK',1);
    var command = `zipalign -v -p 4 ${debugPath} ${alignedPath}`;
    try{
        var output = execSync(command, { encoding: 'utf-8' });
        log('success :: '+output,3);
    }catch(e){
        log("error :: "+ e,3);
    }
}

function signApk(alignedPath, signedPath){
    log('Signing APK',1);
    var command = `apksigner sign --ks ${templatePath}/pwabuilder.jks --ks-pass pass:${signKeyPass} --out ${signedPath} ${alignedPath}`;
    try{
        var output = execSync(command, { encoding: 'utf-8' });
        log('success :: '+output,3);
    }catch(e){
        log("error :: "+ e,3);
    }
}

function copyAddtionalFiles(){

    const signingInfoTemplatePath = templatePath+"/signing-key-info.txt";

    generateSigningInfo(signingInfoTemplatePath);
    copyFile(readmePath, apkOutputPath+"/Readme.html");
}

function generateSigningInfo(signingInfoTemplatePath){
    log("Generating signing info text file",1);

    var output = "";
    var command = `keytool -list -v -keystore ${templatePath}/pwabuilder.jks -alias ${signAlias}`
    + ` -storepass ${signStorePass}`;
    log(`Get SHA`,2);
    log(`${command}`,3);
    try{
        output = execSync(command, { encoding: 'utf-8' });
        log(`success`,3);
    }catch(e){
        log(`error :: ${e}`,3);
    }

    log(`Generate signing info in build path`,2);
    var file1 = fs.createWriteStream(signingInfoTemplatePath);
    file1.on('error', function(err){
        log(`error :: could not open file stream`,3);
    });
    try{
        file1.write(`Keep your this file and signing.keystore in a safe place. You'll need these files if you want to upload future versions of your PWA to the Google Play Store.\n`);
        file1.write(`Key store file: pwabuilder_keystore.jks\n`);
        file1.write(`Key store password: ${signStorePass}\n`);
        file1.write(`Key alias: ${signAlias}\n`);
        file1.write(`Key password: ${signKeyPass}\n`);
        file1.write(`Signer's full name: ${signFullname}\n`);
        file1.write(`Signer's organization: ${signOrg}\n`);
        file1.write(`Signer's organizational unit: ${signOrgUnit}\n`);
        file1.write(`Signer's country code: ${signCountry}\n\n`);

        file1.write(output+'\n');
    }catch(e){
        log(`error ${e}`,3);
    }
    file1.end();

    log(`Generate signing info in output path`,2);
    var file2 = fs.createWriteStream(apkOutputPath+"/signing-key-info.txt");
    file2.on('error', function(err){
        log(`error :: could not open file stream`,3);
    });
    try{
        file2.write(`Keep your this file and signing.keystore in a safe place. You'll need these files if you want to upload future versions of your PWA to the Google Play Store.\n`);
        file2.write(`Key store file: pwabuilder_keystore.jks\n`);
        file2.write(`Key store password: ${signStorePass}\n`);
        file2.write(`Key alias: ${signAlias}\n`);
        file2.write(`Key password: ${signKeyPass}\n`);
        file2.write(`Signer's full name: ${signFullname}\n`);
        file2.write(`Signer's organization: ${signOrg}\n`);
        file2.write(`Signer's organizational unit: ${signOrgUnit}\n`);
        file2.write(`Signer's country code: ${signCountry}\n\n`);

        file2.write(output+'\n');
    }catch(e){
        log(`error ${e}`,3);
    }
    file2.end();
}

function addWhitelist(){
    if(program.whitelist){
        log("Adding whitelist",1);
        var whitelist = [];
        var whitelistString = program.whitelist;
        try{
            whitelistString.trim().split(/\s*,\s*/).forEach(function(val,i) {
                whitelist.push(val);
                log(`whitelist item ${i} :: ${val}`,3);
            });
            log(`whitelist array :: ${whitelist}`,3);
            whitelistString="";
            whitelist.forEach(function(val,i){
                whitelistString+=`\\".${val}\\"`;
                if(i<whitelist.length-1){
                    whitelistString+=`,`;
                }
            });
            log(`whitelist string :: ${whitelistString}`,3);

        }catch(e){
            log(`error getting whitelist string from input option :: ${e}`, 3);
        }

        const filterReplace = `\\"filterReplace\\"`;
        const enableFilter = `//enableFilter`;
        const enableFilterReplace = `enableFilter=true;`
        var javaFilePath = templatePath+"/app/src/main/java/com/bvutest/core/pwa";

        replaceString(javaFilePath+"/PwaWebViewClient.java", filterReplace, whitelistString);

        replaceString(javaFilePath+"/PwaWebViewClient.java",enableFilter, enableFilterReplace);
        
    }else{
        log("Skipping whitelist",1);
    }
}

//initialize log header w/ date
//generate pwa temp and build paths w/ date
function initLog(){
    logText.push("Build Log");
    logText.push("---------");

    var today = new Date();
    var ms = today.getTime();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    var hrs = today.getHours();
    var mins = today.getHours();
    var sec = today.getSeconds();

    pwaTempPath = '/pwaTemp/'+ms;
    templatePath = '/hmsComplete/'+ms;

    today = `${mm}/${dd}/${yyyy} ${hrs}:${mins}:${sec}`;
    log(today,1);
}

//Add text to log array and print to console.
//Mode = 1, function
//Mode = 2, sub-function
//Mode = 3, progress/details
function log(text, mode){
    pushText = "";
    if(mode==1){
        pushText = `# ${text} #`;
    }else if(mode==2){
        pushText = `[ ${text} ]`;
    }else{
        pushText = `> ${text}`;
    }
    console.log(pushText);
    logText.push(pushText);

}

//Generate log files in build & output paths
function outputLog(){
    log("Log output to text file",1);
    var path = templatePath+"/log.txt";

    //Generate log in build path
    log(`Generate log in build path`,2);
    var file1 = fs.createWriteStream(path);
    file1.on('error', function(err){
        log(`error :: could not open file stream`,3);
    });
    logText.forEach(function(item,index){
        try{
            file1.write(item+'\n');
        }catch(e){
            log(`write item to log :: error`,3);
        }
    });
    file1.end();

    //Generate log in output path
    if (program.output && program.log) {
        log("Generating log in output path",2);

        path = apkOutputPath +"/log.txt";
        var file2 = fs.createWriteStream(path);
        file2.on('error', function(err){
            log(`error :: could not open file stream`,3);
        });
        logText.forEach(function(item,index){
            try{
                file2.write(item+'\n');
            }catch(e){
                log(`write item to log :: error`,3);
            }
        });
        file2.end();

    }else{
        log("Generate log in output path :: skipped",3);
    }
}