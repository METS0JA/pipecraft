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
seqtab.nochim = list.files(pattern = "seqtab")
output = paste('/input/dada2-chimera-output/',input, sep="")

#save parameters to comma separated string
library(stringr)
parameters = paste(method, sep=', ')
parameters = str_replace_all(parameters, ', ,', ',')

#construct the full command for execution
command = paste(seqtab.nochim <- removeBimeraDenovo(seqtab, method=method, multithread=TRUE, verbose=TRUE))


#turns string into an expression, and evaluates the expression.

#show stats
command
head(out)
