![Alt text](C:/Users/stena/Desktop/pipecraft/icon.png?raw=true "PipeCraft")

## Try out the alpha release

### Prerequisites:

Docker (https://www.docker.com/get-started)
        (https://docs.docker.com/engine/install/ubuntu/)
        (https://docs.docker.com/engine/install/linux-postinstall/)

Download the setup executable from this link  
https://github.com/SuvalineVana/pipecraft/releases/download/0.2.2-beta/pipecraft.Setup.0.2.2.exe

## For developers

### Prerequisites:

NodeJS https://nodejs.org/en/download/ (make sure you lets node install build tools on windows and build-essential on ubuntu)
Yarn (https://classic.yarnpkg.com/en/docs/install/#windows-stable)  
Docker: windows(https://www.docker.com/get-started)
        ubuntu and based distros ```bash
                                curl -fsSL https://get.docker.com -o get-docker.sh
                                sudo sh get-docker.sh
                                ```
        https://docs.docker.com/engine/install/linux-postinstall/          
Git (https://git-scm.com/downloads)

```bash
git clone https://github.com/SuvalineVana/pipecraft
cd pipecraft
yarn install --ignore-optional
yarn electron:serve
```

If yarn install fails on windows
```bash
yarn config set msvs_version 2019
```

