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
unite.ref <- "~/tax/sh_general_release_dynamic_s_01.12.2017.fasta"  # CHANGE ME to location on your machine
seqtab.nochim <- readRDS("seqtab.nochim.rds")
taxa <- assignTaxonomy(seqtab.nochim, unite.ref, multithread = TRUE, tryRC = TRUE)
