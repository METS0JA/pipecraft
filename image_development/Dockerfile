FROM alpine:3.10

RUN apk add build-base \
    && apk add R \
    && apk add R-dev  \
    && apk add linux-headers  \
    && apk add libjpeg-turbo-dev \
    && wget https://github.com/shenwei356/seqkit/releases/download/v2.0.0/seqkit_linux_amd64.tar.gz -O /tmp/seqkit.tar.gz  \
	&& tar zxvf /tmp/seqkit.tar.gz -C /usr/bin/ && rm /tmp/seqkit.tar.gz
ADD image_development/dada2_install.R /
RUN Rscript dada2_install.R 
RUN apk del R-dev && apk del build-base
