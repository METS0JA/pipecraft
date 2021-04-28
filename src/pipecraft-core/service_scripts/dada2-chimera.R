#load dada2
library("dada2")

#check for lingering output dir and delete if needed
if (dir.exists("/input/dada2-chimera-output")) {
    unlink("/input/dada2-chimera-output", recursive=TRUE)
}

#create new output dir
dir.create('/input/dada2-chimera-output')

#load environment variables
method = Sys.getenv('method')


#define input and output file paths
seqtab <- readRDS("seqtab.rds")
seqtab.nochim <- removeBimeraDenovo(seqtab, method="consensus", multithread=FALSE, verbose=TRUE)
saveRDS(seqtab.nochim, "/input/dada2-chimera-output/seqtab.nochim.rds")
