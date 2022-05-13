#############################################
https://github.com/SuvalineVana/pipecraft-vue
#############################################

Use any image from our ecosystem (https://hub.docker.com/orgs/pipecraft) by simply
running it with docker from the cli (use the -v flag to share your data to the container).

docker run --interactive --tty -v C:\Users\Name\Myfiles\:/MyfilesOnContainer pipecraft/imageName:version

## Build and push images

docker build --squash --tag pipecraft/imageName:version --file .\image_development\Dockerfile .
docker push pipecraft/imageName:version

## Run and commit(save active container as image)

docker run --interactive --tty pipecraft/imageName:version
docker commit containerID pipecraft/imageName:version

