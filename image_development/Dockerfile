FROM conda/miniconda3
RUN apt-get update -y
RUN apt-get install build-essential -y
RUN pip install --upgrade numpy
RUN conda install -c conda-forge deicode
RUN pip install biom-format