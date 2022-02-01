FROM conda/miniconda3:latest
RUN apt-get update -y
RUN apt-get install build-essential -y
RUN pip install --upgrade numpy
RUN pip install biom-format
RUN conda update --all
RUN conda install -c conda-forge deicode
RUN conda install -c qiime2 qiime2