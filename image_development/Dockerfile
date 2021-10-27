FROM ubuntu:20.10
# ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update -y
RUN apt-get install build-essential -y
RUN apt-get install pigz -y
RUN apt-get install wget -y
RUN apt-get install unzip -y
RUN apt-get install perl -y
RUN wget https://github.com/shenwei356/seqkit/releases/download/v2.0.0/seqkit_linux_amd64.tar.gz -O /tmp/seqkit.tar.gz && \
    tar zxvf /tmp/seqkit.tar.gz -C /usr/bin/ && rm /tmp/seqkit.tar.gz
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
RUN wget https://github.com/mothur/mothur/releases/download/v1.46.1/Mothur.Ubuntu_20.zip -O /tmp/mothur.zip \
    && unzip /tmp/mothur.zip -d /usr/bin/ && rm /tmp/mothur.zip
ENV PATH "$PATH:/usr/bin/mothur"


