FROM alpine:3.10

RUN apk add build-base \
    && apk add wget  \
    && apk add bash \
    && apk add git  \
    && wget https://github.com/shenwei356/seqkit/releases/download/v2.0.0/seqkit_linux_amd64.tar.gz -O /tmp/seqkit.tar.gz  \
    && tar zxvf /tmp/seqkit.tar.gz -C /usr/bin/ && rm /tmp/seqkit.tar.gz \
    && apk add perl \
    && apk add pigz
RUN wget https://microbiology.se/sw/ITSx_1.1.3.tar.gz -O /tmp/ITSx_1.1.3.tar.gz  \
    && tar zxvf /tmp/ITSx_1.1.3.tar.gz -C /usr/bin/ && rm /tmp/ITSx_1.1.3.tar.gz
RUN wget http://eddylab.org/software/hmmer/hmmer-3.3.2.tar.gz -O /tmp/hmmer-3.3.2.tar.gz  \
    && tar zxvf /tmp/hmmer-3.3.2.tar.gz -C /usr/bin/ && rm /tmp/hmmer-3.3.2.tar.gz
RUN cp /usr/bin/ITSx_1.1.3/ITSx /usr/bin
RUN cp  -R /usr/bin/ITSx_1.1.3/ITSx_db /usr/bin
RUN cd /usr/bin/hmmer-3.3.2 \
    && ./configure \
    && make \
    && make install