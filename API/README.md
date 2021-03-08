# PWABuilder AppGallery REST Server (API)

### This is the server to provide API to build and publish Huawei AppGallery PWA APK. This project was developed on Ubuntu 18.04 environments. This service will call `util` and `CLI`, please make sure that you have install the required dependencies in both directories before running.

### Environment Requirements:
- Python 3, Pip3
- NodeJS v12+, NPM v6+
- Zip

### Requirements:
1. Install python packages
``` pip3 install -r requirements.txt ```

2. Install npm packages
```
 cd util
 npm install
```

3. Modify the environment variables in `.env`

4. Run `python3 app.py`