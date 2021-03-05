# PWA Builder AppGallery - Build Script

This script calls PWA Builder CLI and generates signed HMS APK from the given URL.

## Command Line Interface

### Usage

````
node make_hms.js --package <package-name> --url <https://www.example.com/> --json <json-path> --output <output-path> --signingAlias <signing-alias> --signingFullname <signing-name> --signingOrganization <signing-organization> --signingOrganizationalUnit <signing-organizational-unit> --signingCountryCode <signing-country> --signingKeyPassword <signing-key-password> --signingStorePassword <signing-store-password> --appName <app-name>
````

### Options

|  **&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Option&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;** | **Description** |
| ----------------- | --------------- |
| `--package` | App package name |
| `--url` | URL of the hosted website. Must match URL of manifest.json if one is specified with the *--json* option. |
| `--json`  | **(optional)** Path to manifest.json file. Example can be found in template folder. |
| `--output` | Output path of generated files |
| `--signingAlias`  | Signing alias value for keystore. |
| `--signingFullname`     | Signing fullname value for keystore.  |
| `--signingOrganization`  | Signing organization value for keystore. |
| `--signingOrganizationalUnit` |  Signing organizational unit value for keystore. |
| `--signingCountryCode` | Signing country code value for keystore. |
| `--signingKeyPassword` | Signing key password value for keystore. Must be at least 6 alpha-numeric characters. |
| `--signingStorePassword` | Signing store password value for keystore. Must be at least 6 alpha-numeric characters. |
| `--appName` | App name that appears under app icon on the home screen. |
| `--log` | **(optional)** log.txt file will be generated in ouitput path. |
| `--whitelist` | **(optional)** When set, all other domains will redirect to web browser. Usage: --whitelist "ebay.com, ebayinc.com, cart.ebay.com" |
| `--icon` | **(optional)** Manually set app icon path. |
| `--analytics` | **(optional)** Enables HMS Analytics Kit. |
| `--push` | **(optional)** Enables HMS Push Kit. |
| `--adsIdSplash` | **(optional)** Enables HMS Ads Kit and displays splash ad before loading main content. |
| `--adsIdBot` | **(optional)** Enables HMS Ads Kit and places banner ad at the bottom of the screen. |
| `--adsIdTop` | **(optional)** Enables HMS Ads Kit and places banner ad at the top of the screen. |
| `--cpId` | **(required for HMS Kits)** CP ID value. Can be found in agconnect-services.json. |
| `--appId` | **(required for HMS Kits)** App ID value. Can be found in agconnect-services.json. |
| `--colorSplash` | **(optional)** Set color for splash screen. (hex format) |
| `--colorNav` | **(optional)** Set color for navigation bar. (hex format) |
| `--colorNavDivider` | **(optional)** Set color for line between navigation bar and main content. (hex format) |
| `--colorStatus` | **(optional)** Set color for status bar. (hex format) |


##  Setup


### NPM

file-system
````
npm install file-system
````
copy-dir
````
npm install copy-dir
````
mkdirp
````
npm install mkdirp
````
commander
````
npm install commander
````
constants
````
npm install constants
````
console
````
npm install console
````
fs-extra
````
npm install fs-extra
````
path
````
npm install --save path
````
dotenv
````
npm install dotenv
````

### Ubuntu

1. Install Java Development Kit (JDK) along with JRE and JVM. 
2. Install Android command line tools.
  1. Download latest version of Android command line tools for Linux. (e.g. commandlinetools-linux-6858069_latest.zip)
  2. Unzip it in android-sdk folder.
  3. Update sdkmanager with latest platform-tools.
3. Install latest Gradle and unzip into desired Gradle Path. (e.g. gradle-6.8.3-bin.zip)
4. Setup and export path for Java, Android SDK and Gradle.
5. Install ImageMagick - https://imagemagick.org/script/download.php#linux
````
sudo apt install imagemagick
````
6. Install XMLStarlet - http://xmlstar.sourceforge.net/
````
sudo apt install xmlstarlet
````

### .env file

Make sure that the PWABUILDER_PATH value is set properly to match your system.

## How APK Signing process works

1.	Create release version of APK. 
````
gradle app:zipApksForRelease
````
2.	Generate a private key. 
Automate keystore generation without user interaction with this command.
````
keytool -genkey -noprompt -v  -keystore hms-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias HMSTest -dname "CN=fname lname, OU=orgunit, O=org, L=city S=State,C=ccode"  -storepass asdf1234  -keypass asdf1234 
````
- keystore – keystore file name
- alias – alias name
- CN – firstname lastname
- OU – organizational unit
- O – organization
- L – city or locality
- S – state
- C – country code
- storepass – store password
- keypass – key password

3.	Align unsigned APK.
````
zipalign -v -p 4 source </path/unsigned.apk> </path/aligned_unsigned.apk>
````
4.	Sign APK with generated private key.
````
apksigner sign --ks </path/keystore.jks> --ks-pass pass:<keystore-password> --out </path/aligned_signed.apk> </path/aligned_unsigned.apk>
````
To verify that APK is signed:
````
apksigner verify </path/aligned_signed.apk>
````