Remove dangling images:
docker rmi -f $(docker images -f "dangling=true" -q)

Save container state as image
docker commit df591fca4459 name:version

Build image with dockerfile
docker build --squash --tag mothur:1.43 --file .\path\Dockerfile .

For live edit
docker run --interactive --tty  -v C:\path\to\volume:/volume  pipecraft/imageID:tag

For renaming and adding to pipecraft repo
docker tag ubuntu:latest myaccount/ubuntu:latest
docker push myaccount/ubuntu

Images added to pipecraft repo from dockerhub:

qiime2/core:2020.8 ===> pipecraft/qiime2:2020.8.0
virusx/mmseqs2:4e96669bc ===> edit and build ===> pipecraft/mmseqs2:12
tbattaglia/kraken2:latest ===> edit and build ===> pipecraft/kraken2:2.1.1
pegi3s/seqkit:0.12.1 ===> edit and build ===> pipecraft/seqkit:0.15.0
flowcraft/krona:2.7-1 ===> pipecraft/krona:2.7.1
florianbw/pavian:latest ===> pipecraft/pavian:0.1.3
