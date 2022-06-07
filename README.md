<a href="url"><img src="https://user-images.githubusercontent.com/18046232/145723441-51c3cbd0-7caf-485c-92d3-dbe253f6a73f.png" align="center" height="210" width="210" ></a>

## Pre-release 0.1.1

https://github.com/SuvalineVana/pipecraft/releases/tag/0.1.1

**Manual**: https://pipecraft2-manual.readthedocs.io/en/stable/

---

## For developers

### Prerequisites:

NodeJS https://nodejs.org/en/download/ (make sure you lets node install build tools on windows and build-essential on ubuntu)
Yarn (https://classic.yarnpkg.com/en/docs/install/#windows-stable)  
Docker: windows(https://www.docker.com/get-started)
ubuntu and based distros `bash curl -fsSL https://get.docker.com -o get-docker.sh sudo sh get-docker.sh `
https://docs.docker.com/engine/install/linux-postinstall/  
Git (https://git-scm.com/downloads)

```bash
git clone https://github.com/SuvalineVana/pipecraft
cd pipecraft
yarn run install_pipe
yarn electron:serve
```

If yarn install fails on windows

```bash
yarn config set msvs_version 2019
```
