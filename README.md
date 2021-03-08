# PWABuilder AppGallery CLI and API

## What is PWABuilder AppGallery CLI and API?

### CLI
PWABuilder CLI that generates signed HMS APK from the given URL optimized for Huawei AppGallery.

### API
PWABuilder API that server build, publish APK to Huawei AppGallery.

## Purpose
PWABuilder AppGallery API provide the backend RESTful service for [PWABuilder](https://github.com/futurewei-tech/PWABuilder) to build and publish PWA APK for HUAWEI AppGallery. When a developer send a request to build HUAWEI AppGallery APK, it will be sent to PWABuilder AppGallery API, then CLI will be executed by API to build the APK and return to developer. API can also publish APK to AppGallery directly via [AppGallery Connect API](https://developer.huawei.com/consumer/en/doc/development/AppGallery-connect-References/agcapi-upload-file_v2).

## Try it
You can try building and publishing HUAWEI AppGallery APK here - [pwabuilder-ag.com](https://pwabuilder-ag.com).

> Currently API/CLI is hosted at https://api.pwabuilder-ag.com.

## Setup instruction
To setup your own complete service, you will need to install:
1. PWABuilder - clone from [github.com/futurewei-tech/PWABuilder](https://github.com/futurewei-tech/PWABuilder). This is a forked PWABuilder repository that has HUAWEI AppGallery UI and interface to build and publish AppGallery APK. Please follow README to install and run the service.
> Please do not use the [official repository](https://github.com/pwa-builder/PWABuilder).
>
> Modify [environment files](https://github.com/futurewei-tech/PWABuilder/blob/master/environments/) --> `appGalleryPackageGeneratorUrl` to point to your API service URL.
2. API - follow API/README.md instruction to run the service.
3. CLI - follow CLI/README.md instruction to prepare the environment.

> You can install all components locally, our current implementation is hosted on AWS EC2, Ubuntu 18.02.

## Need more help?

If you're otherwise stuck, we're here to help. You can email us - [developer_dtse@futurewei.com](mailto:developer_dtse@futurewei.com) and we'll help walk you through it.