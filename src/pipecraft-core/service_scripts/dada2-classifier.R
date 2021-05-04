#!/usr/bin/env Rscript
#load dada2
library("dada2")

#check for lingering output dir and delete if needed
if (dir.exists("/input/dada2-classifier-output")) {
    unlink("/input/dada2-classifier-output", recursive=TRUE)
}

#create new output dir
dir.create('/input/dada2-classifier-output')

#load environment variables
database = Sys.getenv('database')


#define input and output file paths
unite.ref <- "/scripts/sh_general_release_04.02.2020.fasta"  # CHANGE ME to location on your machine
seqtab.nochim <- readRDS("seqtab.nochim.rds")
taxa <- assignTaxonomy(seqtab.nochim, unite.ref, multithread = TRUE, tryRC = TRUE)
write.csv(taxa, file="taxa.csv")

print('workingDir=/input/dada2-classifier-output')
print('fileFormat=taxtab')
print('dataFormat=demultiplexed')
print('readType=paired-end')